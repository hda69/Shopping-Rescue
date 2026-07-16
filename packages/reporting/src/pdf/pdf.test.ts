import { describe, expect, it } from 'vitest';
import { calculateTotalPages } from './utils/pagination';
import { chunkArray } from './utils/chunkArray';
import { normalizeSeverity } from './utils/severity';

describe('chunkArray', () => {
  it('splits items into fixed-size chunks', () => {
    expect(chunkArray([1, 2, 3, 4, 5], 3)).toEqual([[1, 2, 3], [4, 5]]);
  });
});

describe('calculateTotalPages', () => {
  it('uses cover + summary + checklist + detail pages', () => {
    expect(calculateTotalPages(18)).toBe(26);
    expect(calculateTotalPages(6)).toBe(10);
    expect(calculateTotalPages(0)).toBe(3);
  });
});

describe('normalizeSeverity', () => {
  it('falls back to info for unknown values', () => {
    expect(normalizeSeverity('critical')).toBe('critical');
    expect(normalizeSeverity('unknown')).toBe('info');
  });
});
