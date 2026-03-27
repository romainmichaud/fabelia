import { logger } from './logger'

// ============================================================
// RETRY WITH EXPONENTIAL BACKOFF
// ============================================================

export interface RetryOptions {
  maxAttempts:  number      // Total attempts (including first)
  baseDelayMs:  number      // Initial delay
  maxDelayMs:   number      // Cap on delay
  jitter:       boolean     // Add randomness to avoid thundering herd
  retryOn?:     (error: Error, attempt: number) => boolean  // Custom predicate
  onRetry?:     (error: Error, attempt: number, delayMs: number) => void
}

const DEFAULT_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  baseDelayMs: 500,
  maxDelayMs:  10_000,
  jitter:      true,
}

function computeDelay(attempt: number, opts: RetryOptions): number {
  // Exponential: 500 → 1000 → 2000 → …
  const exponential = Math.min(
    opts.baseDelayMs * Math.pow(2, attempt - 1),
    opts.maxDelayMs,
  )
  if (!opts.jitter) return exponential
  // Full jitter: random between 0 and exponential
  return Math.floor(Math.random() * exponential)
}

function isRetryable(error: Error): boolean {
  const msg = error.message.toLowerCase()

  // Network / transient errors
  if (msg.includes('econnreset') ||
      msg.includes('enotfound') ||
      msg.includes('etimedout') ||
      msg.includes('socket hang up')) return true

  // OpenAI rate limits or overload
  if (msg.includes('rate limit') ||
      msg.includes('overloaded') ||
      msg.includes('529') ||
      msg.includes('503')) return true

  // Stripe retryable
  if (msg.includes('stripe') && msg.includes('network')) return true

  return false
}

export async function retry<T>(
  fn:       () => Promise<T>,
  options?: Partial<RetryOptions>,
  context?: Record<string, unknown>,
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  let lastError: Error = new Error('Unknown error')

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err as Error

      const shouldRetry = opts.retryOn
        ? opts.retryOn(lastError, attempt)
        : isRetryable(lastError)

      if (!shouldRetry || attempt === opts.maxAttempts) {
        logger.error('retry — exhausted', {
          ...context,
          attempt,
          maxAttempts: opts.maxAttempts,
        }, lastError)
        throw lastError
      }

      const delayMs = computeDelay(attempt, opts)
      opts.onRetry?.(lastError, attempt, delayMs)

      logger.warn('retry — retrying', {
        ...context,
        attempt,
        maxAttempts: opts.maxAttempts,
        delayMs,
        error: lastError.message,
      })

      await sleep(delayMs)
    }
  }

  throw lastError
}

export const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

// ============================================================
// CIRCUIT BREAKER (basic)
// ============================================================
export class CircuitBreaker {
  private failures    = 0
  private lastFailure = 0
  private state:       'closed' | 'open' | 'half-open' = 'closed'

  constructor(
    private readonly threshold:  number = 5,
    private readonly timeoutMs:  number = 60_000,
    private readonly name:       string = 'circuit',
  ) {}

  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailure > this.timeoutMs) {
        this.state = 'half-open'
        logger.info(`circuit-breaker — half-open`, { circuit: this.name })
      } else {
        throw new Error(`Circuit breaker [${this.name}] is OPEN`)
      }
    }

    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (err) {
      this.onFailure()
      throw err
    }
  }

  private onSuccess() {
    this.failures = 0
    if (this.state === 'half-open') {
      this.state = 'closed'
      logger.info(`circuit-breaker — closed`, { circuit: this.name })
    }
  }

  private onFailure() {
    this.failures++
    this.lastFailure = Date.now()
    if (this.failures >= this.threshold) {
      this.state = 'open'
      logger.error(`circuit-breaker — opened`, { circuit: this.name, failures: this.failures })
    }
  }

  get isOpen() { return this.state === 'open' }
}
