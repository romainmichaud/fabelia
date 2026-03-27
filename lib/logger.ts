// ============================================================
// STRUCTURED LOGGER
// Production-ready, supports local + remote (e.g. Datadog)
// ============================================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal'

export interface LogContext {
  service?:    string
  projectId?:  string
  orderId?:    string
  userId?:     string
  sessionId?:  string
  attempt?:    number
  duration?:   number
  [key: string]: unknown
}

interface LogEntry {
  timestamp: string
  level:     LogLevel
  message:   string
  context:   LogContext
  error?:    { message: string; stack?: string; code?: string }
}

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info:  1,
  warn:  2,
  error: 3,
  fatal: 4,
}

const MIN_LEVEL: LogLevel =
  (process.env.LOG_LEVEL as LogLevel) ??
  (process.env.NODE_ENV === 'production' ? 'info' : 'debug')

function shouldLog(level: LogLevel): boolean {
  return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[MIN_LEVEL]
}

function formatEntry(entry: LogEntry): string {
  if (process.env.NODE_ENV === 'production') {
    return JSON.stringify(entry)
  }

  const colors: Record<LogLevel, string> = {
    debug: '\x1b[90m',  // gray
    info:  '\x1b[36m',  // cyan
    warn:  '\x1b[33m',  // yellow
    error: '\x1b[31m',  // red
    fatal: '\x1b[35m',  // magenta
  }
  const reset = '\x1b[0m'
  const color = colors[entry.level]
  const ctx   = Object.keys(entry.context).length
    ? ` ${JSON.stringify(entry.context)}`
    : ''

  return `${color}[${entry.level.toUpperCase()}]${reset} ${entry.timestamp} ${entry.message}${ctx}${
    entry.error ? `\n  Error: ${entry.error.message}` : ''
  }`
}

function emit(level: LogLevel, message: string, context: LogContext = {}, error?: Error): void {
  if (!shouldLog(level)) return

  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
    error: error
      ? { message: error.message, stack: error.stack, code: (error as NodeJS.ErrnoException).code }
      : undefined,
  }

  const formatted = formatEntry(entry)

  if (level === 'error' || level === 'fatal') {
    console.error(formatted)
  } else if (level === 'warn') {
    console.warn(formatted)
  } else {
    console.log(formatted)
  }

  // Hook for remote logging (Datadog, Sentry, etc.)
  if (process.env.NODE_ENV === 'production' && (level === 'error' || level === 'fatal')) {
    // sendToRemote(entry) — implement as needed
  }
}

// ============================================================
// PUBLIC API
// ============================================================
export const logger = {
  debug: (msg: string, ctx?: LogContext)             => emit('debug', msg, ctx),
  info:  (msg: string, ctx?: LogContext)             => emit('info',  msg, ctx),
  warn:  (msg: string, ctx?: LogContext, err?: Error) => emit('warn',  msg, ctx, err),
  error: (msg: string, ctx?: LogContext, err?: Error) => emit('error', msg, ctx, err),
  fatal: (msg: string, ctx?: LogContext, err?: Error) => emit('fatal', msg, ctx, err),

  /** Create a child logger with pre-bound context */
  child: (base: LogContext) => ({
    debug: (msg: string, ctx?: LogContext)              => emit('debug', msg, { ...base, ...ctx }),
    info:  (msg: string, ctx?: LogContext)              => emit('info',  msg, { ...base, ...ctx }),
    warn:  (msg: string, ctx?: LogContext, err?: Error)  => emit('warn',  msg, { ...base, ...ctx }, err),
    error: (msg: string, ctx?: LogContext, err?: Error)  => emit('error', msg, { ...base, ...ctx }, err),
    fatal: (msg: string, ctx?: LogContext, err?: Error)  => emit('fatal', msg, { ...base, ...ctx }, err),
  }),

  /** Wrap an async function with timing logs */
  timed: async <T>(
    label:   string,
    fn:      () => Promise<T>,
    ctx?:    LogContext,
  ): Promise<T> => {
    const start = Date.now()
    logger.debug(`${label} — start`, ctx)
    try {
      const result = await fn()
      logger.info(`${label} — done`, { ...ctx, duration: Date.now() - start })
      return result
    } catch (err) {
      logger.error(`${label} — failed`, { ...ctx, duration: Date.now() - start }, err as Error)
      throw err
    }
  },
}
