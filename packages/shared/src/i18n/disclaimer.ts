import type { AppLocale } from './locale';

const DISCLAIMER_EN =
  'Shopping Rescue is an independent service and is not affiliated with, endorsed by, or sponsored by Google. Results are diagnostic recommendations and do not guarantee account reinstatement.';

const DISCLAIMER_FR =
  'Shopping Rescue est un service indépendant, non affilié, approuvé ou sponsorisé par Google. Les résultats sont des recommandations diagnostiques et ne garantissent pas le rétablissement du compte.';

export function getDisclaimer(locale: AppLocale = 'en'): string {
  return locale === 'fr' ? DISCLAIMER_FR : DISCLAIMER_EN;
}
