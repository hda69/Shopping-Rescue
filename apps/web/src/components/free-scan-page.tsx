import { getMessages } from '@/config/messages';
import { SiteHeader } from '@/components/site-header';
import type { AppLocale } from '@/lib/locale';
import { localizePath } from '@/lib/locale';

const PLATFORM_KEYS = ['shopify', 'woocommerce', 'magento', 'prestashop', 'custom', 'unknown'] as const;
const COUNTRY_KEYS = ['FR', 'BE', 'CH', 'DE', 'GB', 'US', 'CA', 'ES', 'IT', 'NL'] as const;
const ISSUE_KEYS = [
  'suspension',
  'misrepresentation',
  'website_improvement',
  'product_disapproval',
  'other',
  'none',
] as const;

function getErrorMessage(locale: AppLocale, error?: string, message?: string): string | null {
  const m = getMessages(locale).freeScan.errors;
  if (!error) return null;
  if (error === 'validation') return m.validation;
  if (error === 'invalid_url') return m.invalid_url;
  if (error === 'missing_scan') return m.missing_scan;
  return message ?? error;
}

function resolvePrefill(value: string | undefined, allowed: readonly string[], fallback: string): string {
  if (value && allowed.includes(value)) return value;
  return fallback;
}

interface FreeScanPageContentProps {
  locale: AppLocale;
  error?: string;
  message?: string;
  issue?: string;
  platform?: string;
  dbOfflineMessage?: string;
}

export function FreeScanPageContent({
  locale,
  error,
  message,
  issue,
  platform,
  dbOfflineMessage,
}: FreeScanPageContentProps) {
  const m = getMessages(locale);
  const errorMessage = getErrorMessage(locale, error, message);
  const defaultMcIssue = resolvePrefill(issue, ISSUE_KEYS, 'none');
  const defaultPlatform = resolvePrefill(platform, PLATFORM_KEYS, 'unknown');
  const formAction = '/api/scans/start';

  return (
    <div className="min-h-screen section-muted">
      <SiteHeader variant="light" locale={locale} />

      <main className="section-container py-12">
        <div className="mx-auto max-w-xl">
          <h1 className="text-3xl font-bold tracking-tight text-[#111]">{m.freeScan.title}</h1>
          <p className="mt-2 text-[#6e6e73]">{m.freeScan.subtitle}</p>

          <form action={formAction} method="POST" className="glass-card mt-8 space-y-5">
            <input type="hidden" name="locale" value={locale} />

            {dbOfflineMessage && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                {dbOfflineMessage}
              </div>
            )}

            <div>
              <label htmlFor="url" className="block text-sm font-medium text-[#111]">
                {m.freeScan.storeUrl}
              </label>
              <input
                id="url"
                name="url"
                type="text"
                inputMode="url"
                autoComplete="url"
                required
                placeholder={m.freeScan.storeUrlPlaceholder}
                className="glass-input"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#111]">
                {m.freeScan.email}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder={m.freeScan.emailPlaceholder}
                className="glass-input"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="platform" className="block text-sm font-medium text-[#111]">
                  {m.freeScan.platform}
                </label>
                <select
                  id="platform"
                  name="platform"
                  required
                  defaultValue={defaultPlatform}
                  className="glass-input"
                >
                  {PLATFORM_KEYS.map((key) => (
                    <option key={key} value={key}>
                      {m.freeScan.platforms[key]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="country" className="block text-sm font-medium text-[#111]">
                  {m.freeScan.country}
                </label>
                <select id="country" name="country" required defaultValue="FR" className="glass-input">
                  {COUNTRY_KEYS.map((key) => (
                    <option key={key} value={key}>
                      {m.freeScan.countries[key]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="mcIssueType" className="block text-sm font-medium text-[#111]">
                {m.freeScan.mcIssue}
              </label>
              <select
                id="mcIssueType"
                name="mcIssueType"
                required
                defaultValue={defaultMcIssue}
                className="glass-input"
              >
                {ISSUE_KEYS.map((key) => (
                  <option key={key} value={key}>
                    {m.freeScan.issues[key]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="reviewRequests" className="block text-sm font-medium text-[#111]">
                {m.freeScan.reviewRequests}
              </label>
              <input
                id="reviewRequests"
                name="reviewRequests"
                type="number"
                min={0}
                max={10}
                defaultValue={0}
                className="glass-input"
              />
            </div>

            {errorMessage && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={Boolean(dbOfflineMessage)}
              className="btn-glass-accent w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              {m.freeScan.submit}
            </button>

            <p className="text-center text-xs text-[#98989d]">{m.freeScan.consent}</p>
          </form>
        </div>
      </main>
    </div>
  );
}
