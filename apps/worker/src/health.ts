import http from 'node:http';
import { getQueuedJobCount } from '@shopping-rescue/database';

const PORT = Number(process.env.WORKER_HEALTH_PORT ?? 3001);

let server: http.Server | null = null;

export function startHealthServer(): Promise<void> {
  server = http.createServer(async (req, res) => {
    if (req.method === 'GET' && req.url === '/health') {
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

    res.writeHead(404);
    res.end();
  });

  return new Promise((resolve) => {
    server!.listen(PORT, resolve);
  });
}

export async function stopHealthServer(): Promise<void> {
  if (!server) return;

  await new Promise<void>((resolve, reject) => {
    server!.close((err) => (err ? reject(err) : resolve()));
  });
  server = null;
}
