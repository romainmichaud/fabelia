import { createAdminClient }      from '@/lib/supabase/server'
import { generateImage }           from '@/lib/openai/client'
import { promptBuilderService }    from './promptBuilderService'
import { promptScoringService }    from './promptScoringService'
import { questionEngineService }   from './questionEngineService'
import { logger }                  from '@/lib/logger'
import { sleep }                   from '@/lib/retry'
import type { ProjectFormData, GenerationStatus } from '@/types'
import type { GeneratedChapter }   from './promptBuilderService'

// ============================================================
// TYPES
// ============================================================
export interface FullBookResult {
  projectId:   string
  pageCount:   number
  imageCount:  number
  durationMs:  number
}

export interface GenerationProgress {
  status:          GenerationStatus
  currentStep:     string
  pagesGenerated:  number
  totalPages:      number
  imagesGenerated: number
  totalImages:     number
  errorMessage?:   string
}

// Visual consistency seed — all illustrations use same style descriptor
const VISUAL_STYLE = [
  'children\'s picture book illustration',
  'warm soft colors',
  'detailed character design',
  'consistent art style throughout',
  'magical atmosphere',
  'safe for children',
].join(', ')

// ============================================================
// SERVICE
// ============================================================
export const generationService = {

  // ----------------------------------------------------------
  // TRIGGER — called by payment webhook
  // ----------------------------------------------------------
  async trigger(projectId: string, orderId: string): Promise<void> {
    const supabase = createAdminClient()
    const log      = logger.child({ service: 'generation', projectId, orderId })

    log.info('generation triggered by payment')

    await supabase
      .from('book_projects')
      .update({ generation_status: 'queued' })
      .eq('id', projectId)

    // In production: push to a proper queue (Upstash QStash, etc.)
    generationService
      .runFullGeneration(projectId)
      .catch(err => {
        log.error('generation pipeline crashed', {}, err)
        generationService.handleFailure(projectId, err)
      })
  },

  // ----------------------------------------------------------
  // MAIN PIPELINE
  // ----------------------------------------------------------
  async runFullGeneration(projectId: string): Promise<FullBookResult> {
    const supabase   = createAdminClient()
    const log        = logger.child({ service: 'generation', projectId })
    const startTime  = Date.now()

    log.info('full generation pipeline start')

    try {
      // ——— Load project ———
      const { data: project, error: projErr } = await supabase
        .from('book_projects')
        .select('id, theme, language, generation_status')
        .eq('id', projectId)
        .single()

      if (projErr || !project) {
        throw new Error(`Project ${projectId} not found`)
      }

      // Reconstruct form data from dynamic_answers
      const formData    = await generationService.reconstructFormData(projectId, project.theme)
      const enrichedData = await questionEngineService.mergeAnswers(projectId, formData)
      const vars        = promptBuilderService.getVariables(enrichedData)
      const version     = await promptBuilderService.getActiveVersion('story')

      // ——— PHASE 1: Generate all chapters ———
      log.info('phase 1 — generating all chapters')
      await generationService.updateStatus(projectId, 'generating_text', supabase)

      const { content: fullStoryContent, sessionId } =
        await promptBuilderService.buildAndRun(
          projectId, enrichedData, false, version.id, 1
        )

      const story = promptBuilderService.parseStory(fullStoryContent)

      // Score full story
      const { finalScore, passed, content: bestContent } =
        await promptScoringService.scoreLoop({
          projectId,
          sessionId,
          content:   fullStoryContent,
          vars,
          onImprove: async (improvements, attempt, prev) =>
            promptBuilderService.buildAndRun(
              projectId, enrichedData, false, version.id, attempt, prev
            ),
        })

      const bestStory = promptBuilderService.parseStory(bestContent)

      log.info('chapters generated', {
        chapters:  bestStory.chapters.length,
        score:     finalScore.overall,
        passed,
      })

      // ——— PHASE 2: Save pages to DB ———
      const pageRows = generationService.buildPageRows(projectId, bestStory)
      const { data: savedPages } = await supabase
        .from('book_pages')
        .insert(pageRows)
        .select('id, page_number, page_type')

      log.info('pages saved', { count: savedPages?.length ?? 0 })

      // ——— PHASE 3: Generate illustrations ———
      log.info('phase 2 — generating illustrations')
      await generationService.updateStatus(projectId, 'generating_images', supabase)

      const illustrationPages = bestStory.chapters.map((ch, i) => ({
        chapter:    ch,
        pageNumber: 3 + i * 7,
        savedPage:  savedPages?.find(p => p.page_number === 3 + i * 7),
      }))

      const imageResults: { pageId: string | null; url: string; prompt: string }[] = []

      for (const { chapter, pageNumber, savedPage } of illustrationPages) {
        try {
          const prompt = promptBuilderService.buildIllustrationPrompt(
            vars,
            chapter.key_scene,
            pageNumber,
          )

          const enhancedPrompt = `${prompt} Style: ${VISUAL_STYLE}.`

          const img = await generateImage({
            prompt:  enhancedPrompt,
            size:    '1024x1024',
            quality: 'hd',
            style:   'vivid',
            context: { projectId, chapterNumber: chapter.number },
          })

          imageResults.push({
            pageId: savedPage?.id ?? null,
            url:    img.url,
            prompt: enhancedPrompt,
          })

          log.info('illustration generated', { chapter: chapter.number })
          await sleep(500)
        } catch (err) {
          log.warn('illustration failed (non-fatal)', { chapter: chapter.number }, err as Error)
        }
      }

      // Save illustrations
      if (imageResults.length > 0) {
        await supabase.from('book_images').insert(
          imageResults.map(ir => ({
            project_id:   projectId,
            page_id:      ir.pageId,
            url:          ir.url,
            storage_path: ir.url,
            is_cover:     false,
            is_selected:  false,
            prompt_used:  ir.prompt,
          }))
        )
      }

      log.info('illustrations generated', { count: imageResults.length })

      // ——— PHASE 4: Assemble ———
      log.info('phase 3 — assembling')
      await generationService.updateStatus(projectId, 'assembling', supabase)
      await sleep(200)

      // ——— Mark complete ———
      await supabase
        .from('book_projects')
        .update({
          generation_status: 'completed',
          is_book_ready:     true,
        })
        .eq('id', projectId)

      const durationMs = Date.now() - startTime
      log.info('full generation complete', {
        pages:      pageRows.length,
        images:     imageResults.length,
        durationMs,
      })

      return {
        projectId,
        pageCount:   pageRows.length,
        imageCount:  imageResults.length,
        durationMs,
      }
    } catch (err) {
      await generationService.handleFailure(projectId, err as Error)
      throw err
    }
  },

  // ----------------------------------------------------------
  // BUILD PAGE ROWS
  // ----------------------------------------------------------
  buildPageRows(
    projectId: string,
    story:     { title: string; chapters: GeneratedChapter[]; back_cover_text: string },
  ) {
    const rows: {
      project_id:    string
      page_number:   number
      page_type:     'cover' | 'dedication' | 'chapter' | 'illustration' | 'back_cover'
      content_text:  string | null
      chapter_title: string | null
      layout:        string
      metadata:      Record<string, string | number>
    }[] = []

    // Cover
    rows.push({
      project_id:    projectId,
      page_number:   0,
      page_type:     'cover',
      content_text:  story.title,
      chapter_title: null,
      layout:        'cover-full',
      metadata:      {},
    })

    let pageNum = 1

    for (const chapter of story.chapters) {
      rows.push({
        project_id:    projectId,
        page_number:   pageNum++,
        page_type:     'chapter',
        content_text:  chapter.content,
        chapter_title: chapter.title,
        layout:        'chapter-text',
        metadata:      { chapterNumber: chapter.number },
      })

      rows.push({
        project_id:    projectId,
        page_number:   pageNum++,
        page_type:     'illustration',
        content_text:  null,
        chapter_title: null,
        layout:        'full-illustration',
        metadata:      { chapterNumber: chapter.number, scene: chapter.key_scene },
      })
    }

    // Back cover
    rows.push({
      project_id:    projectId,
      page_number:   pageNum,
      page_type:     'back_cover',
      content_text:  story.back_cover_text,
      chapter_title: null,
      layout:        'back-cover',
      metadata:      {},
    })

    return rows
  },

  // ----------------------------------------------------------
  // RECONSTRUCT FormData from dynamic_answers
  // ----------------------------------------------------------
  async reconstructFormData(
    projectId: string,
    theme:     string | null,
  ): Promise<ProjectFormData> {
    const supabase = createAdminClient()

    const { data: answers } = await supabase
      .from('dynamic_answers')
      .select('question_key, answer_value')
      .eq('project_id', projectId)

    const map: Record<string, string> = {}
    for (const row of answers ?? []) {
      if (row.answer_value != null) map[row.question_key] = row.answer_value
    }

    return {
      theme:         (theme as ProjectFormData['theme']) ?? undefined,
      childName:     map['childName'],
      childAge:      map['childAge'] ? parseInt(map['childAge']) : undefined,
      childGender:   (map['childGender'] as ProjectFormData['childGender']) ?? undefined,
      hairColor:     (map['hairColor']   as ProjectFormData['hairColor'])   ?? undefined,
      eyeColor:      (map['eyeColor']    as ProjectFormData['eyeColor'])    ?? undefined,
      skinTone:      (map['skinTone']    as ProjectFormData['skinTone'])    ?? undefined,
      hasGlasses:    map['hasGlasses'] === 'true',
      personalities: map['personalities']
        ? (JSON.parse(map['personalities']) as ProjectFormData['personalities'])
        : undefined,
      dedication:    map['dedication'],
      senderName:    map['senderName'],
    }
  },

  // ----------------------------------------------------------
  // UPDATE STATUS HELPER
  // ----------------------------------------------------------
  async updateStatus(
    projectId: string,
    status:    GenerationStatus,
    supabase:  ReturnType<typeof createAdminClient>,
  ): Promise<void> {
    await supabase
      .from('book_projects')
      .update({ generation_status: status })
      .eq('id', projectId)

    logger.debug('generation status updated', { projectId, status })
  },

  // ----------------------------------------------------------
  // GET GENERATION STATUS (for polling)
  // ----------------------------------------------------------
  async getStatus(projectId: string): Promise<GenerationProgress> {
    const supabase = createAdminClient()

    const { data: project } = await supabase
      .from('book_projects')
      .select('generation_status, is_book_ready, error_message')
      .eq('id', projectId)
      .single()

    if (!project) {
      return {
        status:          'failed',
        currentStep:     'Projet introuvable',
        pagesGenerated:  0, totalPages: 0,
        imagesGenerated: 0, totalImages: 0,
        errorMessage: 'Project not found',
      }
    }

    const { count: imageCount } = await supabase
      .from('book_images')
      .select('id', { count: 'exact', head: true })
      .eq('project_id', projectId)

    const { count: pageCount } = await supabase
      .from('book_pages')
      .select('id', { count: 'exact', head: true })
      .eq('project_id', projectId)

    const statusLabels: Record<GenerationStatus, string> = {
      idle:              'En attente',
      queued:            'Dans la file d\'attente…',
      generating_text:   'Écriture de l\'histoire…',
      generating_images: 'Création des illustrations…',
      assembling:        'Assemblage du livre…',
      completed:         'Livre prêt !',
      failed:            'Erreur de génération',
    }

    return {
      status:          project.generation_status as GenerationStatus,
      currentStep:     statusLabels[project.generation_status as GenerationStatus] ?? '',
      pagesGenerated:  pageCount  ?? 0,
      totalPages:      30,
      imagesGenerated: imageCount ?? 0,
      totalImages:     4,
      errorMessage:    project.error_message ?? undefined,
    }
  },

  // ----------------------------------------------------------
  // HANDLE FAILURE
  // ----------------------------------------------------------
  async handleFailure(projectId: string, error: Error): Promise<void> {
    const supabase = createAdminClient()

    logger.error('generation pipeline failed', { projectId }, error)

    await supabase
      .from('book_projects')
      .update({ generation_status: 'failed', error_message: error.message })
      .eq('id', projectId)

    await supabase.from('support_tickets').insert({
      project_id: projectId,
      subject:    `[AUTO] Génération échouée — projet ${projectId}`,
      status:     'open',
      priority:   'urgent',
    })
  },

  // ----------------------------------------------------------
  // ADMIN: RETRY GENERATION
  // ----------------------------------------------------------
  async retryGeneration(projectId: string): Promise<void> {
    const supabase = createAdminClient()
    logger.info('retrying generation (admin)', { projectId })

    await supabase
      .from('book_projects')
      .update({ generation_status: 'queued', is_book_ready: false })
      .eq('id', projectId)

    generationService
      .runFullGeneration(projectId)
      .catch(err => generationService.handleFailure(projectId, err))
  },

  // ----------------------------------------------------------
  // ADMIN: REGENERATE A SINGLE ILLUSTRATION
  // ----------------------------------------------------------
  async regenerateIllustration(
    projectId: string,
    pageId:    string,
  ): Promise<string> {
    const supabase = createAdminClient()
    const log      = logger.child({ service: 'generation', projectId, pageId })

    log.info('regenerating single illustration')

    const { data: page } = await supabase
      .from('book_pages')
      .select('metadata, page_number')
      .eq('id', pageId)
      .single()

    if (!page) throw new Error(`Page ${pageId} not found`)

    const { data: project } = await supabase
      .from('book_projects')
      .select('theme')
      .eq('id', projectId)
      .single()

    if (!project) throw new Error(`Project ${projectId} not found`)

    const formData = await generationService.reconstructFormData(projectId, project.theme)
    const enriched = await questionEngineService.mergeAnswers(projectId, formData)
    const vars     = promptBuilderService.getVariables(enriched)
    const scene    = (page.metadata as { scene?: string })?.scene ?? 'a magical adventure scene'

    const prompt = promptBuilderService.buildIllustrationPrompt(vars, scene, page.page_number)
    const img    = await generateImage({
      prompt:  `${prompt} Style: ${VISUAL_STYLE}.`,
      size:    '1024x1024',
      quality: 'hd',
      context: { projectId, pageId },
    })

    await supabase
      .from('book_images')
      .upsert({
        project_id:   projectId,
        page_id:      pageId,
        url:          img.url,
        storage_path: img.url,
        is_cover:     false,
        prompt_used:  prompt,
      }, { onConflict: 'page_id' })

    log.info('illustration regenerated', { url: img.url })
    return img.url
  },

  // ----------------------------------------------------------
  // ADMIN: REGENERATE A COVER
  // ----------------------------------------------------------
  async regenerateCover(
    projectId: string,
    styleId:   string,
  ): Promise<string> {
    const supabase = createAdminClient()
    const log      = logger.child({ service: 'generation', projectId, styleId })

    const { data: project } = await supabase
      .from('book_projects')
      .select('theme')
      .eq('id', projectId)
      .single()

    if (!project) throw new Error(`Project ${projectId} not found`)

    const formData = await generationService.reconstructFormData(projectId, project.theme)
    const enriched = await questionEngineService.mergeAnswers(projectId, formData)
    const vars     = promptBuilderService.getVariables(enriched)
    const covers   = promptBuilderService.buildCoverPrompts(vars)
    const cover    = covers.find(c => c.id === styleId)

    if (!cover) throw new Error(`Cover style ${styleId} not found`)

    const img = await generateImage({
      prompt:  cover.prompt,
      size:    '1024x1792',
      quality: 'hd',
      context: { projectId, styleId },
    })

    await supabase.from('book_images').upsert({
      project_id:   projectId,
      url:          img.url,
      storage_path: img.url,
      style:        styleId,
      is_cover:     true,
      is_selected:  false,
      prompt_used:  cover.prompt,
    }, { onConflict: 'project_id,style' })

    log.info('cover regenerated', { styleId })
    return img.url
  },
}
