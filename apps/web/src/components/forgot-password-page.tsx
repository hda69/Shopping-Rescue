import { SiteHeader } from '@/components/site-header';
import { ForgotPasswordForm } from '@/components/forgot-password-form';
import { getMessages } from '@/config/messages';
import type { AppLocale } from '@/lib/locale';

export function ForgotPasswordPageContent({ locale }: { locale: AppLocale }) {
  const m = getMessages(locale);

  return (
    <div className="min-h-screen section-muted">
      <SiteHeader variant="light" locale={locale} />
      <main className="section-container py-16">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-[#111]">{m.forgotPassword.title}</h1>
          <p className="mt-3 text-[#6e6e73]">{m.forgotPassword.subtitle}</p>
        </div>
        <ForgotPasswordForm
          locale={locale}
          labels={{
            email: m.login.email,
            submit: m.forgotPassword.submit,
            submitting: m.forgotPassword.submitting,
            success: m.forgotPassword.success,
            backToLogin: m.forgotPassword.backToLogin,
            errorGeneric: m.login.errorGeneric,
            errorEmail: m.login.errorEmail,
            errorNotConfigured: m.login.errorNotConfigured,
          }}
        />
      </main>
    </div>
  );
}
