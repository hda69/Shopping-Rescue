'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { AppLocale } from '@/lib/locale';
import { localizePath } from '@/lib/locale';

interface AuthFormLabels {
  email: string;
  password: string;
  submit: string;
  submitting: string;
  switchPrompt: string;
  switchLink: string;
  forgotPassword: string;
  errorGeneric: string;
  errorEmail: string;
  errorCredentials: string;
  errorEmailTaken: string;
  errorWeakPassword: string;
}

interface AuthFormProps {
  locale: AppLocale;
  mode: 'login' | 'signup';
  labels: AuthFormLabels;
}

export function AuthForm({ locale, mode, labels }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus('loading');
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, locale, mode }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        redirect?: string;
      };

      if (!response.ok) {
        setStatus('error');
        if (data.error === 'invalid_email') setError(labels.errorEmail);
        else if (data.error === 'invalid_credentials') setError(labels.errorCredentials);
        else if (data.error === 'email_taken') setError(labels.errorEmailTaken);
        else if (data.error === 'weak_password') setError(labels.errorWeakPassword);
        else setError(labels.errorGeneric);
        return;
      }

      window.location.href = data.redirect || localizePath('/dashboard', locale);
    } catch {
      setStatus('error');
      setError(labels.errorGeneric);
    }
  }

  const switchHref =
    mode === 'login' ? localizePath('/signup', locale) : localizePath('/login', locale);

  return (
    <form onSubmit={onSubmit} className="glass-card mx-auto mt-10 max-w-md space-y-4 p-8">
      <label className="block text-sm font-medium text-[#111]">
        {labels.email}
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="glass-input mt-2 w-full"
          autoComplete="email"
        />
      </label>
      <label className="block text-sm font-medium text-[#111]">
        {labels.password}
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="glass-input mt-2 w-full"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
        />
      </label>
      <button type="submit" disabled={status === 'loading'} className="btn-glass-accent w-full">
        {status === 'loading' ? labels.submitting : labels.submit}
      </button>
      {mode === 'login' && (
        <p className="text-center text-sm">
          <Link href={localizePath('/forgot-password', locale)} className="text-[#0a84ff]">
            {labels.forgotPassword}
          </Link>
        </p>
      )}
      <p className="text-center text-sm text-[#6e6e73]">
        {labels.switchPrompt}{' '}
        <Link href={switchHref} className="font-medium text-[#0a84ff]">
          {labels.switchLink}
        </Link>
      </p>
      {error && <p className="text-sm text-red-700">{error}</p>}
    </form>
  );
}
