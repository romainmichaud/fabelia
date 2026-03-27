import { createAdminClient }      from '@/lib/supabase/server'
import { generateImage }           from '@/lib/openai/client'
import { promptBuilderService }    from './promptBuilderService'
import { promptScoringService }    from './promptScoringService'
import { questionEngineService }   from './questionEngineService'
import { logger }                  from '@/lib/logger'
import type { ProjectFormData }    from '@/types'

// ============================================================
// TYPES
// ============================================================
export interface PreviewResult {
  previewId:        string
  chapterExcerpt:   string
  chapterTitle:     string
  coverImages:      { id: string; label: string; url: string }[]
  illustrationUrl:  string
  expiresAt:        string
  score:            number
  passed:           boolean
}

// ============================================================
// SERVICE
// ============================================================
export const previewService = {

  // ----------------------------------------------------------
  // MAIN: generate full preview (chapter + covers + illustration)
  // ----------------------------------------------------------
  async generate(
    projectId: string,
    formData:  ProjectFormData,
  ): Promise<PreviewResult> {
    const supabase = createAdminClient()
    const log      = logger.child({ service: 'preview', projectId })

    log.info('preview generation start')

    // Mark project as generating
    await supabase
      .from('book_projects')
      .update({ generation_status: 'generating_text' })
      .eq('id', projectId)

    // Enrich form data with any saved dynamic answers
    const enrichedData = await questionEngineService.mergeAnswers(projectId, formData)
    const vars         = promptBuilderService.getVariables(enrichedData)

    // ——— 1. Get active prompt version ———
    const version = await promptBuilderService.getActiveVersion('preview')

    // ——— 2. Generate chapter 1 + scoring loop ———
    log.info('generating chapter 1')

    const storyResult = await promptBuilderService.buildAndRun(
      projectId,
      enrichedData,
      true,  // isPreview
      version.id,
      1,
    )

    const story = promptBuilderService.parseStory(storyResult.content)
    const chapter1 = story.chapters[0]
    if (!chapter1) throw new Error('Preview: chapter 1 not generated')

    // Scoring loop
    const { finalScore, passed, content: finalContent, sessionId } =
      await promptScoringService.scoreLoop({
        projectId,
        sessionId: storyResult.sessionId,
        content:   storyResult.content,
        vars,
        onImprove: async (improvements, attempt, previousContent) => {
          return promptBuilderService.buildAndRun(
            projectId,
            enrichedData,
            true,
            version.id,
            attempt,
            previousContent,
          )
        },
      })

    // Re-parse best content
    const bestStory = promptBuilderService.parseStory(finalContent)
    const bestChapter = bestStory.chapters[0]

    // ——— 3. Generate 4 cover images (in parallel) ———
    log.info('generating 4 cover images')
    await supabase
      .from('book_projects')
      .update({ generation_status: 'generating_images' })
      .eq('id', projectId)

    const coverPrompts = promptBuilderService.buildCoverPrompts(vars)

    const coverResults = await Promise.allSettled(
      coverPrompts.map(cp =>
        generateImage({
          prompt:  cp.prompt,
          size:    '1024x1792',   // Portrait for book cover
          quality: 'hd',
          style:   'vivid',
          context: { projectId, coverStyle: cp.id },
        }).then(r => ({ id: cp.id, label: cp.label, url: r.url }))
      )
    )

    const coverImages = coverResults
      .filter((r): r is PromiseFulfilledResult<{ id: string; label: string; url: string }> =>
        r.status === 'fulfilled'
      )
      .map(r => r.value)

    if (coverImages.length === 0) {
      throw new Error('All cover image generations failed')
    }

    // ——— 4. Generate 1 illustration ———
    log.info('generating illustration')

    const illustPrompt = promptBuilderService.buildIllustrationPrompt(
      vars,
      bestChapter.key_scene,
      3,
    )

    const illustration = await generateImage({
      prompt:  illustPrompt,
      size:    '1024x1024',
      quality: 'hd',
      context: { projectId, type: 'preview_illustration' },
    }).catch(err => {
      log.warn('illustration generation failed (non-fatal)', {}, err)
      return null
    })

    // ——— 5. Persist preview ———
    log.info('persisting preview')

    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()

    // Delete existing preview then insert fresh (avoids needing a unique constraint)
    await supabase.from('book_previews').delete().eq('project_id', projectId)

    const { data: preview, error: previewError } = await supabase
      .from('book_previews')
      .insert({
        project_id:       projectId,
        chapter_excerpt:  bestChapter.content,
        chapter_title:    bestChapter.title,
        illustration_url: illustration?.url ?? null,
        expires_at:       expiresAt,
        score:            finalScore.overall,
        passed,
        is_active:        true,
      })
      .select('id')
      .single()

    if (previewError) {
      log.error('failed to persist preview', {}, previewError as Error)
      throw previewError
    }

    // Store cover images in book_images
    const coverImageRows = coverImages.map(c => ({
      project_id:   projectId,
      url:          c.url,
      storage_path: c.url,
      is_cover:     true,
      is_selected:  false,
      style:        c.id,
      prompt_used:  coverPrompts.find(cp => cp.id === c.id)?.prompt ?? '',
    }))

    await supabase.from('book_images').insert(coverImageRows)

    // Mark preview as ready
    await supabase
      .from('book_projects')
      .update({
        generation_status:  'completed',
        is_preview_ready:   true,
        title:              bestStory.title,
      })
      .eq('id', projectId)

    log.info('preview generation complete', {
      previewId:   preview!.id,
      coverCount:  coverImages.length,
      hasIllus:    !!illustration,
      score:       finalScore.overall,
      passed,
    })

    return {
      previewId:       preview!.id,
      chapterExcerpt:  bestChapter.content,
      chapterTitle:    bestChapter.title,
      coverImages,
      illustrationUrl: illustration?.url ?? '',
      expiresAt,
      score:           finalScore.overall,
      passed,
    }
  },

  // ----------------------------------------------------------
  // GET EXISTING PREVIEW
  // ----------------------------------------------------------
  async get(projectId: string) {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('book_previews')
      .select('*')
      .eq('project_id', projectId)
      .eq('is_active', true)
      .single()

    if (error) return null
    if (new Date(data.expires_at) < new Date()) return null

    return data
  },

  // ----------------------------------------------------------
  // REFRESH EXPIRED PREVIEW
  // ----------------------------------------------------------
  async refresh(projectId: string, formData: ProjectFormData): Promise<PreviewResult> {
    logger.info('refreshing preview', { projectId })
    return previewService.generate(projectId, formData)
  },
}
