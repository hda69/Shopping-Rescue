import { NextResponse } from 'next/server';
import { loadEnv } from '@shopping-rescue/shared/load-env';
import { checkDbHealth } from '@shopping-rescue/database';

loadEnv();

export async function GET() {
  const db = await checkDbHealth();

  return NextResponse.json({
    status: db.ok ? 'ok' : 'degraded',
    service: '@shopping-rescue/web',
    database: db.ok ? 'connected' : 'unavailable',
    databaseMessage: db.message,
    timestamp: new Date().toISOString(),
  });
}
