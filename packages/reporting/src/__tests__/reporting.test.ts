import { describe, it, expect } from 'vitest';
import { buildScanReport } from '../builder.js';

describe('buildScanReport', () => {
  it('builds a report with risk score and disclaimer', () => {
    const report = buildScanReport({
      scanId: 'scan-1',
      siteUrl: 'https://example.com',
      findings: [],
      generatedAt: new Date('2026-07-12T00:00:00.000Z'),
    });

    expect(report.scanId).toBe('scan-1');
    expect(report.riskScore).toBe(0);
    expect(report.disclaimer).toContain('independent service');
  });
});
