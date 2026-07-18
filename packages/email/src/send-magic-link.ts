import { createLogger } from '@shopping-rescue/shared';
import { parseLocaleParam, type AppLocale } from '@shopping-rescue/shared/i18n';
import { createEmailClient } from './client.js';
import { getEmailConfigFromEnv } from './config.js';
import { buildMagicLinkEmail } from './templates/magic-link.js';

const logger = createLogger({ package: 'email' });

export interface SendMagicLinkEmailInput {
  to: string;
  loginUrl: string;
  locale?: AppLocale;
  env?: NodeJS.ProcessEnv;
}

export interface SendMagicLinkEmailResult {
  sent: boolean;
  reason?: 'not_configured' | 'missing_recipient';
  messageId?: string;
}

export async function sendMagicLinkEmail(
  input: SendMagicLinkEmailInput,
): Promise<SendMagicLinkEmailResult> {
  if (!input.to?.trim()) {
    return { sent: false, reason: 'missing_recipient' };
  }

  const config = getEmailConfigFromEnv(input.env);
  if (!config) {
    logger.info('Magic link email skipped (Resend not configured)', { to: input.to });
    return { sent: false, reason: 'not_configured' };
  }

  const locale = parseLocaleParam(input.locale);
  const content = buildMagicLinkEmail({
    loginUrl: input.loginUrl,
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
