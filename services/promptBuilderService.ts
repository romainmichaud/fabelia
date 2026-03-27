import { createAdminClient }     from '@/lib/supabase/server'
import { textCompletion, parseJSONSafe, MODELS } from '@/lib/openai/client'
import {
  buildPromptVariables,
  buildStoryPrompt,
  buildCoverImagePrompt,
  buildIllustrationPrompt,
  buildImprovementPrompt,
  STORY_SYSTEM_PROMPT,
  COVER_STYLES,
  type PromptVariables,
} from '@/lib/openai/prompts'
import { logger } from '@/lib/logger'
import type { ProjectFormData } from '@/types'

// ============================================================
// TYPES
// ============================================================
export interface GeneratedChapter {
  number:              number
  title:               string
  content:             string
  illustration_prompt: string
  key_scene:           string
}

export interface GeneratedStory {
  title:           string
  chapters:        GeneratedChapter[]
  back_cover_text: string
  metadata:        { word_count: number; themes_explored: string[]; moral_lesson: string }
}

export interface BuildResult {
  story:        GeneratedStory
  sessionId:    string
  tokensUsed:   number
  durationMs:   number
  attemptCount: number
}

// ============================================================
// SERVICE
// ============================================================
export const promptBuilderService = {

  // ----------------------------------------------------------
  // BUILD STORY PROMPT AND EXECUTE
  // ----------------------------------------------------------
  async buildAndRun(
    projectId: string,
    formData:  ProjectFormData,
    isPreview: boolean,
    versionId: string,
    attempt:   number = 1,
    previousImprovement?: string,
  ): Promise<{ content: string; sessionId: string; tokensUsed: number; durationMs: number }> {
    const supabase  = createAdminClient()
    const log       = logger.child({ service: 'promptBuilder', projectId, attempt })
    const vars      = buildPromptVariables(formData)
    const userPrompt = previousImprovement
      ? buildImprovementPrompt(previousImprovement, [], vars)
      : buildStoryPrompt(vars, isPreview ? 1 : undefined)

    log.info('building story prompt', { isPreview, hasImprovement: !!previousImprovement })

    const result = await textCompletion({
      model:          MODELS.story,
      systemPrompt:   STORY_SYSTEM_PROMPT,
      userPrompt,
      temperature:    0.82,
      maxTokens:      isPreview ? 2000 : 6000,
      responseFormat: 'json_object',
      context:        { projectId, attempt },
    })

    // Persist session to DB
    const { data: session, error } = await supabase
      .from('prompt_sessions')
      .insert({
        project_id:      projectId,
        version_id:      versionId === 'fallback' ? null : versionId,
        resolved_prompt: userPrompt,
        response:        result.content,
        tokens_used:     result.tokensUsed,
        latency_ms:      result.durationMs,
        use_case:        isPreview ? 'preview' : 'story',
      })
      .select('id')
      .single()

    if (error) {
      log.warn('failed to persist prompt session', {}, error as Error)
    }

    log.info('prompt session saved', { sessionId: session?.id, tokens: result.tokensUsed })

    return {
      content:    result.content,
      sessionId:  session?.id ?? 'unknown',
      tokensUsed: result.tokensUsed,
      durationMs: result.durationMs,
    }
  },

  // ----------------------------------------------------------
  // PARSE STORY JSON
  // ----------------------------------------------------------
  parseStory(rawContent: string): GeneratedStory {
    try {
      return parseJSONSafe<GeneratedStory>(rawContent)
    } catch (err) {
      logger.error('promptBuilder — failed to parse story JSON', {}, err as Error)
      throw new Error(`Invalid story JSON from AI: ${(err as Error).message}`)
    }
  },

  // ----------------------------------------------------------
  // GET ACTIVE PROMPT VERSION
  // ----------------------------------------------------------
  async getActiveVersion(useCase: string): Promise<{ id: string; name: string }> {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('prompt_versions')
      .select('id, name')
      .eq('use_case', useCase)
      .eq('is_active', true)
      .order('version', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) {
      // Return a fallback if no version configured
      logger.warn('promptBuilder — no active version found, using fallback', { useCase })
      return { id: 'fallback', name: 'fallback-v1' }
    }

    return data
  },

  // ----------------------------------------------------------
  // BUILD COVER IMAGE PROMPTS (4 styles)
  // ----------------------------------------------------------
  buildCoverPrompts(vars: PromptVariables): { id: string; label: string; prompt: string }[] {
    return COVER_STYLES.map(style => ({
      id:     style.id,
      label:  style.label,
      prompt: buildCoverImagePrompt(vars, style),
    }))
  },

  // ----------------------------------------------------------
  // BUILD ILLUSTRATION PROMPT
  // ----------------------------------------------------------
  buildIllustrationPrompt(
    vars:    PromptVariables,
    scene:   string,
    pageNum: number,
  ): string {
    return buildIllustrationPrompt(vars, scene, pageNum)
  },

  // ----------------------------------------------------------
  // EXTRACT VARIABLES from form data
  // ----------------------------------------------------------
  getVariables: buildPromptVariables,
}
