'use server';

import { redirect } from 'next/navigation';
import { loadEnv } from '@shopping-rescue/shared/load-env';
import { freeScanSchema, isValidUrl } from '@shopping-rescue/shared/validation';
import { createFreeScan, formatDbError } from '@shopping-rescue/database';
import { localizePath, parseLocaleParam } from '@shopping-rescue/shared/i18n';

loadEnv();

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
    const params = new URLSearchParams({ error: 'validation' });
    redirect(`${localizePath('/free-scan', locale)}?${params.toString()}`);
  }

  if (!isValidUrl(result.data.url)) {
    const params = new URLSearchParams({ error: 'invalid_url' });
    redirect(`${localizePath('/free-scan', locale)}?${params.toString()}`);
  }

  let scan;
  try {
    scan = await createFreeScan(result.data);
  } catch (error) {
    const message = formatDbError(error);
    const params = new URLSearchParams({ error: 'server', message });
    redirect(`${localizePath('/free-scan', locale)}?${params.toString()}`);
  }

  redirect(localizePath(`/scan/${scan.scanId}`, locale));
}
