export function isNextNavigationError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;
  const digest = (error as { digest?: string }).digest;
  const message = (error as { message?: string }).message;
  if (typeof digest === 'string' && digest.startsWith('NEXT_REDIRECT')) return true;
  if (digest === 'NEXT_NOT_FOUND') return true;
  if (message === 'NEXT_REDIRECT' || message === 'NEXT_NOT_FOUND') return true;
  return false;
}

function isPlaceholderEnvValue(value: string | undefined): boolean {
  if (!value) return true;
  const trimmed = value.trim();
  if (!trimmed) return true;
  return trimmed.endsWith('...') || trimmed.includes('your_') || trimmed === 'price_' || trimmed === 'sk_test_';
}

export function isStripeConfigured(): boolean {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PRICE_FULL_AUDIT;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!secretKey || !priceId || !appUrl) return false;
  if (isPlaceholderEnvValue(secretKey) || isPlaceholderEnvValue(priceId)) return false;
  if (!secretKey.startsWith('sk_')) return false;
  if (!priceId.startsWith('price_')) return false;

  return true;
}

export function isMonitoringStripeConfigured(): boolean {
  if (!isStripeConfigured()) return false;
  const priceId = process.env.STRIPE_PRICE_MONITORING_PRO;
  if (!priceId || isPlaceholderEnvValue(priceId)) return false;
  return priceId.startsWith('price_');
}

export function isAgencyStripeConfigured(): boolean {
  if (!isStripeConfigured()) return false;
  const priceId = process.env.STRIPE_PRICE_AGENCY;
  if (!priceId || isPlaceholderEnvValue(priceId)) return false;
  return priceId.startsWith('price_');
}
