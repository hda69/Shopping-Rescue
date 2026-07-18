import { loadEnv } from '@shopping-rescue/shared/load-env';
import { createLoginToken } from '@shopping-rescue/auth';
import { sendMagicLinkEmail } from '@shopping-rescue/email';
import { localizePath, parseLocaleParam } from '@/lib/locale';
import { getAppBaseUrl } from '@/lib/app-url';
import { NextResponse } from 'next/server';

loadEnv();

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  let body: { email?: string; locale?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
  }

  const locale = parseLocaleParam(body.locale);
  const { rawToken } = await createLoginToken({ email, locale });
  const appUrl = getAppBaseUrl(request).replace(/\/$/, '');
  const loginUrl = `${appUrl}/api/auth/verify?token=${encodeURIComponent(rawToken)}&locale=${locale}`;

  const result = await sendMagicLinkEmail({
    to: email,
    loginUrl,
    locale,
  });

  if (!result.sent) {
    return NextResponse.json(
      { error: result.reason === 'not_configured' ? 'email_not_configured' : 'send_failed' },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true });
}
