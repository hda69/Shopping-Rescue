import { createLogger } from '@shopping-rescue/shared';
import { parseLocaleParam, type AppLocale } from '@shopping-rescue/shared/i18n';
import { createEmailClient } from './client';
import { getEmailConfigFromEnv } from './config';
import { buildPasswordResetEmail } from './templates/password-reset';

const logger = createLogger({ package: 'email' });

export interface SendPasswordResetEmailInput {
  to: string;
  resetUrl: string;
  locale?: AppLocale;
  env?: NodeJS.ProcessEnv;
}

export async function sendPasswordResetEmail(
  input: SendPasswordResetEmailInput,
): Promise<{ sent: boolean; reason?: 'not_configured' | 'missing_recipient'; messageId?: string }> {
  if (!input.to?.trim()) {
    return { sent: false, reason: 'missing_recipient' };
  }

  const config = getEmailConfigFromEnv(input.env);
  if (!config) {
    logger.info('Password reset email skipped (Resend not configured)', { to: input.to });
    return { sent: false, reason: 'not_configured' };
  }

  const locale = parseLocaleParam(input.locale);
  const content = buildPasswordResetEmail({
    resetUrl: input.resetUrl,
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
