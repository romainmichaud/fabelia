import { createAdminClient }    from '@/lib/supabase/server'
import { textCompletion, parseJSONSafe, MODELS } from '@/lib/openai/client'
import { buildQuestionDetectionPrompt }          from '@/lib/openai/prompts'
import { buildPromptVariables }                  from '@/lib/openai/prompts'
import { logger }                                from '@/lib/logger'
import type { ProjectFormData }                  from '@/types'

// ============================================================
// TYPES
// ============================================================
export interface DynamicQuestionDef {
  key:         string
  label_fr:    string
  type:        'text' | 'select' | 'number' | 'boolean'
  placeholder?: string
  options?:    string[]
  why:         string
}

export interface EnrichmentResult {
  enriched:   ProjectFormData
  questions:  DynamicQuestionDef[]
  wasEnriched: boolean
}

// ============================================================
// STATIC VALIDATION RULES
// ============================================================
const REQUIRED_FIELDS: {
  key:     keyof ProjectFormData
  label:   string
  check:   (v: ProjectFormData) => boolean
}[] = [
  {
    key:   'childName',
    label: 'Le prénom de l\'enfant est obligatoire',
    check: (v) => !!v.childName?.trim(),
  },
  {
    key:   'childAge',
    label: 'L\'âge de l\'enfant est obligatoire',
    check: (v) => !!v.childAge && v.childAge >= 2 && v.childAge <= 12,
  },
  {
    key:   'theme',
    label: 'Le thème de l\'aventure est obligatoire',
    check: (v) => !!v.theme,
  },
  {
    key:   'personalities',
    label: 'Choisissez au moins un trait de personnalité',
    check: (v) => (v.personalities?.length ?? 0) >= 1,
  },
]

// ============================================================
// SERVICE
// ============================================================
export const questionEngineService = {

  // ----------------------------------------------------------
  // VALIDATE REQUIRED FIELDS
  // ----------------------------------------------------------
  validate(formData: ProjectFormData): { valid: boolean; missing: string[] } {
    const missing = REQUIRED_FIELDS
      .filter(rule => !rule.check(formData))
      .map(rule => rule.label)

    return { valid: missing.length === 0, missing }
  },

  // ----------------------------------------------------------
  // DETECT ENRICHMENT OPPORTUNITIES (AI-powered)
  // ----------------------------------------------------------
  async detectEnrichmentQuestions(
    projectId: string,
    formData:  ProjectFormData,
  ): Promise<DynamicQuestionDef[]> {
    const log  = logger.child({ service: 'questionEngine', projectId })
    const vars = buildPromptVariables(formData)

    log.info('detecting enrichment questions')

    try {
      const { content } = await textCompletion({
        model:          MODELS.questions,
        systemPrompt:   'Tu génères des questions pour enrichir des livres personnalisés pour enfants. Sois concis et pertinent.',
        userPrompt:     buildQuestionDetectionPrompt(vars),
        temperature:    0.5,
        maxTokens:      600,
        responseFormat: 'json_object',
        context:        { projectId },
      })

      const parsed = parseJSONSafe<{ questions: DynamicQuestionDef[] }>(content)
      log.info('enrichment questions detected', { count: parsed.questions.length })

      return parsed.questions ?? []
    } catch (err) {
      log.warn('failed to detect enrichment questions (non-critical)', {}, err as Error)
      return []
    }
  },

  // ----------------------------------------------------------
  // SAVE ANSWERS TO dynamic_answers TABLE
  // Columns: project_id, question_key, answer_value
  // ----------------------------------------------------------
  async saveAnswers(
    projectId: string,
    answers:   Record<string, string>,
  ): Promise<void> {
    const supabase = createAdminClient()
    const log      = logger.child({ service: 'questionEngine', projectId })

    const rows = Object.entries(answers).map(([question_key, answer_value]) => ({
      project_id: projectId,
      question_key,
      answer_value,
    }))

    if (!rows.length) return

    // Delete existing answers then insert fresh (avoids needing a unique constraint)
    await supabase.from('dynamic_answers').delete().eq('project_id', projectId)
    const { error } = await supabase.from('dynamic_answers').insert(rows)

    if (error) {
      log.error('failed to save dynamic answers', {}, error as Error)
      throw error
    }

    log.info('dynamic answers saved', { count: rows.length })
  },

  // ----------------------------------------------------------
  // LOAD AND MERGE DYNAMIC ANSWERS INTO FORM DATA
  // ----------------------------------------------------------
  async mergeAnswers(
    projectId: string,
    formData:  ProjectFormData,
  ): Promise<ProjectFormData> {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('dynamic_answers')
      .select('question_key, answer_value')
      .eq('project_id', projectId)

    if (error || !data?.length) return formData

    const extras = Object.fromEntries(
      data.map(row => {
        let value: unknown = row.answer_value
        // Parse JSON-encoded array fields back to arrays
        if (row.question_key === 'personalities' && typeof value === 'string') {
          try { value = JSON.parse(value) } catch { value = [] }
        }
        return [row.question_key, value]
      })
    )

    return { ...formData, ...extras } as ProjectFormData
  },

  // ----------------------------------------------------------
  // GET ACTIVE QUESTIONS (from `questions` table)
  // ----------------------------------------------------------
  async getActiveQuestions(): Promise<{
    id:        string
    key:       string
    label:     string
    field_type: string
    options:   unknown
    sort_order: number
  }[]> {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('questions')
      .select('id, key, label, field_type, options, sort_order')
      .eq('is_active', true)
      .order('sort_order')

    if (error) {
      logger.warn('questionEngine — failed to load active questions', {}, error as Error)
      return []
    }

    return data ?? []
  },

  // ----------------------------------------------------------
  // NORMALIZE: convert answers map → ProjectFormData fields
  // ----------------------------------------------------------
  normalizeInputs(answers: Record<string, string>): Partial<ProjectFormData> {
    return {
      childName:     answers['childName'],
      childAge:      answers['childAge'] ? Number(answers['childAge']) : undefined,
      childGender:   answers['childGender'] as ProjectFormData['childGender'],
      hairColor:     answers['hairColor']  as ProjectFormData['hairColor'],
      eyeColor:      answers['eyeColor']   as ProjectFormData['eyeColor'],
      skinTone:      answers['skinTone']   as ProjectFormData['skinTone'],
      hasGlasses:    answers['hasGlasses'] === 'true',
      personalities: answers['personalities']
        ? JSON.parse(answers['personalities'])
        : undefined,
      dedication:    answers['dedication'],
      senderName:    answers['senderName'],
    }
  },
}
