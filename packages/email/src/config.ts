const PLACEHOLDER_KEYS = new Set(['re_...', 're_test_...', 're_your_api_key']);

export function isResendConfigured(apiKey: string | undefined): boolean {
  if (!apiKey?.trim()) return false;
  const key = apiKey.trim();
  if (PLACEHOLDER_KEYS.has(key)) return false;
  if (key.endsWith('...')) return false;
  return key.startsWith('re_') && key.length > 12;
}

export interface EmailEnvConfig {
  apiKey: string;
  fromAddress: string;
}

export function getEmailConfigFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): EmailEnvConfig | null {
  const apiKey = env.RESEND_API_KEY;
  const fromAddress = env.RESEND_FROM_EMAIL;

  if (!isResendConfigured(apiKey) || !fromAddress?.trim()) {
    return null;
  }

  return {
    apiKey: apiKey!.trim(),
    fromAddress: fromAddress.trim(),
  };
}
