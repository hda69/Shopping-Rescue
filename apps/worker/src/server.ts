/**
 * Thin entrypoint so Railway sees a boot log before heavy imports.
 */
console.log(
  JSON.stringify({
    message: 'Worker process starting',
    level: 'info',
    port: process.env.PORT ?? process.env.WORKER_HEALTH_PORT ?? '3001',
    node: process.version,
    timestamp: new Date().toISOString(),
  }),
);

await import('./index.js');
