import { createLogger } from '@shopping-rescue/shared';
import { localizePath, parseLocaleParam, type AppLocale } from '@shopping-rescue/shared/i18n';
import { createEmailClient } from './client';
import { getEmailConfigFromEnv } from './config';
import { buildScanCompletedEmail } from './templates/scan-completed';
const logger = createLogger({ package: 'email' });

export interface SendScanCompletedEmailInput {
  to: string;
  scanId: string;
  siteUrl: string;
  riskScore: number;
  findingsCount: number;
  pagesCrawled: number;
  appUrl?: string;
  locale?: AppLocale;
  env?: NodeJS.ProcessEnv;
}

export interface SendScanCompletedEmailResult {
  sent: boolean;
  reason?: 'not_configured' | 'missing_recipient';
  messageId?: string;
}

export async function sendScanCompletedEmail(
  input: SendScanCompletedEmailInput,
): Promise<SendScanCompletedEmailResult> {
  if (!input.to?.trim()) {
    return { sent: false, reason: 'missing_recipient' };
  }

  const config = getEmailConfigFromEnv(input.env);
  if (!config) {
    logger.info('Scan completed email skipped (Resend not configured)', {
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
  const content = buildScanCompletedEmail({
    siteUrl: input.siteUrl,
    riskScore: input.riskScore,
    resultsUrl,
    findingsCount: input.findingsCount,
    pagesCrawled: input.pagesCrawled,
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
