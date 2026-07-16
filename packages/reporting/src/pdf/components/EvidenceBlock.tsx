import type { AppLocale } from '@shopping-rescue/shared/i18n';
import { getPdfCopy } from '../copy';

interface EvidenceBlockProps {
  evidence: Record<string, string | number | boolean>;
  locale?: AppLocale;
}

export function EvidenceBlock({ evidence, locale = 'en' }: EvidenceBlockProps) {
  const copy = getPdfCopy(locale);
  const entries = Object.entries(evidence);

  if (entries.length === 0) {
    return (
      <div className="info-block avoid-page-break">
        <div className="info-block__label">{copy.technicalEvidence}</div>
        <div className="info-block__text">{copy.noEvidence}</div>
      </div>
    );
  }

  return (
    <div className="info-block avoid-page-break">
      <div className="info-block__label">{copy.technicalEvidence}</div>
      <div className="evidence-grid">
        {entries.map(([key, value]) => (
          <div key={key} className="evidence-item">
            <div className="evidence-item__key">{key}</div>
            <div className="evidence-item__value">{String(value)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
