import { SiteHeader } from '@/components/site-header';
import { LoginForm } from '@/components/login-form';
import { getMessages } from '@/config/messages';
import type { AppLocale } from '@/lib/locale';

interface LoginPageContentProps {
  locale: AppLocale;
  error?: string;
}

export function LoginPageContent({ locale, error }: LoginPageContentProps) {
  const m = getMessages(locale);

  return (
    <div className="min-h-screen section-muted">
      <SiteHeader variant="light" locale={locale} />
      <main className="section-container py-16">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-[#111]">{m.login.title}</h1>
          <p className="mt-3 text-[#6e6e73]">{m.login.subtitle}</p>
        </div>
        {error && (
          <p className="mx-auto mt-6 max-w-md text-center text-sm text-red-700">
            {error === 'invalid_token' || error === 'missing_token'
              ? m.login.invalidToken
              : m.login.errorGeneric}
          </p>
        )}
        <LoginForm
          locale={locale}
          labels={{
            email: m.login.email,
            submit: m.login.submit,
            submitting: m.login.submitting,
            success: m.login.success,
            errorGeneric: m.login.errorGeneric,
            errorEmail: m.login.errorEmail,
            errorNotConfigured: m.login.errorNotConfigured,
          }}
        />
      </main>
    </div>
  );
}
