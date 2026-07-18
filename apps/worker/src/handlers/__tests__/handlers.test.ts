import { describe, expect, it } from 'vitest';
import { getHandler, getRegisteredJobTypes } from '../index.js';

describe('handler registry', () => {
  it('registers FREE_SITE_SCAN, WEEKLY_MONITORING_SCAN, and MERCHANT_SYNC handlers', () => {
    expect(getRegisteredJobTypes()).toContain('FREE_SITE_SCAN');
    expect(getRegisteredJobTypes()).toContain('WEEKLY_MONITORING_SCAN');
    expect(getRegisteredJobTypes()).toContain('MERCHANT_SYNC');
    expect(getHandler('FREE_SITE_SCAN')).toBeDefined();
    expect(getHandler('WEEKLY_MONITORING_SCAN')).toBeDefined();
    expect(getHandler('MERCHANT_SYNC')).toBeDefined();
  });

  it('returns undefined for unknown job types', () => {
    expect(getHandler('UNKNOWN_JOB')).toBeUndefined();
  });
});
