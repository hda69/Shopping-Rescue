'use client';

import { useState } from 'react';
import type { AppLocale } from '@/lib/locale';
import { localizePath } from '@/lib/locale';

interface ResetPasswordFormProps {
  locale: AppLocale;
  token: string;
  labels: {
    password: string;
    submit: string;
    submitting: string;
    errorGeneric: string;
    errorToken: string;
    errorWeakPassword: string;
  };
}

export function ResetPasswordForm({ locale, token, labels }: ResetPasswordFormProps) {
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus('loading');
    setError(null);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, locale }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        redirect?: string;
      };

      if (!response.ok) {
        setStatus('error');
        if (data.error === 'invalid_token') setError(labels.errorToken);
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

  return (
    <form onSubmit={onSubmit} className="glass-card mx-auto mt-10 max-w-md space-y-4 p-8">
      <label className="block text-sm font-medium text-[#111]">
        {labels.password}
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="glass-input mt-2 w-full"
          autoComplete="new-password"
        />
      </label>
      <button type="submit" disabled={status === 'loading'} className="btn-glass-accent w-full">
        {status === 'loading' ? labels.submitting : labels.submit}
      </button>
      {error && <p className="text-sm text-red-700">{error}</p>}
    </form>
  );
}
