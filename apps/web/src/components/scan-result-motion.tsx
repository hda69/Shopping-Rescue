'use client';

import { useEffect, useState } from 'react';

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(media.matches);
    function onChange() {
      setReduced(media.matches);
    }
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

function useCountUp(target: number, durationMs: number): number {
  const reducedMotion = usePrefersReducedMotion();
  const [value, setValue] = useState(reducedMotion ? target : 0);

  useEffect(() => {
    if (reducedMotion || target <= 0) {
      setValue(target);
      return;
    }

    let frame = 0;
    const start = performance.now();

    function tick(now: number) {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs, reducedMotion]);

  return value;
}

export function AnimatedLockedTitle({
  template,
  count,
}: {
  template: string;
  count: number;
}) {
  const value = useCountUp(count, 900);
  return <>{template.replace('{count}', String(value))}</>;
}

export function AnimatedRiskScore({
  score,
  maxScore,
  label,
  confidence,
  confidenceSuffix,
  scaleLabel,
}: {
  score: number | null;
  maxScore: number;
  label: string;
  confidence: string | null;
  confidenceSuffix: string;
  scaleLabel: string;
}) {
  const target = score ?? 0;
  const value = useCountUp(score === null ? 0 : target, 1100);
  const reducedMotion = usePrefersReducedMotion();
  const targetFill = score === null ? 0 : Math.min(100, Math.max(0, (score / maxScore) * 100));
  const [fillPercent, setFillPercent] = useState(reducedMotion ? targetFill : 0);

  useEffect(() => {
    if (reducedMotion) {
      setFillPercent(targetFill);
      return;
    }
    const id = requestAnimationFrame(() => setFillPercent(targetFill));
    return () => cancelAnimationFrame(id);
  }, [targetFill, reducedMotion]);

  return (
    <div className="risk-score-panel">
      <p className="mt-2 text-5xl font-bold text-navy risk-score-value">
        {score === null ? '—' : value}
        {score !== null && (
          <span className="text-2xl font-semibold text-gray-400">/{maxScore}</span>
        )}
      </p>
      <div className="risk-score-track mt-4" aria-hidden>
        <div className="risk-score-fill" style={{ width: `${fillPercent}%` }} />
      </div>
      <p className="mt-2 text-sm text-gray-600">
        {label}
        {confidence ? ` · ${confidence} ${confidenceSuffix}` : ''}
      </p>
      <p className="mt-2 text-xs text-gray-500">{scaleLabel}</p>
    </div>
  );
}
