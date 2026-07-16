import Link from 'next/link';
import type { ReactNode } from 'react';

import { SiteHeader } from '@/components/site-header';
import { getLegalPath, type LegalDocumentId } from '@/config/legal-content';
import { getMessages } from '@/config/messages';
import type { AppLocale } from '@/lib/locale';
import { localizePath } from '@/lib/locale';

const LEGAL_DOCUMENT_IDS: LegalDocumentId[] = ['terms', 'privacy', 'disclaimer'];

interface LegalPageShellProps {
  title: string;
  lastUpdated: string;
  children: ReactNode;
  currentPath: string;
  locale: AppLocale;
}

export function LegalPageShell({
  title,
  lastUpdated,
  children,
  currentPath,
  locale,
}: LegalPageShellProps) {
  const m = getMessages(locale);

  const legalLinks = LEGAL_DOCUMENT_IDS.map((id) => ({
    href: getLegalPath(id, locale),
    label:
      id === 'terms'
        ? m.common.terms
        : id === 'privacy'
          ? m.common.privacy
          : m.common.disclaimer,
  }));

  return (
    <div className="min-h-screen section-muted">
      <SiteHeader variant="light" locale={locale} />

      <main className="section-container py-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <Link
            href={localizePath('/', locale)}
            className="text-sm font-medium text-[#6e6e73] transition-colors hover:text-[#111]"
          >
            {m.legal.backToHome}
          </Link>

          <article className="glass-card mt-6 p-8 sm:p-12">
            <header className="border-b border-black/5 pb-8">
              <h1 className="text-3xl font-bold tracking-tight text-[#111]">{title}</h1>
              <p className="mt-3 text-sm text-[#6e6e73]">
                {m.legal.lastUpdated} {lastUpdated}
              </p>
            </header>

            <div className="legal-prose mt-8">{children}</div>
          </article>

          <nav
            aria-label={m.legal.legalNavAriaLabel}
            className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-[#6e6e73]"
          >
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  currentPath === link.href
                    ? 'font-semibold text-[#111]'
                    : 'transition-colors hover:text-[#111]'
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </main>

      <footer className="border-t border-black/5 bg-white/40 py-8 backdrop-blur-md">
        <div className="section-container flex flex-col items-center justify-between gap-4 text-sm text-[#6e6e73] sm:flex-row">
          <p>
            © {new Date().getFullYear()} Shopping Rescue. {m.common.rightsReserved}
          </p>
          <div className="flex gap-6">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-[#111]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
