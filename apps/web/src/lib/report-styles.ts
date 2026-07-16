import 'server-only';

import { readFileSync } from 'fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'path';

const require = createRequire(import.meta.url);

function resolveMonorepoRoot(): string {
  const cwd = process.cwd();
  if (cwd.endsWith('apps\\web') || cwd.endsWith('apps/web')) {
    return join(cwd, '..', '..');
  }
  return cwd;
}

function readReportCss(): string {
  const root = resolveMonorepoRoot();
  const candidates = [
    join(root, 'packages', 'reporting', 'src', 'pdf', 'report.css'),
    join(process.cwd(), 'packages', 'reporting', 'src', 'pdf', 'report.css'),
  ];

  for (const cssPath of candidates) {
    try {
      return readFileSync(cssPath, 'utf-8');
    } catch {
      continue;
    }
  }

  throw new Error('Could not locate packages/reporting/src/pdf/report.css');
}

function readFontBase64(fileName: string): string | null {
  const root = resolveMonorepoRoot();
  const candidates = [
    join(root, 'node_modules', '@fontsource', 'inter', 'files', fileName),
  ];

  try {
    const interDir = dirname(require.resolve('@fontsource/inter/package.json'));
    candidates.unshift(join(interDir, 'files', fileName));
  } catch {
    // ignore
  }

  for (const fontPath of candidates) {
    try {
      return readFileSync(fontPath).toString('base64');
    } catch {
      continue;
    }
  }

  return null;
}

export function getReportStylesheet(): string {
  const css = readReportCss();
  const fontRegular = readFontBase64('inter-latin-400-normal.woff2');
  const fontBold = readFontBase64('inter-latin-700-normal.woff2');

  if (!fontRegular || !fontBold) {
    return css;
  }

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
