'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { GOOGLE_ADS_ID } from '@/components/google-ads-tag';

/** Full send_to from Google Ads Purchase event snippet */
export const GOOGLE_ADS_PURCHASE_SEND_TO =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_SEND_TO?.trim() ||
  'AW-17892406919/RYdXCMq7ydYcEIft4dNC';

interface GoogleAdsPurchaseConversionProps {
  transactionId: string;
  value: number;
  currency?: string;
  redirectTo: string;
}

/**
 * Fires the Google Ads Purchase conversion once, then redirects.
 * Must run on /checkout/success before any server-side redirect.
 */
export function GoogleAdsPurchaseConversion({
  transactionId,
  value,
  currency = 'USD',
  redirectTo,
}: GoogleAdsPurchaseConversionProps) {
  const router = useRouter();
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    const storageKey = `gads_purchase_${transactionId}`;
    const alreadySent =
      typeof window !== 'undefined' && sessionStorage.getItem(storageKey) === '1';

    if (!alreadySent && GOOGLE_ADS_PURCHASE_SEND_TO && typeof window.gtag === 'function') {
      window.gtag('event', 'conversion', {
        send_to: GOOGLE_ADS_PURCHASE_SEND_TO,
        value,
        currency,
        transaction_id: transactionId,
      });
      sessionStorage.setItem(storageKey, '1');
    }

    const t = window.setTimeout(() => {
      router.replace(redirectTo);
    }, GOOGLE_ADS_PURCHASE_SEND_TO ? 800 : 200);

    return () => window.clearTimeout(t);
  }, [transactionId, value, currency, redirectTo, router]);

  return null;
}

export { GOOGLE_ADS_ID };
