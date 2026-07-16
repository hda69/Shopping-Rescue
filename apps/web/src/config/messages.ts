import type { AppLocale } from '@/lib/locale';

import { MESSAGES_EN, type AppMessages } from './messages.en';
import { MESSAGES_FR } from './messages.fr';

export type { AppMessages };

export function getMessages(locale: AppLocale): AppMessages {
  return locale === 'fr' ? MESSAGES_FR : MESSAGES_EN;
}
