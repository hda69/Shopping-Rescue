'use server';

import { redirect } from 'next/navigation';
import { loadEnv } from '@shopping-rescue/shared/load-env';
import { freeScanSchema, isValidUrl } from '@shopping-rescue/shared/validation';
import { createFreeScan, formatDbError } from '@shopping-rescue/database';
import { localizePath, parseLocaleParam } from '@shopping-rescue/shared/i18n';

loadEnv();

function redirectWithError(
  locale: 'en' | 'fr',
  error: string,
  formData: FormData,
  message?: string,
): never {
  const params = new URLSearchParams({ error });
  if (message) params.set('message', message);

  const url = formData.get('url')?.toString();
  const email = formData.get('email')?.toString();
  const platform = formData.get('platform')?.toString();
  const mcIssueType = formData.get('mcIssueType')?.toString();

  if (url) params.set('url', url);
  if (email) params.set('email', email);
  if (platform) params.set('platform', platform);
  if (mcIssueType) params.set('issue', mcIssueType);

  redirect(`${localizePath('/free-scan', locale)}?${params.toString()}`);
}

export async function startFreeScan(formData: FormData) {
  const locale = parseLocaleParam(formData.get('locale')?.toString());
  const raw = {
    url: formData.get('url'),
    email: formData.get('email'),
    platform: formData.get('platform'),
    country: formData.get('country'),
    mcIssueType: formData.get('mcIssueType'),
    reviewRequests: Number(formData.get('reviewRequests') ?? 0),
    locale,
  };

  const result = freeScanSchema.safeParse(raw);

  if (!result.success) {
    redirectWithError(locale, 'validation', formData);
  }

  if (!isValidUrl(result.data.url)) {
    redirectWithError(locale, 'invalid_url', formData);
  }

  let scan;
  try {
    scan = await createFreeScan(result.data);
  } catch (error) {
    redirectWithError(locale, 'server', formData, formatDbError(error));
  }

  redirect(localizePath(`/scan/${scan.scanId}`, locale));
}
