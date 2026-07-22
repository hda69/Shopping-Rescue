import type { ReactNode } from 'react';

import { LegalPageShell } from '@/components/legal-page-shell';
import {
  getLegalDocument,
  getLegalPath,
  type LegalBlock,
  type LegalDocumentId,
} from '@/config/legal-content';
import type { AppLocale } from '@/lib/locale';
import { CONTACT_EMAIL } from '@shopping-rescue/shared';

const INLINE_TOKEN =
  /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;

function resolveContactPlaceholder(value: string): string {
  return value.replaceAll('CONTACT_EMAIL', CONTACT_EMAIL);
}

function parseInlineText(text: string, keyPrefix: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let tokenIndex = 0;

  for (const match of text.matchAll(INLINE_TOKEN)) {
    const index = match.index ?? 0;

    if (index > lastIndex) {
      parts.push(text.slice(lastIndex, index));
    }

    const token = match[0];

    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={`${keyPrefix}-strong-${tokenIndex}`}>{token.slice(2, -2)}</strong>,
      );
    } else {
      const linkMatch = /\[([^\]]+)\]\(([^)]+)\)/.exec(token);
      if (linkMatch) {
        const label = linkMatch[1] ?? '';
        const href = linkMatch[2] ?? '';
        const resolvedHref = resolveContactPlaceholder(href);
        const resolvedLabel = resolveContactPlaceholder(label);
        const external = resolvedHref.startsWith('http');

        parts.push(
          <a
            key={`${keyPrefix}-link-${tokenIndex}`}
            href={resolvedHref}
            {...(external ? { rel: 'noopener noreferrer' } : {})}
          >
            {resolvedLabel}
          </a>,
        );
      }
    }

    lastIndex = index + token.length;
    tokenIndex += 1;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

function renderBlock(block: LegalBlock, index: number): ReactNode {
  const key = `legal-block-${index}`;

  switch (block.type) {
    case 'h2':
      return <h2 key={key}>{block.text}</h2>;
    case 'p':
      return <p key={key}>{block.text ? parseInlineText(block.text, key) : null}</p>;
    case 'ul':
      return (
        <ul key={key}>
          {block.items?.map((item, itemIndex) => (
            <li key={`${key}-item-${itemIndex}`}>{parseInlineText(item, `${key}-item-${itemIndex}`)}</li>
          ))}
        </ul>
      );
    case 'callout':
      return (
        <p
          key={key}
          className="rounded-xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-[#92400e]"
        >
          {block.text ? parseInlineText(block.text, key) : null}
        </p>
      );
    default:
      return null;
  }
}

interface LegalDocumentPageProps {
  id: LegalDocumentId;
  locale: AppLocale;
}

export function LegalDocumentPage({ id, locale }: LegalDocumentPageProps) {
  const document = getLegalDocument(id, locale);

  return (
    <LegalPageShell
      title={document.title}
      lastUpdated={document.lastUpdated}
      currentPath={getLegalPath(id, locale)}
      locale={locale}
    >
      {document.blocks.map((block, index) => renderBlock(block, index))}
    </LegalPageShell>
  );
}

export function buildLegalMetadata(id: LegalDocumentId, locale: AppLocale) {
  const document = getLegalDocument(id, locale);
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/, '');
  const enPath = getLegalPath(id, 'en');
  const frPath = getLegalPath(id, 'fr');
  const canonical = locale === 'fr' ? `${baseUrl}${frPath}` : `${baseUrl}${enPath}`;

  return {
    title: document.title,
    description: document.metaDescription,
    alternates: {
      canonical,
      languages: {
        en: `${baseUrl}${enPath}`,
        fr: `${baseUrl}${frPath}`,
        'x-default': `${baseUrl}${enPath}`,
      },
    },
    openGraph: {
      title: document.title,
      description: document.metaDescription,
      url: canonical,
      type: 'website' as const,
      images: [{ url: '/logo-icon.png' }],
    },
  };
}
