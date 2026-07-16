export function formatDbError(error: unknown): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code?: string }).code ?? '')
      : '';

  const message =
    error instanceof Error ? error.message.trim() : typeof error === 'string' ? error.trim() : '';

  if (
    code === 'ECONNREFUSED' ||
    message.includes('ECONNREFUSED') ||
    message.includes('connect ECONNREFUSED')
  ) {
    return 'Database is offline. Start Docker Desktop, then run: docker compose up -d postgres';
  }

  if (message.includes('DATABASE_URL environment variable is required')) {
    return 'DATABASE_URL is missing. Copy .env.example to .env and set your Postgres connection string.';
  }

  if (message) return message;

  return 'Failed to connect to database';
}
