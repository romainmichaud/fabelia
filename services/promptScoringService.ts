import { createAdminClient }     from '@/lib/supabase/server'
import { textCompletion, parseJSONSafe, MODELS } from '@/lib/openai/client'
import { buildScoringPrompt }    from '@/lib/openai/prompts'
import { logger }                from '@/lib/logger'
import type { PromptVariables }  from '@/lib/openai/prompts'

// ============================================================
// TYPES
// ============================================================
export interface ScoreDimensions {
  personalisation:      number   // 0-5
  coherence:            number
  age_appropriateness:  number
  emotional_depth:      number
  creativity:           number
  safety:               number
}

export interface ScoringResult {
  scores:       ScoreDimensions
  overall:      number
  passed:       boolean          // overall >= 4.5 AND safety == 5.0
  issues:       string[]
  improvements: string[]
  missing_data: string[]
}

export interface ScoringRecord {
  id:          string
  session_id:  string
  score:       number
  dimensions:  ScoreDimensions
  status:      'pending' | 'scored' | 'flagged' | 'archived'
  result:      ScoringResult
}

const PASS_THRESHOLD    = 4.5
const SAFETY_THRESHOLD  = 5.0
const MAX_RETRY_LOOPS   = 3

// ============================================================
// SERVICE
// ============================================================
export const promptScoringService = {

  // ----------------------------------------------------------
  // SCORE A PROMPT SESSION OUTPUT
  // ----------------------------------------------------------
  async score(
    sessionId:    string,
    content:      string,
    vars:         PromptVariables,
  ): Promise<ScoringResult> {
    const supabase = createAdminClient()
    const log      = logger.child({ service: 'promptScoring', sessionId })

    log.info('scoring session')

    const scoringPrompt = buildScoringPrompt(content, vars)

    const { content: rawScore } = await textCompletion({
      model:          MODELS.scoring,
      systemPrompt:   'Tu es un expert en littérature jeunesse. Évalue strictement et objectivement.',
      userPrompt:     scoringPrompt,
      temperature:    0.2,       // Low temp for consistent scoring
      maxTokens:      1000,
      responseFormat: 'json_object',
      context:        { sessionId },
    })

    const result = parseJSONSafe<ScoringResult>(rawScore)

    // Recalculate overall from dimensions (don't trust AI's self-reported overall)
    const dims   = result.scores
    const values = Object.values(dims)
    result.overall = parseFloat(
      (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)
    )

    // Safety is binary: any violence/inappropriate = auto-fail
    result.passed = result.overall >= PASS_THRESHOLD && dims.safety >= SAFETY_THRESHOLD

    // Persist score
    const { data: scoreRecord, error } = await supabase
      .from('prompt_scores')
      .insert({
        session_id:  sessionId,
        score:       result.overall,
        dimensions:  dims as unknown as Record<string, number>,
        status:      result.passed ? 'scored' : (dims.safety < SAFETY_THRESHOLD ? 'flagged' : 'scored'),
      })
      .select('id')
      .single()

    if (error) {
      log.warn('failed to persist score', {}, error as Error)
    }

    log.info('scoring complete', {
      scoreId:  scoreRecord?.id,
      overall:  result.overall,
      passed:   result.passed,
      issues:   result.issues.length,
    })

    // If safety flagged → alert admin immediately
    if (dims.safety < SAFETY_THRESHOLD) {
      log.error('SAFETY FLAG — content may be inappropriate', {
        sessionId,
        safetyScore: dims.safety,
        issues: result.issues,
      })
      await promptScoringService.flagForReview(scoreRecord?.id ?? '', 'safety_concern')
    }

    return result
  },

  // ----------------------------------------------------------
  // SCORING LOOP: score → improve → re-score (max N iterations)
  // Returns the best passing content, or best effort after max loops
  // ----------------------------------------------------------
  async scoreLoop(params: {
    projectId:  string
    sessionId:  string
    content:    string
    vars:       PromptVariables
    onImprove:  (improvements: string[], attempt: number, previousContent: string) => Promise<{ content: string; sessionId: string }>
  }): Promise<{
    content:      string
    sessionId:    string
    finalScore:   ScoringResult
    attempts:     number
    passed:       boolean
  }> {
    const log = logger.child({ service: 'promptScoring', projectId: params.projectId })
    let { content, sessionId } = params
    let finalScore: ScoringResult | null = null
    let attempts = 0

    for (let loop = 1; loop <= MAX_RETRY_LOOPS; loop++) {
      attempts = loop
      log.info(`scoring loop ${loop}/${MAX_RETRY_LOOPS}`)

      finalScore = await promptScoringService.score(sessionId, content, params.vars)

      if (finalScore.passed) {
        log.info('scoring loop — PASSED', { loop, overall: finalScore.overall })
        return { content, sessionId, finalScore, attempts, passed: true }
      }

      if (loop === MAX_RETRY_LOOPS) break

      log.warn('scoring loop — improving', {
        loop,
        overall:      finalScore.overall,
        issues:       finalScore.issues.length,
        improvements: finalScore.improvements.length,
      })

      // Trigger improvement generation
      const improved = await params.onImprove(
        finalScore.improvements,
        loop + 1,
        content,
      )

      content   = improved.content
      sessionId = improved.sessionId
    }

    // After MAX_RETRY_LOOPS, return best effort but flag for human review
    log.warn('scoring loop — max loops reached, using best effort', {
      overall: finalScore?.overall,
      passed:  finalScore?.passed,
    })

    if (finalScore && !finalScore.passed) {
      await promptScoringService.flagForManualReview(
        params.projectId,
        sessionId,
        finalScore,
      )
    }

    return {
      content,
      sessionId,
      finalScore:  finalScore!,
      attempts,
      passed:      false,
    }
  },

  // ----------------------------------------------------------
  // FLAG SESSION FOR REVIEW
  // ----------------------------------------------------------
  async flagForReview(scoreId: string, reason: string): Promise<void> {
    const supabase = createAdminClient()
    if (!scoreId || scoreId === '') return

    await supabase
      .from('prompt_scores')
      .update({ status: 'flagged', flagged_reason: reason })
      .eq('id', scoreId)
  },

  async flagForManualReview(
    projectId: string,
    sessionId: string,
    score:     ScoringResult,
  ): Promise<void> {
    const supabase = createAdminClient()
    logger.warn('flagging for manual review', {
      projectId, sessionId, overall: score.overall,
    })

    // Create admin support ticket
    await supabase.from('support_tickets').insert({
      subject:    `[AUTO] Révision manuelle requise — projet ${projectId}`,
      project_id: projectId,
      status:     'open',
      priority:   'high',
    })
  },

  // ----------------------------------------------------------
  // GET SCORE STATS FOR A PROMPT VERSION
  // ----------------------------------------------------------
  async getVersionStats(versionId: string): Promise<{
    totalSessions: number
    avgScore:      number
    passRate:      number
    flaggedCount:  number
  }> {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('prompt_scores')
      .select(`
        score,
        status,
        prompt_sessions!inner(version_id)
      `)
      .eq('prompt_sessions.version_id', versionId)

    if (error || !data?.length) {
      return { totalSessions: 0, avgScore: 0, passRate: 0, flaggedCount: 0 }
    }

    const totalSessions = data.length
    const avgScore      = data.reduce((sum, s) => sum + (s.score ?? 0), 0) / totalSessions
    const passRate      = data.filter(s => (s.score ?? 0) >= PASS_THRESHOLD).length / totalSessions
    const flaggedCount  = data.filter(s => s.status === 'flagged').length

    return { totalSessions, avgScore: parseFloat(avgScore.toFixed(2)), passRate, flaggedCount }
  },
}
