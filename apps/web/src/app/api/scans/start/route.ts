import { loadEnv } from '@shopping-rescue/shared/load-env';
import { freeScanSchema, isValidUrl } from '@shopping-rescue/shared/validation';
import { createFreeScan, formatDbError } from '@shopping-rescue/database';
import { NextResponse } from 'next/server';
import { localizePath, parseLocaleParam } from '@/lib/locale';

loadEnv();

function redirectToFreeScan(request: Request, locale: 'en' | 'fr', error: string, message?: string) {
  const url = new URL(localizePath('/free-scan', locale), request.url);
  url.searchParams.set('error', error);
  if (message) url.searchParams.set('message', message);
  return NextResponse.redirect(url, 303);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const locale = parseLocaleParam(formData.get('locale')?.toString());
  const raw = {
    url: formData.get('url'),
    email: formData.get('email'),
    platform: formData.get('platform'),
    country: formData.get('country'),
    mcIssueType: formData.get('mcIssueType'),
    reviewRequests: Number(formData.get('reviewRequests') ?? 0),
    locale: formData.get('locale')?.toString() === 'fr' ? 'fr' : 'en',
  };

  const result = freeScanSchema.safeParse(raw);

  if (!result.success) {
    return redirectToFreeScan(request, locale, 'validation');
  }

  if (!isValidUrl(result.data.url)) {
    return redirectToFreeScan(request, locale, 'invalid_url');
  }

  try {
    const scan = await createFreeScan(result.data);
    return NextResponse.redirect(
      new URL(localizePath(`/scan/${scan.scanId}`, locale), request.url),
      303,
    );
  } catch (error) {
    return redirectToFreeScan(request, locale, 'server', formatDbError(error));
  }
}
