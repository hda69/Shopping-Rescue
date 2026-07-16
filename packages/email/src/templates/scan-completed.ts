import { getRiskLabel } from '@shopping-rescue/shared';
import { getDisclaimer, type AppLocale } from '@shopping-rescue/shared/i18n';
import type { RiskLevel } from '@shopping-rescue/shared';

export interface ScanCompletedEmailParams {
  siteUrl: string;
  riskScore: number;
  resultsUrl: string;
  findingsCount: number;
  pagesCrawled: number;
  locale?: AppLocale;
}

const COPY = {
  en: {
    subject: (score: number) => `Your Shopping Rescue scan is ready — ${score}/100`,
    scanComplete: 'Your Shopping Rescue scan is complete.',
    site: 'Site',
    riskScore: 'Risk score',
    findings: 'Findings',
    pagesCrawled: 'Pages crawled',
    viewResults: 'View results',
    headline: 'Your scan is ready',
    coverage: 'Coverage',
    pagesFindings: (pages: number, findings: number) => `pages · ${findings} findings`,
    body: 'Your automated Merchant Center diagnostic is complete. Review your risk score, top findings, and next steps.',
    cta: 'View your results',
  },
  fr: {
    subject: (score: number) => `Votre scan Shopping Rescue est prêt — ${score}/100`,
    scanComplete: 'Votre scan Shopping Rescue est terminé.',
    site: 'Site',
    riskScore: 'Score de risque',
    findings: 'Constats',
    pagesCrawled: 'Pages crawlées',
    viewResults: 'Voir les résultats',
    headline: 'Votre scan est prêt',
    coverage: 'Couverture',
    pagesFindings: (pages: number, findings: number) => `pages · ${findings} constats`,
    body: 'Votre diagnostic Merchant Center automatisé est terminé. Consultez votre score de risque, les principaux constats et les prochaines étapes.',
    cta: 'Voir vos résultats',
  },
} as const;

export function buildScanCompletedEmail(params: ScanCompletedEmailParams): {
  subject: string;
  html: string;
  text: string;
} {
  const locale = params.locale ?? 'en';
  const copy = COPY[locale];
  const riskLevel = getRiskLabel(scoreToLevel(params.riskScore), locale);
  const subject = copy.subject(params.riskScore);
  const disclaimer = getDisclaimer(locale);

  const text = [
    copy.scanComplete,
    '',
    `${copy.site}: ${params.siteUrl}`,
    `${copy.riskScore}: ${params.riskScore}/100 (${riskLevel})`,
    `${copy.findings}: ${params.findingsCount}`,
    `${copy.pagesCrawled}: ${params.pagesCrawled}`,
    '',
    `${copy.viewResults}: ${params.resultsUrl}`,
    '',
    disclaimer,
  ].join('\n');

  const html = `<!DOCTYPE html>
<html lang="${locale}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f5f5f7;font-family:Inter,Arial,sans-serif;color:#111111;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f5f7;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #e5e5ea;border-radius:20px;overflow:hidden;box-shadow:0 8px 28px rgba(0,0,0,0.06);">
            <tr>
              <td style="padding:28px 28px 20px;background:#0b0d14;color:#ffffff;">
                <div style="font-size:13px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.55);margin-bottom:10px;">
                  Shopping Rescue
                </div>
                <h1 style="margin:0;font-size:24px;line-height:1.2;font-weight:800;">${escapeHtml(copy.headline)}</h1>
                <p style="margin:12px 0 0;font-size:14px;line-height:1.5;color:rgba(255,255,255,0.72);word-break:break-all;">
                  ${escapeHtml(params.siteUrl)}
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;">
                  <tr>
                    <td width="50%" style="padding-right:8px;vertical-align:top;">
                      <div style="background:#f2f2f7;border-radius:14px;padding:16px;">
                        <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#6e6e73;">${escapeHtml(copy.riskScore)}</div>
                        <div style="font-size:32px;font-weight:800;line-height:1.1;margin-top:6px;">${params.riskScore}<span style="font-size:16px;color:#98989d;">/100</span></div>
                        <div style="font-size:12px;color:#6e6e73;margin-top:6px;">${escapeHtml(riskLevel)}</div>
                      </div>
                    </td>
                    <td width="50%" style="padding-left:8px;vertical-align:top;">
                      <div style="background:#f2f2f7;border-radius:14px;padding:16px;">
                        <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#6e6e73;">${escapeHtml(copy.coverage)}</div>
                        <div style="font-size:32px;font-weight:800;line-height:1.1;margin-top:6px;">${params.pagesCrawled}</div>
                        <div style="font-size:12px;color:#6e6e73;margin-top:6px;">${escapeHtml(copy.pagesFindings(params.pagesCrawled, params.findingsCount))}</div>
                      </div>
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#444;">
                  ${escapeHtml(copy.body)}
                </p>
                <a href="${escapeHtml(params.resultsUrl)}" style="display:inline-block;background:#0a84ff;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 22px;border-radius:14px;">
                  ${escapeHtml(copy.cta)}
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 28px;">
                <p style="margin:0;font-size:11px;line-height:1.5;color:#98989d;border-top:1px solid #e5e5ea;padding-top:18px;">
                  ${escapeHtml(disclaimer)}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, html, text };
}

function scoreToLevel(score: number): RiskLevel {
  if (score <= 19) return 'low';
  if (score <= 39) return 'moderate';
  if (score <= 59) return 'elevated';
  if (score <= 79) return 'high';
  return 'critical';
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
