import robotsParser from 'robots-parser';
import { CRAWLER_USER_AGENT } from './constants.js';
import { validateUrlSafe } from './url-validator.js';

export interface RobotsPolicy {
  robotsUrl: string;
  fetched: boolean;
  isAllowed(url: string): boolean;
}

export interface RobotsPolicyMeta {
  robotsUrl: string;
  fetched: boolean;
  blockedUrls: string[];
  blockedCount: number;
}

const EMPTY_POLICY: RobotsPolicy = {
  robotsUrl: '',
  fetched: false,
  isAllowed: () => true,
};

export function buildRobotsUrl(origin: string): string {
  return new URL('/robots.txt', origin).href;
}

export function parseRobotsPolicy(robotsUrl: string, robotsTxt: string): RobotsPolicy {
  const parser = robotsParser(robotsUrl, robotsTxt);

  return {
    robotsUrl,
    fetched: true,
    isAllowed: (url: string) => parser.isAllowed(url, CRAWLER_USER_AGENT) !== false,
  };
}

export async function fetchRobotsTxt(
  origin: string,
  timeoutMs = 8000,
): Promise<{ robotsUrl: string; content: string | null }> {
  const robotsUrl = buildRobotsUrl(origin);
  const validation = await validateUrlSafe(robotsUrl);
  if (!validation.valid) {
    return { robotsUrl, content: null };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(validation.url.href, {
      headers: {
        'User-Agent': CRAWLER_USER_AGENT,
        Accept: 'text/plain,*/*',
      },
      signal: controller.signal,
      redirect: 'follow',
    });

    if (!response.ok) {
      return { robotsUrl, content: null };
    }

    const content = await response.text();
    return { robotsUrl, content: content.slice(0, 500_000) };
  } catch {
    return { robotsUrl, content: null };
  } finally {
    clearTimeout(timer);
  }
}

export async function loadRobotsPolicy(
  origin: string,
  timeoutMs = 8000,
): Promise<RobotsPolicy> {
  const { robotsUrl, content } = await fetchRobotsTxt(origin, timeoutMs);

  if (!content) {
    return { ...EMPTY_POLICY, robotsUrl, fetched: false };
  }

  return parseRobotsPolicy(robotsUrl, content);
}

export function toRobotsMeta(
  policy: RobotsPolicy,
  blocked: { urls: string[]; count: number },
): RobotsPolicyMeta {
  return {
    robotsUrl: policy.robotsUrl,
    fetched: policy.fetched,
    blockedUrls: blocked.urls,
    blockedCount: blocked.count,
  };
}
