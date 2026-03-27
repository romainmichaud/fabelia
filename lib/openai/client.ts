import OpenAI from 'openai'
import { retry, CircuitBreaker } from '../retry'
import { logger } from '../logger'

// ============================================================
// SINGLETON CLIENT
// ============================================================
let _client: OpenAI | null = null

export function getOpenAIClient(): OpenAI {
  if (!_client) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set')
    }
    _client = new OpenAI({
      apiKey:  process.env.OPENAI_API_KEY,
      timeout: 120_000,  // 2 minutes for long generations
      maxRetries: 0,     // We handle retries ourselves
    })
  }
  return _client
}

// ============================================================
// CIRCUIT BREAKER (one per model type)
// ============================================================
const textBreaker  = new CircuitBreaker(5, 60_000, 'openai-text')
const imageBreaker = new CircuitBreaker(3, 60_000, 'openai-image')

// ============================================================
// MODEL CONFIGURATION
// ============================================================
export const MODELS = {
  story:     'gpt-4o',
  scoring:   'gpt-4o',
  questions: 'gpt-4o-mini',
  image:     'dall-e-3',
} as const

export type TextModel  = typeof MODELS.story | typeof MODELS.scoring | typeof MODELS.questions
export type ImageModel = typeof MODELS.image

// ============================================================
// TEXT COMPLETION (with retry + circuit breaker)
// ============================================================
export interface TextCompletionOptions {
  model:          TextModel
  systemPrompt:   string
  userPrompt:     string
  temperature?:   number
  maxTokens?:     number
  responseFormat?: 'text' | 'json_object'
  context?:       Record<string, unknown>
}

export interface TextCompletionResult {
  content:      string
  tokensUsed:   number
  durationMs:   number
  model:        string
  finishReason: string
}

export async function textCompletion(
  opts: TextCompletionOptions,
): Promise<TextCompletionResult> {
  const client = getOpenAIClient()
  const start  = Date.now()

  logger.debug('openai — text completion start', {
    ...opts.context,
    model: opts.model,
    tokens: opts.maxTokens,
  })

  return retry(
    () => textBreaker.call(async () => {
      const response = await client.chat.completions.create({
        model:       opts.model,
        temperature: opts.temperature ?? 0.8,
        max_tokens:  opts.maxTokens   ?? 4000,
        response_format: opts.responseFormat === 'json_object'
          ? { type: 'json_object' }
          : undefined,
        messages: [
          { role: 'system', content: opts.systemPrompt },
          { role: 'user',   content: opts.userPrompt   },
        ],
      })

      const choice = response.choices[0]
      if (!choice?.message?.content) {
        throw new Error('OpenAI returned empty content')
      }

      const result: TextCompletionResult = {
        content:      choice.message.content,
        tokensUsed:   response.usage?.total_tokens ?? 0,
        durationMs:   Date.now() - start,
        model:        response.model,
        finishReason: choice.finish_reason ?? 'unknown',
      }

      logger.info('openai — text completion done', {
        ...opts.context,
        model:      result.model,
        tokens:     result.tokensUsed,
        duration:   result.durationMs,
        finish:     result.finishReason,
      })

      return result
    }),
    {
      maxAttempts: 3,
      baseDelayMs: 2000,
      maxDelayMs:  15_000,
      onRetry: (err, attempt) =>
        logger.warn('openai — retry text', { ...opts.context, attempt }, err),
    },
    opts.context,
  )
}

// ============================================================
// IMAGE GENERATION
// ============================================================
export interface ImageGenerationOptions {
  prompt:    string
  size?:     '1024x1024' | '1792x1024' | '1024x1792'
  quality?:  'standard' | 'hd'
  style?:    'vivid' | 'natural'
  context?:  Record<string, unknown>
}

export interface ImageGenerationResult {
  url:         string
  revisedPrompt: string
  durationMs:  number
}

export async function generateImage(
  opts: ImageGenerationOptions,
): Promise<ImageGenerationResult> {
  const client = getOpenAIClient()
  const start  = Date.now()

  logger.debug('openai — image generation start', {
    ...opts.context,
    promptLength: opts.prompt.length,
  })

  return retry(
    () => imageBreaker.call(async () => {
      const response = await client.images.generate({
        model:   MODELS.image,
        prompt:  opts.prompt,
        n:       1,
        size:    opts.size    ?? '1024x1024',
        quality: opts.quality ?? 'hd',
        style:   opts.style   ?? 'vivid',
      })

      const image = response.data?.[0]
      if (!image?.url) {
        throw new Error('DALL-E returned no image URL')
      }

      const result: ImageGenerationResult = {
        url:           image.url,
        revisedPrompt: image.revised_prompt ?? opts.prompt,
        durationMs:    Date.now() - start,
      }

      logger.info('openai — image generation done', {
        ...opts.context,
        duration: result.durationMs,
      })

      return result
    }),
    {
      maxAttempts: 2,
      baseDelayMs: 5000,
      maxDelayMs:  30_000,
      // Only retry on rate limit
      retryOn: (err) => err.message.includes('rate_limit') || err.message.includes('503'),
      onRetry: (err, attempt) =>
        logger.warn('openai — retry image', { ...opts.context, attempt }, err),
    },
    opts.context,
  )
}

// ============================================================
// JSON SAFE PARSE (handle markdown-wrapped JSON)
// ============================================================
export function parseJSONSafe<T>(raw: string): T {
  // Remove markdown code blocks if present
  const cleaned = raw
    .replace(/^```(?:json)?\s*/m, '')
    .replace(/\s*```\s*$/m, '')
    .trim()

  return JSON.parse(cleaned) as T
}
