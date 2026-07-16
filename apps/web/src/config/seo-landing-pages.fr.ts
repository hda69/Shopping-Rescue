import type { SeoLandingPageConfig } from './seo-landing-pages';

export const SEO_LANDING_PAGES_FR: Record<string, SeoLandingPageConfig> = {
  'merchant-center-suspended': {
    slug: 'merchant-center-suspended',
    metaTitle: 'Merchant Center suspendu — diagnostiquer les causes probables',
    metaDescription:
      'Diagnostic indépendant pour comptes Google Merchant Center suspendus. Analysez votre boutique, identifiez les écarts de politique et obtenez des actions correctives fondées sur des preuves.',
    keywords: [
      'merchant center suspendu',
      'suspension google merchant center',
      'compte suspendu google shopping',
      'rétablir merchant center',
    ],
    eyebrow: 'Suspension de compte',
    headline: 'Merchant Center suspendu ? Partez des faits, pas des suppositions.',
    subheadline:
      'Google explique rarement le déclencheur exact. Shopping Rescue analyse votre boutique publique selon les schémas de suspension les plus fréquents et priorise les constats.',
    issuePrefill: 'suspension',
    intro:
      'Une suspension bloque vos produits sur Google Shopping et affecte souvent les fiches gratuites. Avant de soumettre une nouvelle demande de réexamen, il faut comprendre ce qui, sur le site ou le flux, peut entrer en conflit avec les politiques Google.',
    whatItMeans:
      'Un compte Merchant Center suspendu signifie que Google a restreint la diffusion de vos annonces ou fiches Shopping. Les causes relèvent souvent de la transparence commerciale, des pages légales, de la qualité des données produit ou d’incohérences entre le site et Merchant Center — pas d’un seul paramètre défaillant.',
    commonCauses: [
      'Politiques de remboursement, livraison ou confidentialité absentes ou difficiles à trouver',
      'Identité commerciale incomplète — pas de page À propos, contact faible ou entité juridique floue',
      'Pages produit différentes du flux (prix, disponibilité, titre)',
      'Signaux de confiance bloqués par robots.txt ou qualité de site insuffisante',
      'Demandes de réexamen répétées sans correction des problèmes sous-jacents',
    ],
    checks: [
      'Pages légales : livraison, retours, confidentialité, conditions et contact',
      'Identité commerciale : page À propos, schéma Organization, moyens de contact visibles',
      'Données structurées produit : prix, disponibilité, images et identifiants',
      'Qualité du site : HTTPS, performance, métadonnées d’accueil et crawlabilité',
      'Couverture robots.txt et sitemap pour les URLs clés de la boutique',
    ],
    faq: [
      {
        question: 'Shopping Rescue peut-il rétablir mon compte Merchant Center ?',
        answer:
          'Non. Nous fournissons un diagnostic indépendant et des recommandations. Seul Google décide du rétablissement.',
      },
      {
        question: 'Dois-je connecter mon compte Google ?',
        answer:
          'Non pour le scan gratuit. Nous analysons la boutique publique. La connexion Merchant Center (offres payantes) est optionnelle pour une synchronisation plus poussée.',
      },
      {
        question: 'En combien de temps ai-je les résultats ?',
        answer:
          'La plupart des scans gratuits se terminent en quelques minutes. Vous recevez un score de risque et des constats avant de passer à l’audit complet.',
      },
    ],
    relatedSlugs: [
      'merchant-center-misrepresentation',
      'website-needs-improvement',
      'product-disapprovals',
    ],
  },
  'merchant-center-misrepresentation': {
    slug: 'merchant-center-misrepresentation',
    metaTitle: 'Misrepresentation Merchant Center — corriger confiance et identité',
    metaDescription:
      'Diagnostiquez les avertissements de misrepresentation dans Google Merchant Center. Vérifiez l’identité commerciale, les politiques, la transparence du contact et la cohérence du site.',
    keywords: [
      'misrepresentation merchant center',
      'politique misrepresentation google',
      'pratiques commerciales inacceptables',
      'problème confiance merchant center',
    ],
    eyebrow: 'Misrepresentation',
    headline: 'Avertissement misrepresentation ? Auditez votre présence en ligne.',
    subheadline:
      'Google attend que votre boutique représente honnêtement qui vous êtes, ce que vous vendez et comment vous contacter. Nous signalons les lacunes qui déclenchent souvent un réexamen.',
    issuePrefill: 'misrepresentation',
    intro:
      'Les problèmes de misrepresentation viennent souvent de signaux de confiance manquants plutôt que d’une intention frauduleuse. L’avertissement apparaît fréquemment quand les coordonnées, les politiques légales ou l’identité commerciale sont incomplètes ou incohérentes.',
    whatItMeans:
      'Misrepresentation signifie que Google estime que votre boutique peut induire les acheteurs en erreur sur votre activité, vos produits ou vos politiques. Corriger la transparence visible sur le site est généralement la première étape avant une demande de réexamen.',
    commonCauses: [
      'Nom commercial, adresse ou canal de support peu clairs',
      'Titre d’accueil générique ou données structurées Organization absentes',
      'Politiques de remboursement et livraison absentes, trop courtes ou contradictoires',
      'Promesses produit sur la page qui ne correspondent pas au flux Merchant Center',
      'Parcours contact ou checkout qui masquent comment joindre le vendeur',
    ],
    checks: [
      'Page contact et email ou téléphone visible sur les pages clés',
      'Présence d’une page À propos et signaux d’identité commerciale',
      'JSON-LD Organization / LocalBusiness sur la page d’accueil',
      'Complétude des politiques et profondeur minimale du contenu',
      'Cohérence entre pages produit et champs des données structurées',
    ],
    faq: [
      {
        question: 'La misrepresentation équivaut-elle à une suspension totale ?',
        answer:
          'Pas toujours. Cela peut être un avertissement ou un problème au niveau du compte selon la gravité. Les deux exigent de corriger les problèmes de confiance sur la boutique.',
      },
      {
        question: 'Par quoi commencer ?',
        answer:
          'Priorisez la transparence du contact, les politiques légales et les pages d’identité commerciale. Ce sont les causes les plus fréquentes détectées par notre moteur de règles.',
      },
      {
        question: 'Un scan garantit-il la levée de l’avertissement ?',
        answer:
          'Non. Nous mettons en évidence des causes probables avec preuves. Google prend seul toutes les décisions d’application et de rétablissement.',
      },
    ],
    relatedSlugs: [
      'merchant-center-suspended',
      'website-needs-improvement',
      'shopify-merchant-center',
    ],
  },
  'website-needs-improvement': {
    slug: 'website-needs-improvement',
    metaTitle: 'Website needs improvement — audit qualité Merchant Center',
    metaDescription:
      'Corrigez l’avertissement « Website needs improvement » dans Google Merchant Center. Auditez politiques, pages de confiance, performance, HTTPS et crawlabilité.',
    keywords: [
      'website needs improvement',
      'qualité site merchant center',
      'avertissement site google shopping',
      'audit boutique ecommerce',
    ],
    eyebrow: 'Qualité du site',
    headline: '« Website needs improvement » : ce que Google attend probablement de vous.',
    subheadline:
      'Cet avertissement pointe des problèmes de qualité et de transparence sur la boutique. Shopping Rescue crawle votre site et score les anomalies qui bloquent souvent l’approbation.',
    issuePrefill: 'website_improvement',
    intro:
      'Quand Google signale la qualité du site, les marchands se concentrent parfois sur Merchant Center alors que les vrais blocages sont sur la boutique : pages légales incomplètes, lenteur, HTTPS manquant ou URLs bloquées au crawl.',
    whatItMeans:
      'Website needs improvement indique que votre domaine ne répond pas encore aux attentes de Google pour une expérience d’achat fiable. Cela accompagne souvent des politiques trop courtes, une mauvaise navigation vers les pages légales ou des barrières techniques au crawl.',
    commonCauses: [
      'Politiques livraison, retours ou confidentialité absentes ou sous 200 caractères',
      'Page d’accueil lente ou titre et meta description peu descriptifs',
      'Ressources HTTP mixtes sur des pages HTTPS',
      'URLs importantes interdites dans robots.txt',
      'Pas de sitemap XML ou liens internes faibles vers les pages légales',
    ],
    checks: [
      'Profondeur et accessibilité des politiques depuis l’accueil',
      'Usage HTTPS et signaux de contenu mixte',
      'Performance de l’accueil et qualité des métadonnées SEO',
      'Règles robots.txt sur produits, collections ou politiques',
      'Présence et découvrabilité du sitemap.xml',
    ],
    faq: [
      {
        question: 'Faut-il refaire tout le site ?',
        answer:
          'En général non. La plupart des corrections sont ciblées : politiques complètes, transparence du contact, déblocage du crawl et alignement pages produit / flux.',
      },
      {
        question: 'Combien de pages couvre le scan gratuit ?',
        answer:
          'Jusqu’à 15 pages et 20 produits — suffisant pour faire remonter les problèmes à fort impact. L’audit complet monte à 150 pages.',
      },
      {
        question: 'Puis-je relancer un scan après corrections ?',
        answer:
          'Oui. L’audit complet inclut un re-scan gratuit pour valider les améliorations avant une nouvelle demande de réexamen Google.',
      },
    ],
    relatedSlugs: [
      'merchant-center-suspended',
      'merchant-center-misrepresentation',
      'product-disapprovals',
    ],
  },
  'product-disapprovals': {
    slug: 'product-disapprovals',
    metaTitle: 'Produits refusés Google Shopping — audit flux et pages produit',
    metaDescription:
      'Comprenez pourquoi vos produits Google Shopping sont refusés. Vérifiez données structurées, identifiants, disponibilité, images et écarts page / flux automatiquement.',
    keywords: [
      'produit refusé google shopping',
      'désapprobation produit merchant center',
      'erreurs flux produit',
      'gtin mpn manquant google shopping',
    ],
    eyebrow: 'Produits refusés',
    headline: 'Produits refusés dans Merchant Center ? Comparez site et flux.',
    subheadline:
      'Les refus viennent souvent d’écarts entre la page produit et le flux ou de données incomplètes. Nous inspectons les pages publiques et le JSON-LD selon les schémas d’échec les plus courants.',
    issuePrefill: 'product_disapproval',
    intro:
      'Un produit refusé dégrade la santé du catalogue et peut contribuer à des problèmes au niveau du compte. La correction se fait en général sur l’URL produit que Google crawle — pas uniquement dans l’interface Merchant Center.',
    whatItMeans:
      'Un refus produit signifie que Google n’affichera pas l’article dans Shopping. Raisons : violation de politique, identifiants manquants, achat indisponible ou différences entre le flux et la page en ligne.',
    commonCauses: [
      'Prix ou disponibilité sur la page différents du flux',
      'GTIN, MPN ou marque absents des données structurées',
      'JSON-LD produit sans image ou champ availability',
      'Page produit en erreur ou bloquée aux crawlers',
      'Catégories sensibles sans mentions légales requises',
    ],
    checks: [
      'Schéma produit : nom, image, prix, devise, disponibilité',
      'Identifiants applicables (GTIN, MPN, SKU)',
      'Accès crawl aux URLs produit et collection',
      'Parcours d’achat visible sur un échantillon de produits',
      'Cohérence entre contenu HTML et offres JSON-LD',
    ],
    faq: [
      {
        question: 'Le scan accède-t-il à ma liste produits Merchant Center ?',
        answer:
          'Le scan gratuit analyse uniquement la boutique publique. Les offres Monitoring peuvent connecter Merchant Center via OAuth pour comparer flux et pages live.',
      },
      {
        question: 'Combien de produits sont analysés en gratuit ?',
        answer:
          'Jusqu’à 20 produits, avec des constats détaillés sur les principales anomalies détectées.',
      },
      {
        question: 'Un seul produit refusé peut-il suspendre le compte ?',
        answer:
          'Un refus isolé suffit rarement, mais des schémas répétés ou des violations de politique peuvent mener à une sanction au niveau du compte.',
      },
    ],
    relatedSlugs: [
      'merchant-center-suspended',
      'shopify-merchant-center',
      'website-needs-improvement',
    ],
  },
  'shopify-merchant-center': {
    slug: 'shopify-merchant-center',
    metaTitle: 'Shopify et Merchant Center — audit automatisé de boutique',
    metaDescription:
      'Boutique Shopify bloquée sur Google Merchant Center ? Auditez politiques, données structurées produit, sitemaps et pages de confiance avec un crawl adapté à Shopify.',
    keywords: [
      'shopify merchant center suspendu',
      'problème google shopping shopify',
      'produit refusé shopify',
      'audit merchant center shopify',
    ],
    eyebrow: 'Shopify + Merchant Center',
    headline: 'Problème Shopify + Merchant Center ? Auditez thème et pages publiques.',
    subheadline:
      'La plupart des corrections Shopify se font dans les pages du thème, les modèles de politiques et le JSON-LD produit — pas seulement dans l’interface Google Ads.',
    issuePrefill: 'none',
    platformPrefill: 'shopify',
    intro:
      'Les marchands Shopify connectent souvent Merchant Center via Google & YouTube ou une app de flux. Quand un problème apparaît, la cause est fréquemment une politique incomplète, des réglages SEO du thème ou des données produit sur la boutique en ligne.',
    whatItMeans:
      'Shopify simplifie l’e-commerce, mais Google évalue toujours votre domaine public de façon indépendante. Les politiques doivent être accessibles, le JSON-LD produit exact, et le sitemap doit exposer produits et collections aux crawlers.',
    commonCauses: [
      'Politiques Shopify par défaut non personnalisées ou absentes du footer',
      'Titre SEO d’accueil limité au nom de la boutique',
      'Données structurées produit sans disponibilité lors des changements de stock',
      'Robots ou apps qui bloquent Google sur les URLs produit',
      'Apps de flux qui dérivent du prix ou des badges promo affichés sur le site',
    ],
    checks: [
      'Routes politiques Shopify : livraison, retours, confidentialité, conditions',
      'Schéma organization au niveau du thème et page contact',
      'URLs produit et collection via découverte du sitemap',
      'JSON-LD sur les templates produit (prix, image, disponibilité)',
      'Navigation footer vers pages légales et contact',
    ],
    faq: [
      {
        question: 'Avez-vous besoin de l’admin Shopify ?',
        answer:
          'Non. Nous crawlon uniquement les pages publiques, comme Google. Aucun mot de passe ni clé API admin requis.',
      },
      {
        question: 'Est-ce réservé aux boutiques suspendues ?',
        answer:
          'Non. Utilisez-le en préventif avant de connecter Merchant Center, ou après refus produit et avertissements qualité site.',
      },
      {
        question: 'Shopify corrige-t-il automatiquement les problèmes Merchant Center ?',
        answer:
          'Shopify fournit sitemaps et thèmes, mais les politiques, l’identité commerciale et l’alignement flux restent la responsabilité du marchand.',
      },
    ],
    relatedSlugs: [
      'merchant-center-suspended',
      'product-disapprovals',
      'website-needs-improvement',
    ],
  },
};
