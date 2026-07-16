import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const assetDir = dirname(fileURLToPath(import.meta.url));
const logoPng = readFileSync(join(assetDir, 'logo-icon.png'));

/** Inline logo for PDF HTML — works with Playwright setContent and Next print routes. */
export const REPORT_LOGO_SRC = `data:image/png;base64,${logoPng.toString('base64')}`;
