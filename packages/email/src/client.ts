import { createLogger } from '@shopping-rescue/shared';

const logger = createLogger({ package: 'email' });
const RESEND_API_URL = 'https://api.resend.com/emails';

export interface EmailClientConfig {
  apiKey: string;
  fromAddress: string;
}

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface SendEmailResult {
  id: string;
  status: 'queued' | 'sent';
}

export function createEmailClient(config: EmailClientConfig) {
  return {
    send: (params: SendEmailParams) => sendWithResend(config, params),
  };
}

export type EmailClient = ReturnType<typeof createEmailClient>;

async function sendWithResend(
  config: EmailClientConfig,
  params: SendEmailParams,
): Promise<SendEmailResult> {
  const response = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: config.fromAddress,
      to: [params.to],
      subject: params.subject,
      html: params.html,
      text: params.text,
    }),
  });

  const body = (await response.json().catch(() => ({}))) as {
    id?: string;
    message?: string;
    name?: string;
  };

  if (!response.ok) {
    const detail = body.message ?? body.name ?? `HTTP ${response.status}`;
    logger.error('Resend API error', { status: response.status, detail, to: params.to });
    throw new Error(`Resend API error: ${detail}`);
  }

  logger.info('Email queued via Resend', { id: body.id, to: params.to, subject: params.subject });

  return {
    id: body.id ?? 'unknown',
    status: 'queued',
  };
}
