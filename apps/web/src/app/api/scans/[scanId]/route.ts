import { loadEnv } from '@shopping-rescue/shared/load-env';
import { getScanResult } from '@/lib/scan-result';
import { NextResponse } from 'next/server';

loadEnv();

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ scanId: string }> },
) {
  const { scanId } = await params;
  const data = await getScanResult(scanId);

  if (!data) {
    return NextResponse.json({ error: 'Scan not found' }, { status: 404 });
  }

  return NextResponse.json({
    ...data,
    completedAt: data.completedAt?.toISOString() ?? null,
  });
}
