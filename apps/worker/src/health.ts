import http from 'node:http';
import { getQueuedJobCount } from '@shopping-rescue/database';

/** Railway injects PORT; local/dev use WORKER_HEALTH_PORT or 3001. */
export function getHealthPort(): number {
  const railwayPort = process.env.PORT;
  if (railwayPort && Number.isFinite(Number(railwayPort))) {
    return Number(railwayPort);
  }
  const workerPort = process.env.WORKER_HEALTH_PORT;
  if (workerPort && Number.isFinite(Number(workerPort))) {
    return Number(workerPort);
  }
  return 3001;
}

let server: http.Server | null = null;

export function startHealthServer(): Promise<void> {
  const port = getHealthPort();

  server = http.createServer(async (req, res) => {
    const path = req.url?.split('?')[0] ?? '';

    if (req.method === 'GET' && (path === '/health' || path === '/')) {
      try {
        const queuedJobCount = await getQueuedJobCount();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', queuedJobCount }));
      } catch {
        res.writeHead(503, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'error', message: 'Database unavailable' }));
      }
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'not_found' }));
  });

  return new Promise((resolve, reject) => {
    server!.once('error', reject);
    // Bind 0.0.0.0 so Railway's public proxy can reach the health server.
    server!.listen(port, '0.0.0.0', () => resolve());
  });
}

export async function stopHealthServer(): Promise<void> {
  if (!server) return;

  await new Promise<void>((resolve, reject) => {
    server!.close((err) => (err ? reject(err) : resolve()));
  });
  server = null;
}
