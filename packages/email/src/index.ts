export {
  createEmailClient,
  type EmailClient,
  type EmailClientConfig,
  type SendEmailParams,
  type SendEmailResult,
} from './client.js';
export { getEmailConfigFromEnv, isResendConfigured } from './config.js';
export { buildScanCompletedEmail } from './templates/scan-completed.js';
export {
  sendScanCompletedEmail,
  type SendScanCompletedEmailInput,
  type SendScanCompletedEmailResult,
} from './send-scan-completed.js';
