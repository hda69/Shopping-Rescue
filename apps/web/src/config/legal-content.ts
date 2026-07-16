import type { AppLocale } from '@shopping-rescue/shared/i18n';

export type LegalDocumentId = 'terms' | 'privacy' | 'disclaimer';

export interface LegalBlock {
  type: 'p' | 'h2' | 'ul' | 'callout';
  text?: string;
  items?: string[];
}

export interface LegalDocument {
  title: string;
  metaDescription: string;
  lastUpdated: string;
  blocks: LegalBlock[];
}

const LEGAL_DOCUMENTS: Record<AppLocale, Record<LegalDocumentId, LegalDocument>> = {
  en: {
    terms: {
      title: 'Terms of Service',
      metaDescription:
        'Terms of Service for Shopping Rescue — independent Google Merchant Center diagnostics.',
      lastUpdated: '14 July 2026',
      blocks: [
        {
          type: 'p',
          text: 'These Terms of Service ("Terms") govern your access to and use of Shopping Rescue ("we", "us", "our") at [shoppingrescue.com](https://shoppingrescue.com) and related services. By using the service, you agree to these Terms.',
        },
        {
          type: 'h2',
          text: '1. Service description',
        },
        {
          type: 'p',
          text: 'Shopping Rescue provides automated diagnostics of publicly accessible e-commerce storefronts to help merchants identify probable issues related to Google Merchant Center and Google Shopping policies. We are an **independent** service and are not affiliated with, endorsed by, or sponsored by Google LLC or its products.',
        },
        {
          type: 'h2',
          text: '2. Eligibility',
        },
        {
          type: 'p',
          text: 'You must be at least 18 years old and authorized to submit a store URL for analysis. You represent that you have the right to request a scan of any URL you submit.',
        },
        {
          type: 'h2',
          text: '3. Accounts and scans',
        },
        {
          type: 'ul',
          items: [
            'Free scans may be submitted without creating an account.',
            'You agree to provide accurate contact information (such as your email) when requested.',
            'You must not submit URLs you do not own or control, or use the service for unlawful purposes.',
          ],
        },
        {
          type: 'h2',
          text: '4. Paid services',
        },
        {
          type: 'p',
          text: 'Full Audit and subscription plans are billed through Stripe. Prices are shown before checkout. Unless stated otherwise, one-time purchases are non-refundable once the report is unlocked, except where required by applicable consumer law.',
        },
        {
          type: 'h2',
          text: '5. Acceptable use',
        },
        {
          type: 'p',
          text: 'You agree not to:',
        },
        {
          type: 'ul',
          items: [
            'Probe, scan, or test vulnerabilities of our infrastructure beyond normal use.',
            'Interfere with the worker, API, or other users\' scans.',
            'Resell or redistribute reports without our written permission.',
            'Use automated means to abuse free scan quotas.',
          ],
        },
        {
          type: 'h2',
          text: '6. Intellectual property',
        },
        {
          type: 'p',
          text: 'The Shopping Rescue name, logo, software, and report formats remain our property. You receive a limited license to use reports for your own business remediation purposes.',
        },
        {
          type: 'h2',
          text: '7. Disclaimers',
        },
        {
          type: 'p',
          text: 'Reports are generated from automated analysis of public pages at a point in time. They do **not** guarantee Google Merchant Center reinstatement, policy compliance, or any specific commercial outcome. See our [Disclaimer](/legal/disclaimer) for more detail.',
        },
        {
          type: 'h2',
          text: '8. Limitation of liability',
        },
        {
          type: 'p',
          text: 'To the maximum extent permitted by law, Shopping Rescue and its operators shall not be liable for indirect, incidental, special, or consequential damages, or for loss of profits, revenue, or data arising from your use of the service. Our total liability for any claim shall not exceed the amount you paid us in the twelve months preceding the claim, or €100 if you used only free features.',
        },
        {
          type: 'h2',
          text: '9. Changes and termination',
        },
        {
          type: 'p',
          text: 'We may update these Terms or discontinue features with reasonable notice where practicable. We may suspend access for violation of these Terms. You may stop using the service at any time.',
        },
        {
          type: 'h2',
          text: '10. Governing law',
        },
        {
          type: 'p',
          text: 'These Terms are governed by the laws of France, without regard to conflict-of-law rules. Courts in France shall have exclusive jurisdiction, subject to mandatory consumer protections in your country of residence.',
        },
        {
          type: 'h2',
          text: '11. Contact',
        },
        {
          type: 'p',
          text: 'Questions about these Terms: [CONTACT_EMAIL](mailto:CONTACT_EMAIL)',
        },
      ],
    },
    privacy: {
      title: 'Privacy Policy',
      metaDescription: 'How Shopping Rescue collects, uses, and protects your personal data.',
      lastUpdated: '14 July 2026',
      blocks: [
        {
          type: 'p',
          text: 'This Privacy Policy explains how Shopping Rescue ("we", "us") processes personal data when you use our website and diagnostic services. We act as the data controller for the processing described below.',
        },
        {
          type: 'h2',
          text: '1. Data we collect',
        },
        {
          type: 'ul',
          items: [
            '**Scan inputs:** store URL, optional platform/country metadata, and email address when you start a free scan.',
            '**Crawl results:** publicly available page content, HTTP status codes, structured data, and derived findings — associated with your scan.',
            '**Payment data:** processed by Stripe; we receive customer ID, payment status, and billing metadata, not full card numbers.',
            '**Technical data:** IP address, browser type, and request logs for security and operations.',
            '**Account data:** if you create an account — name, email, organization settings.',
          ],
        },
        {
          type: 'h2',
          text: '2. How we use data',
        },
        {
          type: 'ul',
          items: [
            'Run storefront scans and generate diagnostic reports.',
            'Send transactional emails (scan ready, purchase confirmation).',
            'Process payments and manage subscriptions.',
            'Improve rules, reliability, and fraud prevention.',
            'Comply with legal obligations.',
          ],
        },
        {
          type: 'p',
          text: 'Legal bases (GDPR): contract performance, legitimate interests (security, product improvement), consent where required (e.g. marketing cookies), and legal obligation.',
        },
        {
          type: 'h2',
          text: '3. Retention',
        },
        {
          type: 'ul',
          items: [
            'Free scan data: retained for the period shown in your plan (typically 30 days for free scans), then deleted or anonymized.',
            'Paid report data: retained while your account is active and as needed for support.',
            'Billing records: retained as required by tax and accounting law.',
          ],
        },
        {
          type: 'h2',
          text: '4. Processors and sharing',
        },
        {
          type: 'p',
          text: 'We use trusted subprocessors, including:',
        },
        {
          type: 'ul',
          items: [
            '**Hosting / database** — infrastructure providers for app and data storage.',
            '**Stripe** — payment processing ([privacy policy](https://stripe.com/privacy)).',
            '**Resend** — transactional email delivery.',
          ],
        },
        {
          type: 'p',
          text: 'We do not sell your personal data. We may disclose data if required by law or to protect our rights and users\' safety.',
        },
        {
          type: 'h2',
          text: '5. International transfers',
        },
        {
          type: 'p',
          text: 'If data is transferred outside the European Economic Area, we rely on appropriate safeguards such as Standard Contractual Clauses or adequacy decisions.',
        },
        {
          type: 'h2',
          text: '6. Your rights',
        },
        {
          type: 'p',
          text: 'Depending on your location, you may have the right to:',
        },
        {
          type: 'ul',
          items: [
            'Access, rectify, or erase your personal data.',
            'Restrict or object to certain processing.',
            'Data portability.',
            'Withdraw consent where processing is consent-based.',
            'Lodge a complaint with your local supervisory authority.',
          ],
        },
        {
          type: 'p',
          text: 'To exercise these rights, contact [CONTACT_EMAIL](mailto:CONTACT_EMAIL). We respond within one month where GDPR applies.',
        },
        {
          type: 'h2',
          text: '7. Cookies',
        },
        {
          type: 'p',
          text: 'We use essential cookies for session and security. Analytics or marketing cookies, if introduced, will be disclosed in a cookie notice with consent options where required.',
        },
        {
          type: 'h2',
          text: '8. Children',
        },
        {
          type: 'p',
          text: 'Our service is not directed at children under 16. We do not knowingly collect their data.',
        },
        {
          type: 'h2',
          text: '9. Changes',
        },
        {
          type: 'p',
          text: 'We may update this policy. Material changes will be posted on this page with an updated date.',
        },
        {
          type: 'h2',
          text: '10. Contact',
        },
        {
          type: 'p',
          text: 'Data protection inquiries: [CONTACT_EMAIL](mailto:CONTACT_EMAIL)',
        },
      ],
    },
    disclaimer: {
      title: 'Disclaimer',
      metaDescription: 'Important limitations of Shopping Rescue diagnostic reports.',
      lastUpdated: '14 July 2026',
      blocks: [
        {
          type: 'callout',
          text: 'Shopping Rescue is an independent service and is not affiliated with, endorsed by, or sponsored by Google. Results are diagnostic recommendations and do not guarantee account reinstatement.',
        },
        {
          type: 'h2',
          text: 'Nature of the service',
        },
        {
          type: 'p',
          text: 'Shopping Rescue produces **automated diagnostic reports** based on publicly accessible information from your storefront at the time of the scan. Our analysis applies heuristic and rule-based checks inspired by common Google Merchant Center and Google Shopping policy themes. It is not a manual audit, legal review, or official Google assessment.',
        },
        {
          type: 'h2',
          text: 'No affiliation with Google',
        },
        {
          type: 'p',
          text: 'Shopping Rescue is operated independently. Google, Google Merchant Center, Google Shopping, and related marks are trademarks of Google LLC. We do not speak for Google and cannot influence Google\'s enforcement decisions.',
        },
        {
          type: 'h2',
          text: 'No guarantee of outcomes',
        },
        {
          type: 'ul',
          items: [
            'Fixing issues listed in a report does **not** guarantee account reinstatement or product approval.',
            'Google may consider factors we cannot observe (account history, payments, manual review, feed data, etc.).',
            'Risk scores and severity labels are indicative only — not official risk classifications from Google.',
          ],
        },
        {
          type: 'h2',
          text: 'Limitations of automated crawling',
        },
        {
          type: 'ul',
          items: [
            'We respect robots.txt and crawl only public pages within plan limits.',
            'JavaScript-heavy or geo-blocked content may not be fully captured.',
            'Findings may include false positives or miss issues not visible publicly.',
            'Site content can change after a scan; reports reflect a snapshot in time.',
          ],
        },
        {
          type: 'h2',
          text: 'Not professional advice',
        },
        {
          type: 'p',
          text: 'Reports are for informational purposes. They do not constitute legal, tax, accounting, or regulatory advice. Consult qualified professionals for binding decisions, especially for consumer law, advertising standards, or cross-border sales.',
        },
        {
          type: 'h2',
          text: 'Merchant responsibility',
        },
        {
          type: 'p',
          text: 'You remain responsible for your storefront, product data, business practices, and compliance with Google policies and applicable law. Verify every recommendation against your live site and Merchant Center account before requesting review or making public claims.',
        },
        {
          type: 'h2',
          text: 'Use of AI-assisted features',
        },
        {
          type: 'p',
          text: 'If enabled in future versions, AI-generated explanations are supplementary and may contain errors. Always validate against primary sources and your own site.',
        },
        {
          type: 'h2',
          text: 'Contact',
        },
        {
          type: 'p',
          text: 'Questions about this disclaimer: [CONTACT_EMAIL](mailto:CONTACT_EMAIL)',
        },
      ],
    },
  },
  fr: {
    terms: {
      title: 'Conditions d\'utilisation',
      metaDescription:
        'Conditions d\'utilisation de Shopping Rescue — diagnostic Google Merchant Center indépendant.',
      lastUpdated: '14 juillet 2026',
      blocks: [
        {
          type: 'p',
          text: 'Les présentes Conditions d\'utilisation (« Conditions ») régissent votre accès à Shopping Rescue (« nous », « notre ») sur [shoppingrescue.com](https://shoppingrescue.com) et les services associés. En utilisant le service, vous acceptez ces Conditions.',
        },
        {
          type: 'h2',
          text: '1. Description du service',
        },
        {
          type: 'p',
          text: 'Shopping Rescue fournit des diagnostics automatisés de boutiques e-commerce accessibles publiquement afin d\'aider les marchands à identifier des problèmes probables liés aux politiques Google Merchant Center et Google Shopping. Nous sommes un service **indépendant**, non affilié, approuvé ou sponsorisé par Google LLC ou ses produits.',
        },
        {
          type: 'h2',
          text: '2. Éligibilité',
        },
        {
          type: 'p',
          text: 'Vous devez avoir au moins 18 ans et être autorisé à soumettre une URL de boutique pour analyse. Vous déclarez avoir le droit de demander l\'analyse de toute URL que vous soumettez.',
        },
        {
          type: 'h2',
          text: '3. Comptes et scans',
        },
        {
          type: 'ul',
          items: [
            'Les scans gratuits peuvent être soumis sans créer de compte.',
            'Vous acceptez de fournir des coordonnées exactes (notamment votre e-mail) lorsque cela est demandé.',
            'Vous ne devez pas soumettre d\'URL que vous ne possédez pas ou ne contrôlez pas, ni utiliser le service à des fins illicites.',
          ],
        },
        {
          type: 'h2',
          text: '4. Services payants',
        },
        {
          type: 'p',
          text: 'Les audits complets et les abonnements sont facturés via Stripe. Les prix sont affichés avant le paiement. Sauf indication contraire, les achats ponctuels ne sont pas remboursables une fois le rapport débloqué, sauf obligation légale applicable en matière de consommation.',
        },
        {
          type: 'h2',
          text: '5. Usage acceptable',
        },
        {
          type: 'p',
          text: 'Vous vous engagez à ne pas :',
        },
        {
          type: 'ul',
          items: [
            'Sonder, scanner ou tester les vulnérabilités de notre infrastructure au-delà d\'un usage normal.',
            'Perturber le worker, l\'API ou les scans d\'autres utilisateurs.',
            'Revendre ou redistribuer les rapports sans notre autorisation écrite.',
            'Utiliser des moyens automatisés pour abuser des quotas de scans gratuits.',
          ],
        },
        {
          type: 'h2',
          text: '6. Propriété intellectuelle',
        },
        {
          type: 'p',
          text: 'Le nom Shopping Rescue, le logo, les logiciels et les formats de rapport restent notre propriété. Vous recevez une licence limitée pour utiliser les rapports à des fins de correction pour votre propre activité.',
        },
        {
          type: 'h2',
          text: '7. Avertissements',
        },
        {
          type: 'p',
          text: 'Les rapports sont générés à partir d\'une analyse automatisée de pages publiques à un instant donné. Ils ne **garantissent pas** le rétablissement de votre compte Google Merchant Center, la conformité aux politiques ni un résultat commercial particulier. Consultez notre [Avertissement](/fr/legal/disclaimer) pour plus de détails.',
        },
        {
          type: 'h2',
          text: '8. Limitation de responsabilité',
        },
        {
          type: 'p',
          text: 'Dans la mesure maximale permise par la loi, Shopping Rescue et ses opérateurs ne sauraient être tenus responsables de dommages indirects, accessoires, spéciaux ou consécutifs, ni de pertes de profits, de revenus ou de données liées à votre utilisation du service. Notre responsabilité totale pour toute réclamation ne dépassera pas le montant que vous nous avez payé au cours des douze mois précédant la réclamation, ou 100 € si vous n\'avez utilisé que les fonctionnalités gratuites.',
        },
        {
          type: 'h2',
          text: '9. Modifications et résiliation',
        },
        {
          type: 'p',
          text: 'Nous pouvons mettre à jour ces Conditions ou interrompre des fonctionnalités avec un préavis raisonnable lorsque cela est possible. Nous pouvons suspendre l\'accès en cas de violation des présentes Conditions. Vous pouvez cesser d\'utiliser le service à tout moment.',
        },
        {
          type: 'h2',
          text: '10. Droit applicable',
        },
        {
          type: 'p',
          text: 'Les présentes Conditions sont régies par le droit français, sans égard aux règles de conflit de lois. Les tribunaux français ont compétence exclusive, sous réserve des protections impératives applicables dans votre pays de résidence.',
        },
        {
          type: 'h2',
          text: '11. Contact',
        },
        {
          type: 'p',
          text: 'Questions sur ces Conditions : [CONTACT_EMAIL](mailto:CONTACT_EMAIL)',
        },
      ],
    },
    privacy: {
      title: 'Politique de confidentialité',
      metaDescription:
        'Comment Shopping Rescue collecte, utilise et protège vos données personnelles.',
      lastUpdated: '14 juillet 2026',
      blocks: [
        {
          type: 'p',
          text: 'La présente Politique de confidentialité explique comment Shopping Rescue (« nous ») traite les données personnelles lorsque vous utilisez notre site et nos services de diagnostic. Nous agissons en tant que responsable du traitement pour les opérations décrites ci-dessous.',
        },
        {
          type: 'h2',
          text: '1. Données collectées',
        },
        {
          type: 'ul',
          items: [
            '**Données de scan :** URL de la boutique, métadonnées optionnelles (plateforme/pays) et adresse e-mail lors du lancement d\'un scan gratuit.',
            '**Résultats de crawl :** contenu public des pages, codes HTTP, données structurées et constats dérivés — associés à votre scan.',
            '**Données de paiement :** traitées par Stripe ; nous recevons l\'identifiant client, le statut de paiement et des métadonnées de facturation, pas les numéros de carte complets.',
            '**Données techniques :** adresse IP, type de navigateur et journaux de requêtes pour la sécurité et l\'exploitation.',
            '**Données de compte :** si vous créez un compte — nom, e-mail, paramètres d\'organisation.',
          ],
        },
        {
          type: 'h2',
          text: '2. Utilisation des données',
        },
        {
          type: 'ul',
          items: [
            'Exécuter des scans de boutique et générer des rapports de diagnostic.',
            'Envoyer des e-mails transactionnels (scan prêt, confirmation d\'achat).',
            'Traiter les paiements et gérer les abonnements.',
            'Améliorer les règles, la fiabilité et la prévention de la fraude.',
            'Respecter les obligations légales.',
          ],
        },
        {
          type: 'p',
          text: 'Bases légales (RGPD) : exécution du contrat, intérêts légitimes (sécurité, amélioration du produit), consentement lorsque requis (ex. cookies marketing) et obligation légale.',
        },
        {
          type: 'h2',
          text: '3. Conservation',
        },
        {
          type: 'ul',
          items: [
            'Données de scan gratuit : conservées pendant la durée indiquée dans votre offre (généralement 30 jours pour les scans gratuits), puis supprimées ou anonymisées.',
            'Données de rapport payant : conservées tant que votre compte est actif et selon les besoins du support.',
            'Données de facturation : conservées conformément aux obligations fiscales et comptables.',
          ],
        },
        {
          type: 'h2',
          text: '4. Sous-traitants et partage',
        },
        {
          type: 'p',
          text: 'Nous faisons appel à des sous-traitants de confiance, notamment :',
        },
        {
          type: 'ul',
          items: [
            '**Hébergement / base de données** — fournisseurs d\'infrastructure pour l\'application et le stockage des données.',
            '**Stripe** — traitement des paiements ([politique de confidentialité](https://stripe.com/privacy)).',
            '**Resend** — envoi d\'e-mails transactionnels.',
          ],
        },
        {
          type: 'p',
          text: 'Nous ne vendons pas vos données personnelles. Nous pouvons les divulguer si la loi l\'exige ou pour protéger nos droits et la sécurité des utilisateurs.',
        },
        {
          type: 'h2',
          text: '5. Transferts internationaux',
        },
        {
          type: 'p',
          text: 'Si des données sont transférées hors de l\'Espace économique européen, nous nous appuyons sur des garanties appropriées telles que les clauses contractuelles types ou des décisions d\'adéquation.',
        },
        {
          type: 'h2',
          text: '6. Vos droits',
        },
        {
          type: 'p',
          text: 'Selon votre localisation, vous pouvez disposer des droits suivants :',
        },
        {
          type: 'ul',
          items: [
            'Accéder à vos données, les rectifier ou les effacer.',
            'Limiter ou vous opposer à certains traitements.',
            'Demander la portabilité de vos données.',
            'Retirer votre consentement lorsque le traitement est fondé sur celui-ci.',
            'Introduire une réclamation auprès de votre autorité de contrôle locale.',
          ],
        },
        {
          type: 'p',
          text: 'Pour exercer ces droits, contactez [CONTACT_EMAIL](mailto:CONTACT_EMAIL). Nous répondons dans un délai d\'un mois lorsque le RGPD s\'applique.',
        },
        {
          type: 'h2',
          text: '7. Cookies',
        },
        {
          type: 'p',
          text: 'Nous utilisons des cookies essentiels pour la session et la sécurité. Les cookies d\'analyse ou marketing, s\'ils sont introduits, seront mentionnés dans un avis dédié avec des options de consentement lorsque requis.',
        },
        {
          type: 'h2',
          text: '8. Mineurs',
        },
        {
          type: 'p',
          text: 'Notre service ne s\'adresse pas aux enfants de moins de 16 ans. Nous ne collectons pas sciemment leurs données.',
        },
        {
          type: 'h2',
          text: '9. Modifications',
        },
        {
          type: 'p',
          text: 'Nous pouvons mettre à jour cette politique. Les changements importants seront publiés sur cette page avec une date de mise à jour.',
        },
        {
          type: 'h2',
          text: '10. Contact',
        },
        {
          type: 'p',
          text: 'Demandes relatives à la protection des données : [CONTACT_EMAIL](mailto:CONTACT_EMAIL)',
        },
      ],
    },
    disclaimer: {
      title: 'Avertissement',
      metaDescription: 'Limites importantes des rapports de diagnostic Shopping Rescue.',
      lastUpdated: '14 juillet 2026',
      blocks: [
        {
          type: 'callout',
          text: 'Shopping Rescue est un service indépendant, non affilié, approuvé ou sponsorisé par Google. Les résultats sont des recommandations diagnostiques et ne garantissent pas le rétablissement du compte.',
        },
        {
          type: 'h2',
          text: 'Nature du service',
        },
        {
          type: 'p',
          text: 'Shopping Rescue produit des **rapports de diagnostic automatisés** à partir d\'informations accessibles publiquement sur votre boutique au moment du scan. Notre analyse applique des contrôles heuristiques et basés sur des règles inspirés des thèmes courants des politiques Google Merchant Center et Google Shopping. Il ne s\'agit pas d\'un audit manuel, d\'un avis juridique ni d\'une évaluation officielle de Google.',
        },
        {
          type: 'h2',
          text: 'Aucun lien avec Google',
        },
        {
          type: 'p',
          text: 'Shopping Rescue est exploité de manière indépendante. Google, Google Merchant Center, Google Shopping et les marques associées sont des marques de Google LLC. Nous ne parlons pas au nom de Google et ne pouvons pas influencer ses décisions d\'application des politiques.',
        },
        {
          type: 'h2',
          text: 'Aucune garantie de résultat',
        },
        {
          type: 'ul',
          items: [
            'Corriger les problèmes listés dans un rapport ne **garantit pas** le rétablissement du compte ni l\'approbation des produits.',
            'Google peut tenir compte de facteurs que nous ne pouvons pas observer (historique du compte, paiements, examen manuel, flux produits, etc.).',
            'Les scores de risque et niveaux de gravité sont indicatifs uniquement — ce ne sont pas des classifications officielles de Google.',
          ],
        },
        {
          type: 'h2',
          text: 'Limites du crawl automatisé',
        },
        {
          type: 'ul',
          items: [
            'Nous respectons robots.txt et ne parcourons que les pages publiques dans les limites de l\'offre.',
            'Le contenu très dépendant du JavaScript ou bloqué géographiquement peut ne pas être entièrement capturé.',
            'Les constats peuvent inclure des faux positifs ou manquer des problèmes non visibles publiquement.',
            'Le contenu du site peut changer après un scan ; les rapports reflètent un instantané dans le temps.',
          ],
        },
        {
          type: 'h2',
          text: 'Pas un conseil professionnel',
        },
        {
          type: 'p',
          text: 'Les rapports sont fournis à titre informatif. Ils ne constituent pas un conseil juridique, fiscal, comptable ou réglementaire. Consultez des professionnels qualifiés pour les décisions engageantes, notamment en matière de droit de la consommation, de normes publicitaires ou de ventes transfrontalières.',
        },
        {
          type: 'h2',
          text: 'Responsabilité du marchand',
        },
        {
          type: 'p',
          text: 'Vous restez responsable de votre boutique, de vos données produits, de vos pratiques commerciales et de votre conformité aux politiques Google et au droit applicable. Vérifiez chaque recommandation sur votre site en ligne et dans Merchant Center avant de demander une réexamen ou de faire des déclarations publiques.',
        },
        {
          type: 'h2',
          text: 'Fonctionnalités assistées par IA',
        },
        {
          type: 'p',
          text: 'Si elles sont activées dans de futures versions, les explications générées par IA sont complémentaires et peuvent contenir des erreurs. Validez toujours auprès des sources primaires et de votre propre site.',
        },
        {
          type: 'h2',
          text: 'Contact',
        },
        {
          type: 'p',
          text: 'Questions sur cet avertissement : [CONTACT_EMAIL](mailto:CONTACT_EMAIL)',
        },
      ],
    },
  },
};

export function getLegalDocument(id: LegalDocumentId, locale: AppLocale): LegalDocument {
  return LEGAL_DOCUMENTS[locale][id];
}

export function getLegalPath(id: LegalDocumentId, locale: AppLocale): string {
  return locale === 'fr' ? `/fr/legal/${id}` : `/legal/${id}`;
}
