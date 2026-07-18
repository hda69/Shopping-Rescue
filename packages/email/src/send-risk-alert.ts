import { createLogger } from '@shopping-rescue/shared';
import { localizePath, parseLocaleParam, type AppLocale } from '@shopping-rescue/shared/i18n';
import { createEmailClient } from './client.js';
import { getEmailConfigFromEnv } from './config.js';
import { buildRiskAlertEmail, type RiskAlertFinding } from './templates/risk-alert.js';

const logger = createLogger({ package: 'email' });

export interface SendRiskAlertEmailInput {
  to: string;
  scanId: string;
  siteUrl: string;
  riskScore: number;
  newFindings: RiskAlertFinding[];
  appUrl?: string;
  locale?: AppLocale;
  env?: NodeJS.ProcessEnv;
}

export async function sendRiskAlertEmail(input: SendRiskAlertEmailInput): Promise<{
  sent: boolean;
  reason?: 'not_configured' | 'missing_recipient' | 'no_findings';
  messageId?: string;
}> {
  if (!input.to?.trim()) {
    return { sent: false, reason: 'missing_recipient' };
  }
  if (input.newFindings.length === 0) {
    return { sent: false, reason: 'no_findings' };
  }

  const config = getEmailConfigFromEnv(input.env);
  if (!config) {
    logger.info('Risk alert email skipped (Resend not configured)', {
      to: input.to,
      scanId: input.scanId,
    });
    return { sent: false, reason: 'not_configured' };
  }

  const locale = parseLocaleParam(input.locale);
  const appUrl = (input.appUrl ?? input.env?.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(
    /\/$/,
    '',
  );
  const resultsUrl = `${appUrl}${localizePath(`/scan/${input.scanId}`, locale)}`;
  const content = buildRiskAlertEmail({
    siteUrl: input.siteUrl,
    riskScore: input.riskScore,
    resultsUrl,
    newFindings: input.newFindings,
    locale,
  });

  const client = createEmailClient(config);
  const result = await client.send({
    to: input.to.trim(),
    subject: content.subject,
    html: content.html,
    text: content.text,
  });

  return { sent: true, messageId: result.id };
}
