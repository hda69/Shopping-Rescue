import { describe, expect, it } from 'vitest';
import { getHandler, getRegisteredJobTypes } from '../index.js';

describe('handler registry', () => {
  it('registers FREE_SITE_SCAN handler', () => {
    expect(getRegisteredJobTypes()).toContain('FREE_SITE_SCAN');
    expect(getHandler('FREE_SITE_SCAN')).toBeDefined();
  });

  it('returns undefined for unknown job types', () => {
    expect(getHandler('UNKNOWN_JOB')).toBeUndefined();
  });
});
