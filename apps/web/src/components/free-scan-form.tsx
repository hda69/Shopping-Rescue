'use client';

import { useFormStatus } from 'react-dom';
import type { ReactNode } from 'react';

import { startFreeScan } from '@/app/free-scan/actions';

interface FreeScanFormProps {
  locale: string;
  submitLabel: string;
  submittingLabel: string;
  children: ReactNode;
}

function SubmitButton({
  submitLabel,
  submittingLabel,
}: {
  submitLabel: string;
  submittingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="btn-glass-accent relative z-10 w-full disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? submittingLabel : submitLabel}
    </button>
  );
}

export function FreeScanForm({ locale, submitLabel, submittingLabel, children }: FreeScanFormProps) {
  return (
    <form action={startFreeScan} className="glass-card relative z-10 mt-8 space-y-5">
      <input type="hidden" name="locale" value={locale} />
      {children}
      <SubmitButton submitLabel={submitLabel} submittingLabel={submittingLabel} />
    </form>
  );
}
