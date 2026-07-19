export {
  createEmailClient,
  type EmailClient,
  type EmailClientConfig,
  type SendEmailParams,
  type SendEmailResult,
} from './client';
export { getEmailConfigFromEnv, isResendConfigured } from './config';
export { buildScanCompletedEmail } from './templates/scan-completed';
export {
  sendScanCompletedEmail,
  type SendScanCompletedEmailInput,
  type SendScanCompletedEmailResult,
} from './send-scan-completed';
export { buildRiskAlertEmail } from './templates/risk-alert';
export {
  sendRiskAlertEmail,
  type SendRiskAlertEmailInput,
} from './send-risk-alert';
export { buildMagicLinkEmail } from './templates/magic-link';
export {
  sendMagicLinkEmail,
  type SendMagicLinkEmailInput,
  type SendMagicLinkEmailResult,
} from './send-magic-link';
