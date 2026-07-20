import Link from 'next/link';

import { getMessages } from '@/config/messages';
import { SiteLogo } from '@/components/site-logo';
import type { ScanResultData } from '@/lib/scan-result';
import type { AppLocale } from '@/lib/locale';
import { localizePath } from '@/lib/locale';
import { devUnlockFullAudit } from '@/app/checkout/actions';
import type { RiskLevel } from '@shopping-rescue/shared';
import { MAX_RISK_SCORE } from '@shopping-rescue/shared';

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-blue-100 text-blue-800 border-blue-200',
  info: 'bg-gray-100 text-gray-700 border-gray-200',
};

interface ScanResultsPageContentProps {
  locale: AppLocale;
  data: ScanResultData | null;
  checkoutError: string | null;
  stripeReady: boolean;
  monitoringReady: boolean;
  agencyReady: boolean;
  devUnlockReady: boolean;
}

export function ScanResultsPageContent({
  locale,
  data,
  checkoutError,
  stripeReady,
  monitoringReady,
  agencyReady,
  devUnlockReady,
}: ScanResultsPageContentProps) {
  const m = getMessages(locale);
  const homeHref = localizePath('/', locale);
  const freeScanHref = localizePath('/free-scan', locale);
  const pricingHref = localizePath('/pricing', locale);

  if (!data) {
    return (
      <div className="section-container py-20 text-center">
        <p className="text-red-600">{m.scan.notFound}</p>
        <Link href={freeScanHref} className="btn-primary mt-4 inline-block">
          {m.scan.startNewScan}
        </Link>
      </div>
    );
  }

  const isRunning = !['completed', 'failed'].includes(data.status);
  const riskLabel =
    data.riskLevel && data.riskLevel in m.scan.riskLabels
      ? m.scan.riskLabels[data.riskLevel as RiskLevel]
      : '';

  return (
    <div className="min-h-screen bg-gray-50">
      {isRunning && <meta httpEquiv="refresh" content="3" />}

      <header className="border-b border-gray-200 bg-white">
        <div className="section-container flex h-16 items-center justify-between">
          <SiteLogo href={homeHref} size="sm" />
          <Link href={pricingHref} className="text-sm font-medium text-navy hover:underline">
            {m.scan.upgradeLink}
          </Link>
        </div>
      </header>

      <main className="section-container py-10">
        {checkoutError && (
          <div className="mb-8 rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
            {checkoutError}
          </div>
        )}

        {!stripeReady && data.status === 'completed' && data.lockedFindingsCount > 0 && (
          <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 px-6 py-4 text-sm text-amber-800">
            {m.scan.stripeBanner}
            {devUnlockReady && (
              <form action={devUnlockFullAudit} className="mt-4">
                <input type="hidden" name="scanId" value={data.scanId} />
                <input type="hidden" name="locale" value={locale} />
                <button type="submit" className="btn-secondary text-sm">
                  {m.scan.devUnlock}
                </button>
              </form>
            )}
          </div>
        )}

        {isRunning && (
          <div className="mb-8 space-y-4">
            {!data.workerOnline && data.status === 'queued' && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-6 py-4 text-amber-900">
                <p className="font-medium">{m.scan.workerOfflineTitle}</p>
                <p className="mt-2 text-sm text-amber-800">{m.scan.workerOfflineBody}</p>
                <code className="mt-3 block rounded-lg bg-amber-100 px-3 py-2 text-sm">pnpm dev</code>
                <p className="mt-2 text-xs text-amber-700">
                  {m.scan.workerOr}{' '}
                  <code className="rounded bg-amber-100 px-1">pnpm dev:web</code> ·{' '}
                  <code className="rounded bg-amber-100 px-1">pnpm dev:worker</code>
                </p>
              </div>
            )}

            <div className="rounded-xl border border-blue-200 bg-blue-50 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-navy border-t-transparent" />
                <div>
                  <p className="font-medium text-navy">
                    {data.status === 'queued' ? m.scan.scanQueued : m.scan.scanInProgress}
                  </p>
                  <p className="text-sm text-gray-600">
                    {m.scan.analyzing} {data.url}. {m.scan.refreshNote}
                  </p>
                  {data.jobProgress !== null && data.jobProgress > 0 && (
                    <p className="mt-1 text-xs text-gray-500">
                      {m.scan.progress}: {data.jobProgress}%
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {data.status === 'failed' && (
          <div className="mb-8 rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-red-700">
            {m.scan.scanFailed}
          </div>
        )}

        {data.status === 'completed' && (
          <>
            {data.isReportUnlocked && (
              <div className="mb-8 rounded-xl border border-green-200 bg-green-50 px-6 py-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-green-800">{m.scan.reportUnlocked}</p>
                  <a
                    href={`/api/reports/${encodeURIComponent(data.scanId)}/pdf`}
                    className="btn-primary shrink-0 text-center text-sm"
                    download
                  >
                    {m.scan.downloadPdf}
                  </a>
                </div>
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="rounded-xl border border-gray-200 bg-white p-6 lg:col-span-1">
                <p className="text-sm font-medium text-gray-500">{m.scan.riskScore}</p>
                <p className="mt-2 text-5xl font-bold text-navy">
                  {data.riskScore ?? '—'}
                  {data.riskScore !== null && (
                    <span className="text-2xl font-semibold text-gray-400">/{MAX_RISK_SCORE}</span>
                  )}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  {riskLabel}
                  {data.confidenceLevel ? ` · ${data.confidenceLevel} ${m.scan.confidence}` : ''}
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  {m.scan.riskScale.replace('{max}', String(MAX_RISK_SCORE))}
                </p>
                <div className="mt-4 space-y-1 text-sm text-gray-600">
                  <p>
                    {data.pagesCrawled} {m.scan.pagesCrawled}
                  </p>
                  <p>
                    {data.productsAnalyzed} {m.scan.productsAnalyzed}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6 lg:col-span-2">
                <p className="text-sm font-medium text-gray-500">{m.scan.issuesBySeverity}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {Object.entries(data.severityCounts).map(([severity, count]) => (
                    <span
                      key={severity}
                      className={`rounded-full border px-3 py-1 text-sm font-medium ${SEVERITY_COLORS[severity] ?? SEVERITY_COLORS.info}`}
                    >
                      {m.scan.severities[severity as keyof typeof m.scan.severities] ?? severity}:{' '}
                      {count}
                    </span>
                  ))}
                  {Object.keys(data.severityCounts).length === 0 && (
                    <span className="text-sm text-gray-500">{m.scan.noIssues}</span>
                  )}
                </div>
              </div>
            </div>

            {data.isReportUnlocked && data.checklist.length > 0 && (
              <section className="mt-10">
                <h2 className="text-xl font-bold text-navy">{m.scan.checklistTitle}</h2>
                <p className="mt-2 text-sm text-gray-600">{m.scan.checklistSub}</p>
                <ol className="mt-4 space-y-4">
                  {data.checklist.map((item) => (
                    <li key={item.findingId} className="rounded-xl border border-gray-200 bg-white p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">
                          {item.priority}
                        </span>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-xs font-semibold uppercase ${SEVERITY_COLORS[item.severity] ?? ''}`}
                        >
                          {m.scan.severities[item.severity as keyof typeof m.scan.severities] ??
                            item.severity}
                        </span>
                        <span className="font-semibold text-navy">{item.title}</span>
                      </div>
                      <p className="mt-3 text-sm text-gray-600">
                        <strong>{m.scan.summary}</strong> {item.recommendation}
                      </p>
                      <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-gray-700">
                        {item.steps.map((step) => (
                          <li key={step}>{step}</li>
                        ))}
                      </ol>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            <section className="mt-10">
              <h2 className="text-xl font-bold text-navy">{m.scan.findingsTitle}</h2>

              <div className="mt-4 space-y-4">
                {data.findings.map((finding) => (
                  <article key={finding.id} className="rounded-xl border border-gray-200 bg-white p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-xs font-semibold uppercase ${SEVERITY_COLORS[finding.severity] ?? ''}`}
                      >
                        {m.scan.severities[finding.severity as keyof typeof m.scan.severities] ??
                          finding.severity}
                      </span>
                      <span className="text-xs text-gray-500">{finding.category}</span>
                      {data.isReportUnlocked && finding.ruleId && (
                        <span className="text-xs text-gray-400">
                          {m.scan.rule} {finding.ruleId}
                        </span>
                      )}
                      {data.isReportUnlocked && (
                        <span className="text-xs text-gray-400">
                          {Math.round(finding.confidence * 100)}% {m.scan.confidence}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 font-semibold text-navy">{finding.title}</h3>
                    <p className="mt-2 text-sm text-gray-600">{finding.explanation}</p>
                    <p className="mt-2 text-sm text-navy">
                      <strong>{m.scan.recommendation}</strong> {finding.recommendation}
                    </p>
                    {finding.affectedUrl && (
                      <p className="mt-1 break-all text-xs text-gray-400">{finding.affectedUrl}</p>
                    )}
                    {data.isReportUnlocked &&
                      finding.evidenceLines &&
                      finding.evidenceLines.length > 0 && (
                        <div className="mt-4 rounded-lg bg-gray-50 p-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            {m.scan.evidence}
                          </p>
                          <ul className="mt-2 space-y-1 text-sm text-gray-700">
                            {finding.evidenceLines.map((line) => (
                              <li key={line} className="break-all">
                                {line}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    {data.isReportUnlocked &&
                      finding.remediationSteps &&
                      finding.remediationSteps.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-semibold text-navy">{m.scan.howToFix}</p>
                          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-gray-700">
                            {finding.remediationSteps.map((step) => (
                              <li key={step}>{step}</li>
                            ))}
                          </ol>
                        </div>
                      )}
                  </article>
                ))}
              </div>

              {data.lockedFindingsCount > 0 && (
                <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
                  <p className="text-lg font-semibold text-navy">
                    {m.scan.lockedTitle.replace('{count}', String(data.lockedFindingsCount))}
                  </p>
                  <p className="mt-2 text-sm text-gray-600">{m.scan.lockedSub}</p>
                  <div className="mt-4 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                    {stripeReady ? (
                      <a
                        href={`/api/checkout?scanId=${encodeURIComponent(data.scanId)}&locale=${locale}`}
                        className="btn-primary inline-block text-center"
                      >
                        {m.scan.unlockFullReport}
                      </a>
                    ) : (
                      <Link
                        href={`${pricingHref}?scanId=${data.scanId}`}
                        className="btn-primary inline-block text-center"
                      >
                        {m.common.viewPricing}
                      </Link>
                    )}
                    {monitoringReady && (
                      <a
                        href={`/api/checkout?scanId=${encodeURIComponent(data.scanId)}&locale=${locale}&plan=monitoring_pro`}
                        className="btn-glass inline-block text-center"
                      >
                        {m.scan.subscribeMonitoring}
                      </a>
                    )}
                    {agencyReady && (
                      <a
                        href={`/api/checkout?scanId=${encodeURIComponent(data.scanId)}&locale=${locale}&plan=agency`}
                        className="btn-glass inline-block text-center"
                      >
                        {m.scan.subscribeAgency}
                      </a>
                    )}
                  </div>

                  <div className="mt-8 border-t border-gray-200 pt-8 text-left">
                    <p className="text-center text-sm font-semibold uppercase tracking-wide text-gray-500">
                      {m.scan.comparePlansTitle}
                    </p>
                    <div className="mt-6 grid gap-6 sm:grid-cols-3">
                      <div>
                        <p className="font-semibold text-navy">{m.pricing.fullAudit}</p>
                        <p className="mt-1 text-2xl font-extrabold tracking-tight text-[#111]">€79</p>
                        <p className="text-xs text-gray-500">{m.pricing.oneTime}</p>
                        <ul className="mt-3 space-y-1.5 text-sm text-gray-600">
                          {m.pricing.fullFeatures.map((feature) => (
                            <li key={feature} className="flex gap-2">
                              <span className="text-[#0a84ff]" aria-hidden>
                                ·
                              </span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold text-navy">{m.pricing.monitoringPro}</p>
                        <p className="mt-1 text-2xl font-extrabold tracking-tight text-[#111]">€49</p>
                        <p className="text-xs text-gray-500">{m.pricing.perMonth}</p>
                        <ul className="mt-3 space-y-1.5 text-sm text-gray-600">
                          {m.pricing.monitoringFeatures.map((feature) => (
                            <li key={feature} className="flex gap-2">
                              <span className="text-[#0a84ff]" aria-hidden>
                                ·
                              </span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold text-navy">{m.pricing.agency}</p>
                        <p className="mt-1 text-2xl font-extrabold tracking-tight text-[#111]">€199</p>
                        <p className="text-xs text-gray-500">{m.pricing.perMonth}</p>
                        <ul className="mt-3 space-y-1.5 text-sm text-gray-600">
                          {m.pricing.agencyFeatures.map((feature) => (
                            <li key={feature} className="flex gap-2">
                              <span className="text-[#0a84ff]" aria-hidden>
                                ·
                              </span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </>
        )}

        <p className="alert-banner mt-10 text-xs">{data.disclaimer}</p>
      </main>
    </div>
  );
}
