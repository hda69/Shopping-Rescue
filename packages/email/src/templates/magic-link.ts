import { getDisclaimer, type AppLocale } from '@shopping-rescue/shared/i18n';

export interface MagicLinkEmailParams {
  loginUrl: string;
  locale?: AppLocale;
}

const COPY = {
  en: {
    subject: 'Your Shopping Rescue login link',
    headline: 'Sign in to Shopping Rescue',
    body: 'Click the button below to access your dashboard. This link expires in 15 minutes and can only be used once.',
    cta: 'Open dashboard',
    ignore: 'If you did not request this email, you can ignore it.',
  },
  fr: {
    subject: 'Votre lien de connexion Shopping Rescue',
    headline: 'Connexion à Shopping Rescue',
    body: 'Cliquez sur le bouton ci-dessous pour accéder à votre tableau de bord. Ce lien expire dans 15 minutes et ne peut être utilisé qu’une fois.',
    cta: 'Ouvrir le tableau de bord',
    ignore: 'Si vous n’avez pas demandé cet e-mail, vous pouvez l’ignorer.',
  },
} as const;

export function buildMagicLinkEmail(params: MagicLinkEmailParams): {
  subject: string;
  html: string;
  text: string;
} {
  const locale = params.locale ?? 'en';
  const copy = COPY[locale];
  const disclaimer = getDisclaimer(locale);

  const text = [
    copy.headline,
    '',
    copy.body,
    '',
    `${copy.cta}: ${params.loginUrl}`,
    '',
    copy.ignore,
    '',
    disclaimer,
  ].join('\n');

  const html = `<!DOCTYPE html>
<html lang="${locale}">
<body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #111; background: #f5f5f7; padding: 24px;">
  <div style="max-width: 520px; margin: 0 auto; background: #fff; border-radius: 16px; padding: 32px;">
    <h1 style="font-size: 22px; margin: 0 0 12px;">${copy.headline}</h1>
    <p style="margin: 0 0 20px; color: #6e6e73;">${copy.body}</p>
    <p style="margin: 0 0 24px;">
      <a href="${params.loginUrl}" style="display: inline-block; background: #0a84ff; color: #fff; text-decoration: none; padding: 12px 18px; border-radius: 10px; font-weight: 600;">${copy.cta}</a>
    </p>
    <p style="margin: 0; font-size: 13px; color: #6e6e73;">${copy.ignore}</p>
    <p style="margin: 24px 0 0; font-size: 12px; color: #8e8e93;">${disclaimer}</p>
  </div>
</body>
</html>`;

  return { subject: copy.subject, html, text };
}
