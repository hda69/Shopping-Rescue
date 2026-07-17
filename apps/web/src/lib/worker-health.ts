const WORKER_HEALTH_URL =
  process.env.WORKER_HEALTH_URL ??
  process.env.worker_health_url ??
  'http://127.0.0.1:3001/health';

export async function checkWorkerHealth(): Promise<{
  online: boolean;
  queuedJobCount?: number;
}> {
  try {
    const response = await fetch(WORKER_HEALTH_URL, {
      cache: 'no-store',
      signal: AbortSignal.timeout(2000),
    });

    if (!response.ok) {
      return { online: false };
    }

    const data = (await response.json()) as { queuedJobCount?: number };
    return { online: true, queuedJobCount: data.queuedJobCount };
  } catch {
    return { online: false };
  }
}
