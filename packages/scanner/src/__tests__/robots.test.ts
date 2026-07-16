import { describe, it, expect } from 'vitest';
import { buildRobotsUrl, parseRobotsPolicy } from '../robots.js';

describe('buildRobotsUrl', () => {
  it('builds robots.txt URL from site origin', () => {
    expect(buildRobotsUrl('https://shop.example.com')).toBe('https://shop.example.com/robots.txt');
  });
});

describe('parseRobotsPolicy', () => {
  const robotsUrl = 'https://shop.example.com/robots.txt';

  it('allows all paths when robots.txt is empty', () => {
    const policy = parseRobotsPolicy(robotsUrl, '');

    expect(policy.isAllowed('https://shop.example.com/')).toBe(true);
    expect(policy.isAllowed('https://shop.example.com/admin')).toBe(true);
  });

  it('respects disallow rules for all agents', () => {
    const policy = parseRobotsPolicy(
      robotsUrl,
      `
User-agent: *
Disallow: /admin/
Disallow: /cart
`,
    );

    expect(policy.isAllowed('https://shop.example.com/contact')).toBe(true);
    expect(policy.isAllowed('https://shop.example.com/admin/users')).toBe(false);
    expect(policy.isAllowed('https://shop.example.com/cart')).toBe(false);
  });

  it('matches our bot user-agent group', () => {
    const policy = parseRobotsPolicy(
      robotsUrl,
      `
User-agent: ShoppingRescueBot
Disallow: /private

User-agent: *
Allow: /
`,
    );

    expect(policy.isAllowed('https://shop.example.com/private/page')).toBe(false);
    expect(policy.isAllowed('https://shop.example.com/public')).toBe(true);
  });

  it('allows explicit allow rules that override disallow', () => {
    const policy = parseRobotsPolicy(
      robotsUrl,
      `
User-agent: *
Disallow: /catalog/
Allow: /catalog/public/
`,
    );

    expect(policy.isAllowed('https://shop.example.com/catalog/public/shoes')).toBe(true);
    expect(policy.isAllowed('https://shop.example.com/catalog/internal/')).toBe(false);
  });
});
