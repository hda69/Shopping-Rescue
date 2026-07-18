'use client';

import { useState } from 'react';
import type { AppLocale } from '@/lib/locale';

interface LoginFormProps {
  locale: AppLocale;
  labels: {
    email: string;
    submit: string;
    submitting: string;
    success: string;
    errorGeneric: string;
    errorEmail: string;
    errorNotConfigured: string;
  };
}

export function LoginForm({ locale, labels }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus('loading');
    setError(null);

    try {
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, locale }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        setStatus('error');
        if (data.error === 'invalid_email') setError(labels.errorEmail);
        else if (data.error === 'email_not_configured') setError(labels.errorNotConfigured);
        else setError(labels.errorGeneric);
        return;
      }

      setStatus('success');
    } catch {
      setStatus('error');
      setError(labels.errorGeneric);
    }
  }

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
      <button
        type="submit"
        disabled={status === 'loading' || status === 'success'}
        className="btn-glass-accent w-full"
      >
        {status === 'loading' ? labels.submitting : labels.submit}
      </button>
      {status === 'success' && <p className="text-sm text-emerald-700">{labels.success}</p>}
      {error && <p className="text-sm text-red-700">{error}</p>}
    </form>
  );
}
