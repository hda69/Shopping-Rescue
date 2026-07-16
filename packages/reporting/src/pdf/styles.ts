import 'server-only';

import { readFileSync } from 'fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const pdfDir = dirname(fileURLToPath(import.meta.url));

function readFontBase64(fileName: string): string {
  const interDir = dirname(require.resolve('@fontsource/inter/package.json'));
  return readFileSync(join(interDir, 'files', fileName)).toString('base64');
}

export function getReportStylesheet(): string {
  const css = readFileSync(join(pdfDir, 'report.css'), 'utf-8');
  const fontRegular = readFontBase64('inter-latin-400-normal.woff2');
  const fontBold = readFontBase64('inter-latin-700-normal.woff2');

  const fontFace = `
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url(data:font/woff2;base64,${fontRegular}) format('woff2');
}
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url(data:font/woff2;base64,${fontBold}) format('woff2');
}
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 800;
  font-display: swap;
  src: url(data:font/woff2;base64,${fontBold}) format('woff2');
}
`;

  return `${fontFace}\n${css}`;
}
