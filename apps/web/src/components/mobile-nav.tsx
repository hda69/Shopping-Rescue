'use client';

import { useEffect, useId, useState } from 'react';
import { usePathname } from 'next/navigation';

interface MobileNavProps {
  variant?: 'dark' | 'light';
  openLabel: string;
  closeLabel: string;
  children: React.ReactNode;
}

export function MobileNav({
  variant = 'light',
  openLabel,
  closeLabel,
  children,
}: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelId = useId();
  const isDark = variant === 'dark';

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        className={`inline-flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
          isDark
            ? 'text-white/80 hover:bg-white/10 hover:text-white'
            : 'text-[#6e6e73] hover:bg-black/5 hover:text-[#111]'
        }`}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? closeLabel : openLabel}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden
          >
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="17" x2="20" y2="17" />
          </svg>
        )}
      </button>

      {open && (
        <div
          id={panelId}
          className={`absolute inset-x-0 top-16 z-50 border-b px-4 py-4 shadow-lg ${
            isDark
              ? 'border-white/10 bg-[#0b0d14]/95 backdrop-blur-xl'
              : 'border-white/60 bg-white/95 backdrop-blur-xl'
          }`}
        >
          <div className="section-container flex flex-col gap-1 px-0">{children}</div>
        </div>
      )}
    </div>
  );
}
