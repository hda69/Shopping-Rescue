'use client';

import Script from 'next/script';

export const GOOGLE_ADS_ID = 'AW-17892406919';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Base Google Ads tag — loads once site-wide via the root layout. */
export function GoogleAdsTag() {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-ads-gtag" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GOOGLE_ADS_ID}');
        `}
      </Script>
    </>
  );
}
