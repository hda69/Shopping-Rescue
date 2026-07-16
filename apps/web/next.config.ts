import { config as loadDotenv } from 'dotenv';
import { resolve } from 'path';
import type { NextConfig } from 'next';

loadDotenv({ path: resolve(__dirname, '../../.env') });

const SHOPPING_RESCUE_PACKAGES = [
  '@shopping-rescue/shared',
  '@shopping-rescue/database',
  '@shopping-rescue/auth',
  '@shopping-rescue/billing',
  '@shopping-rescue/merchant-api',
  '@shopping-rescue/scanner',
  '@shopping-rescue/rules-engine',
  '@shopping-rescue/reporting',
  '@shopping-rescue/email',
  '@shopping-rescue/ui',
];

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: SHOPPING_RESCUE_PACKAGES,
  serverExternalPackages: ['postgres', 'drizzle-orm', 'playwright', 'playwright-core'],
  poweredByHeader: false,
};

export default nextConfig;
