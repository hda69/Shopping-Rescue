import { SiteHeader } from '@/components/site-header';
import { AuthForm } from '@/components/auth-form';
import { getMessages } from '@/config/messages';
import type { AppLocale } from '@/lib/locale';

export function SignupPageContent({ locale }: { locale: AppLocale }) {
  const m = getMessages(locale);

  return (
    <div className="min-h-screen section-muted">
      <SiteHeader variant="light" locale={locale} />
      <main className="section-container py-16">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-[#111]">{m.signup.title}</h1>
          <p className="mt-3 text-[#6e6e73]">{m.signup.subtitle}</p>
        </div>
        <AuthForm
          locale={locale}
          mode="signup"
          labels={{
            email: m.login.email,
            password: m.login.password,
            submit: m.signup.submit,
            submitting: m.signup.submitting,
            switchPrompt: m.signup.switchPrompt,
            switchLink: m.signup.switchLink,
            forgotPassword: m.login.forgotPassword,
            errorGeneric: m.login.errorGeneric,
            errorEmail: m.login.errorEmail,
            errorCredentials: m.login.errorCredentials,
            errorEmailTaken: m.login.errorEmailTaken,
            errorWeakPassword: m.login.errorWeakPassword,
          }}
        />
      </main>
    </div>
  );
}
