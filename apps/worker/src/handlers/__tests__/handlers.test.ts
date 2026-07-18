import { describe, expect, it } from 'vitest';
import { getHandler, getRegisteredJobTypes } from '../index.js';

describe('handler registry', () => {
  it('registers FREE_SITE_SCAN and WEEKLY_MONITORING_SCAN handlers', () => {
    expect(getRegisteredJobTypes()).toContain('FREE_SITE_SCAN');
    expect(getRegisteredJobTypes()).toContain('WEEKLY_MONITORING_SCAN');
    expect(getHandler('FREE_SITE_SCAN')).toBeDefined();
    expect(getHandler('WEEKLY_MONITORING_SCAN')).toBeDefined();
  });

  it('returns undefined for unknown job types', () => {
    expect(getHandler('UNKNOWN_JOB')).toBeUndefined();
  });
});
