'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

import { localizePath, type AppLocale } from '@/lib/locale';

interface FreeScanNavLinkProps {
  locale: AppLocale;
  label: string;
  className: string;
}

export function FreeScanNavLink({ locale, label, className }: FreeScanNavLinkProps) {
  const pathname = usePathname();
  const freeScanHref = localizePath('/free-scan', locale);
  const onFreeScanPage =
    pathname === '/free-scan' ||
    pathname === '/fr/free-scan' ||
    pathname.startsWith('/free-scan?') ||
    pathname.startsWith('/fr/free-scan?');

  // Avoid a same-page header CTA that steals clicks from the form submit button
  // when the sticky header overlaps the form on scroll.
  if (onFreeScanPage) {
    return null;
  }

  return (
    <Link href={freeScanHref} className={className}>
      {label}
    </Link>
  );
}
