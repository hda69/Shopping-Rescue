import 'server-only';
import { renderToStaticMarkup } from 'react-dom/server';
import { AuditReport } from './AuditReport';
import { getReportStylesheet } from './styles';
import type { AuditReportData } from './types';

export function renderAuditReportHtml(audit: AuditReportData): string {
  const markup = renderToStaticMarkup(<AuditReport audit={audit} />);
  const css = getReportStylesheet();

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Shopping Rescue Audit — ${audit.siteUrl}</title>
    <style>${css}</style>
  </head>
  <body>${markup}</body>
</html>`;
}
