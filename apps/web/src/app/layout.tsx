import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { headers } from 'next/headers';

import { GoogleAdsTag } from '@/components/google-ads-tag';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: {
    default: 'Shopping Rescue — Google Merchant Center Diagnostics',
    template: '%s | Shopping Rescue',
  },
  description:
    'Independent SaaS for diagnosing Google Merchant Center suspensions, misrepresentation warnings, and product disapprovals. Get evidence-based findings and actionable recommendations.',
  keywords: [
    'Google Merchant Center',
    'account suspension',
    'misrepresentation',
    'product disapprovals',
    'e-commerce diagnostics',
  ],
  authors: [{ name: 'Shopping Rescue' }],
  icons: {
    icon: [
      { url: '/logo-icon.png', type: 'image/png', sizes: '512x512' },
      { url: '/favicon.ico', type: 'image/png' },
    ],
    shortcut: '/logo-icon.png',
    apple: [{ url: '/logo-icon.png', type: 'image/png', sizes: '512x512' }],
  },
  robots: { index: true, follow: true },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') ?? '';
  const lang = pathname === '/fr' || pathname.startsWith('/fr/') ? 'fr' : 'en';

  return (
    <html lang={lang} className={inter.variable}>
      <body className="font-sans">
        <GoogleAdsTag />
        {children}
      </body>
    </html>
  );
}
