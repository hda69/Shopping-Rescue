import { loadEnv } from '@shopping-rescue/shared/load-env';
import { freeScanSchema, isValidUrl } from '@shopping-rescue/shared/validation';
import { createFreeScan, formatDbError } from '@shopping-rescue/database';
import { NextResponse } from 'next/server';

loadEnv();

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const result = freeScanSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: result.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  if (!isValidUrl(result.data.url)) {
    return NextResponse.json(
      { error: 'URL not allowed', details: 'Please enter a valid HTTP or HTTPS URL' },
      { status: 400 },
    );
  }

  try {
    const scan = await createFreeScan(result.data);

    return NextResponse.json(
      {
        scanId: scan.scanId,
        jobId: scan.jobId,
        status: scan.status,
        message: 'Free scan queued successfully',
      },
      { status: 202 },
    );
  } catch (error) {
    const message = formatDbError(error);
    console.error('[api/scans]', message);
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
