import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

function loadLogoPng(): Buffer {
  const nearby = dirname(fileURLToPath(import.meta.url));
  const cwd = process.cwd();
  const candidates = [
    join(nearby, 'logo-icon.png'),
    join(cwd, 'packages/reporting/src/pdf/assets/logo-icon.png'),
    join(cwd, 'apps/web/public/logo-icon.png'),
    join(cwd, 'public/logo-icon.png'),
  ];

  for (const path of candidates) {
    if (existsSync(path)) {
      return readFileSync(path);
    }
  }

  throw new Error(`logo-icon.png not found. Tried: ${candidates.join(', ')}`);
}

/** Inline logo for PDF HTML — works with Playwright setContent and Next print routes. */
export const REPORT_LOGO_SRC = `data:image/png;base64,${loadLogoPng().toString('base64')}`;
