type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  correlationId?: string;
  timestamp: string;
  [key: string]: unknown;
}

export function createLogger(context: Record<string, unknown> = {}) {
  const log = (level: LogLevel, message: string, meta: Record<string, unknown> = {}) => {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...context,
      ...meta,
    };

    const output = JSON.stringify(entry);

    switch (level) {
      case 'error':
        console.error(output);
        break;
      case 'warn':
        console.warn(output);
        break;
      default:
        console.log(output);
    }
  };

  return {
    debug: (message: string, meta?: Record<string, unknown>) => log('debug', message, meta),
    info: (message: string, meta?: Record<string, unknown>) => log('info', message, meta),
    warn: (message: string, meta?: Record<string, unknown>) => log('warn', message, meta),
    error: (message: string, meta?: Record<string, unknown>) => log('error', message, meta),
    child: (childContext: Record<string, unknown>) =>
      createLogger({ ...context, ...childContext }),
  };
}

export type Logger = ReturnType<typeof createLogger>;
