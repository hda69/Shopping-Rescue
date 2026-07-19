import { SiteHeader } from '@/components/site-header';
import { ResetPasswordForm } from '@/components/reset-password-form';
import { getMessages } from '@/config/messages';
import type { AppLocale } from '@/lib/locale';
import { localizePath } from '@/lib/locale';
import Link from 'next/link';

export function ResetPasswordPageContent({
  locale,
  token,
}: {
  locale: AppLocale;
  token?: string;
}) {
  const m = getMessages(locale);

  return (
    <div className="min-h-screen section-muted">
      <SiteHeader variant="light" locale={locale} />
      <main className="section-container py-16">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-[#111]">{m.resetPassword.title}</h1>
          <p className="mt-3 text-[#6e6e73]">{m.resetPassword.subtitle}</p>
        </div>
        {!token ? (
          <p className="mx-auto mt-10 max-w-md text-center text-sm text-red-700">
            {m.resetPassword.errorToken}{' '}
            <Link href={localizePath('/forgot-password', locale)} className="text-[#0a84ff]">
              {m.forgotPassword.title}
            </Link>
          </p>
        ) : (
          <ResetPasswordForm
            locale={locale}
            token={token}
            labels={{
              password: m.login.password,
              submit: m.resetPassword.submit,
              submitting: m.resetPassword.submitting,
              errorGeneric: m.login.errorGeneric,
              errorToken: m.resetPassword.errorToken,
              errorWeakPassword: m.login.errorWeakPassword,
            }}
          />
        )}
      </main>
    </div>
  );
}
