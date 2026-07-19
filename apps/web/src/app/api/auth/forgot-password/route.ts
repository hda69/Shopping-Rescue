import { loadEnv } from '@shopping-rescue/shared/load-env';
import { createPasswordResetToken, getUserByEmail } from '@shopping-rescue/auth';
import { sendPasswordResetEmail } from '@shopping-rescue/email';
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
  const locale = parseLocaleParam(body.locale);

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
  }

  // Always return ok to avoid email enumeration
  const user = await getUserByEmail(email);
  if (!user) {
    return NextResponse.json({ ok: true });
  }

  const { rawToken } = await createPasswordResetToken({ email, locale });
  const appUrl = getAppBaseUrl(request).replace(/\/$/, '');
  const resetUrl = `${appUrl}${localizePath('/reset-password', locale)}?token=${encodeURIComponent(rawToken)}`;

  const result = await sendPasswordResetEmail({
    to: email,
    resetUrl,
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
