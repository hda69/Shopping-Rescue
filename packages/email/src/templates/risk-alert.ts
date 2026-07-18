import { getDisclaimer, type AppLocale } from '@shopping-rescue/shared/i18n';

export interface RiskAlertFinding {
  title: string;
  severity: string;
  affectedUrl?: string | null;
}

export interface RiskAlertEmailParams {
  siteUrl: string;
  riskScore: number;
  resultsUrl: string;
  newFindings: RiskAlertFinding[];
  locale?: AppLocale;
}

const COPY = {
  en: {
    subject: (count: number) =>
      `Shopping Rescue alert — ${count} new high-risk finding${count > 1 ? 's' : ''}`,
    headline: 'New high-risk findings detected',
    body: 'Your weekly Monitoring Pro scan found new critical or high severity issues since the previous scan.',
    site: 'Site',
    riskScore: 'Current risk score',
    newFindings: 'New findings',
    cta: 'View full report',
  },
  fr: {
    subject: (count: number) =>
      `Alerte Shopping Rescue — ${count} nouveau${count > 1 ? 'x' : ''} constat${count > 1 ? 's' : ''} à risque`,
    headline: 'Nouveaux constats à risque élevé',
    body: 'Votre scan Monitoring Pro hebdomadaire a détecté de nouveaux problèmes critiques ou élevés depuis le scan précédent.',
    site: 'Site',
    riskScore: 'Score de risque actuel',
    newFindings: 'Nouveaux constats',
    cta: 'Voir le rapport complet',
  },
} as const;

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function buildRiskAlertEmail(params: RiskAlertEmailParams): {
  subject: string;
  html: string;
  text: string;
} {
  const locale = params.locale ?? 'en';
  const copy = COPY[locale];
  const subject = copy.subject(params.newFindings.length);
  const disclaimer = getDisclaimer(locale);

  const findingsText = params.newFindings
    .map((f) => `- [${f.severity}] ${f.title}${f.affectedUrl ? ` (${f.affectedUrl})` : ''}`)
    .join('\n');

  const text = [
    copy.headline,
    '',
    copy.body,
    '',
    `${copy.site}: ${params.siteUrl}`,
    `${copy.riskScore}: ${params.riskScore}/100`,
    '',
    copy.newFindings,
    findingsText,
    '',
    `${copy.cta}: ${params.resultsUrl}`,
    '',
    disclaimer,
  ].join('\n');

  const findingsHtml = params.newFindings
    .map(
      (f) =>
        `<li style="margin:0 0 8px;"><strong style="text-transform:uppercase;font-size:12px;color:#b42318;">${escapeHtml(f.severity)}</strong> — ${escapeHtml(f.title)}${f.affectedUrl ? `<br/><span style="color:#6e6e73;font-size:12px;">${escapeHtml(f.affectedUrl)}</span>` : ''}</li>`,
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="${locale}">
  <head><meta charset="utf-8" /><title>${escapeHtml(subject)}</title></head>
  <body style="margin:0;padding:0;background:#f5f5f7;font-family:Inter,Arial,sans-serif;color:#111;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 16px;">
      <tr><td align="center">
        <table role="presentation" width="100%" style="max-width:560px;background:#fff;border:1px solid #e5e5ea;border-radius:20px;overflow:hidden;">
          <tr><td style="padding:28px 28px 8px;">
            <div style="font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#b42318;">Monitoring Pro</div>
            <h1 style="margin:12px 0 0;font-size:24px;">${escapeHtml(copy.headline)}</h1>
            <p style="margin:12px 0 0;color:#444;line-height:1.5;">${escapeHtml(copy.body)}</p>
          </td></tr>
          <tr><td style="padding:8px 28px 0;color:#6e6e73;font-size:14px;">
            <div><strong>${escapeHtml(copy.site)}:</strong> ${escapeHtml(params.siteUrl)}</div>
            <div style="margin-top:6px;"><strong>${escapeHtml(copy.riskScore)}:</strong> ${params.riskScore}/100</div>
          </td></tr>
          <tr><td style="padding:20px 28px;">
            <div style="font-weight:700;margin-bottom:8px;">${escapeHtml(copy.newFindings)}</div>
            <ul style="margin:0;padding-left:18px;">${findingsHtml}</ul>
          </td></tr>
          <tr><td style="padding:0 28px 28px;" align="center">
            <a href="${escapeHtml(params.resultsUrl)}" style="display:inline-block;background:#0a84ff;color:#fff;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:12px;">${escapeHtml(copy.cta)}</a>
          </td></tr>
          <tr><td style="padding:0 28px 24px;font-size:11px;color:#98989d;line-height:1.4;">${escapeHtml(disclaimer)}</td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

  return { subject, html, text };
}
