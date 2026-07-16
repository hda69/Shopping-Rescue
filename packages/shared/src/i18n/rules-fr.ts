export interface RuleTranslationFr {
  title: string;
  description: string;
  remediationTemplate: string;
}

export const RULES_FR: Record<string, RuleTranslationFr> = {
  'SQ-001': {
    title: 'Le site n\'est pas servi en HTTPS',
    description: 'La boutique en ligne n\'utilise pas le chiffrement HTTPS.',
    remediationTemplate:
      'Activez SSL/TLS sur votre domaine et redirigez tout le trafic HTTP vers HTTPS.',
  },
  'SQ-002': {
    title: 'La page d\'accueil renvoie une erreur',
    description: 'La page d\'accueil a renvoyé un code HTTP 4xx ou 5xx.',
    remediationTemplate:
      'Corrigez les erreurs serveur sur votre page d\'accueil pour qu\'elle renvoie le code HTTP 200.',
  },
  'BI-001': {
    title: 'Page de contact introuvable',
    description: 'Aucune page de contact accessible n\'a été détectée lors de l\'exploration.',
    remediationTemplate:
      'Ajoutez une page Contact claire avec e-mail, téléphone ou formulaire de contact, accessible depuis le pied de page.',
  },
  'BI-002': {
    title: 'Politique de confidentialité introuvable',
    description: 'Aucune page de politique de confidentialité n\'a été détectée.',
    remediationTemplate:
      'Publiez une page de politique de confidentialité et liez-la depuis le pied de page.',
  },
  'BI-003': {
    title: 'Conditions générales introuvables',
    description:
      'Aucune page de conditions d\'utilisation ou de mentions légales n\'a été détectée.',
    remediationTemplate:
      'Ajoutez des conditions générales accessibles depuis le pied de page du site.',
  },
  'SH-001': {
    title: 'Politique de livraison introuvable',
    description: 'Aucune page de politique de livraison ou d\'expédition n\'a été détectée.',
    remediationTemplate:
      'Ajoutez une politique de livraison décrivant les coûts, les destinations et les délais de livraison.',
  },
  'RR-001': {
    title: 'Politique de retour introuvable',
    description: 'Aucune page de politique de retour ou de remboursement n\'a été détectée.',
    remediationTemplate:
      'Publiez une politique de retour/remboursement précisant les délais, la procédure et les éventuels frais.',
  },
  'PR-001': {
    title: 'Prix absent des données structurées produit',
    description: 'Une page produit contient des données JSON-LD Product sans prix.',
    remediationTemplate:
      'Ajoutez un prix et une devise corrects à vos données structurées produit.',
  },
  'PR-002': {
    title: 'Description produit insuffisante',
    description: 'Un produit a une description très courte ou manquante.',
    remediationTemplate:
      'Ajoutez une description produit détaillée et unique (au moins 100 caractères).',
  },
  'SQ-003': {
    title: 'Page importante renvoie une erreur',
    description: 'Une page de politique ou une page clé a renvoyé un statut 4xx/5xx.',
    remediationTemplate:
      'Corrigez les pages de politique cassées pour qu\'elles soient accessibles aux clients.',
  },
  'TR-001': {
    title: 'Contenu de substitution détecté',
    description: 'Du texte Lorem ipsum ou de substitution de modèle a été trouvé sur le site.',
    remediationTemplate:
      'Remplacez tout texte de substitution par du contenu commercial réel.',
  },
  'SQ-004': {
    title: 'robots.txt manquant ou inaccessible',
    description: 'Aucun fichier robots.txt n\'a été trouvé ou n\'a pu être récupéré.',
    remediationTemplate:
      'Publiez un fichier robots.txt à la racine de votre domaine pour déclarer les préférences d\'exploration aux moteurs de recherche.',
  },
  'SQ-005': {
    title: 'robots.txt bloque les pages de politique',
    description:
      'robots.txt interdit aux robots d\'explorer d\'importantes pages client (politique ou contact).',
    remediationTemplate:
      'Mettez à jour robots.txt pour que les pages contact, livraison, retours et politiques légales restent explorables.',
  },
  'SQ-006': {
    title: 'robots.txt trop restrictif',
    description:
      'robots.txt bloque un grand nombre d\'URL publiques, ce qui peut limiter la visibilité dans les moteurs de recherche.',
    remediationTemplate:
      'Vérifiez les règles Disallow de robots.txt et évitez de bloquer les URL produits, collections ou politiques nécessaires à la visibilité Shopping.',
  },
  'SQ-012': {
    title: 'sitemap.xml manquant ou inaccessible',
    description:
      'Aucun plan de site XML n\'a été trouvé aux emplacements courants ou via robots.txt.',
    remediationTemplate:
      'Publiez un sitemap.xml (ou un index de sitemaps) et référencez-le dans robots.txt pour une meilleure couverture d\'exploration.',
  },
  'BI-004': {
    title: 'Page À propos introuvable',
    description: 'Aucune page À propos ou d\'informations sur l\'entreprise n\'a été détectée.',
    remediationTemplate:
      'Ajoutez une page À propos décrivant votre activité, votre mission et l\'exploitant de la boutique.',
  },
  'BI-005': {
    title: 'Données structurées Organization absentes',
    description:
      'Aucun JSON-LD Organization ou LocalBusiness n\'a été trouvé sur les pages explorées.',
    remediationTemplate:
      'Ajoutez un schéma Organization ou LocalBusiness avec le nom commercial, l\'URL et les coordonnées.',
  },
  'BI-006': {
    title: 'Page de contact sans moyen de contact accessible',
    description:
      'Une page de contact existe mais aucune adresse e-mail ni numéro de téléphone n\'a été détecté dans son contenu.',
    remediationTemplate:
      'Affichez une adresse e-mail ou un numéro de téléphone du service client sur votre page de contact (pas uniquement un formulaire).',
  },
  'SQ-007': {
    title: 'Titre de la page d\'accueil manquant ou générique',
    description:
      'La balise title de la page d\'accueil est vide, très courte ou utilise un libellé générique.',
    remediationTemplate:
      'Définissez un titre de page d\'accueil descriptif avec le nom de votre marque et ce que vous vendez.',
  },
  'SQ-008': {
    title: 'Meta description de la page d\'accueil manquante',
    description:
      'La page d\'accueil n\'a pas de meta description ou elle est trop courte pour être utile.',
    remediationTemplate:
      'Ajoutez une meta description unique résumant votre boutique et votre proposition de valeur (120–160 caractères).',
  },
  'SQ-009': {
    title: 'Page d\'accueil chargée lentement',
    description: 'La page d\'accueil a mis plus de 3 secondes à répondre pendant le scan.',
    remediationTemplate:
      'Améliorez les performances de la page d\'accueil — optimisez les images, réduisez les scripts et vérifiez l\'hébergement/CDN.',
  },
  'SQ-010': {
    title: 'Attribut de langue manquant sur la page d\'accueil',
    description: 'L\'attribut HTML lang est manquant sur la page d\'accueil.',
    remediationTemplate:
      'Définissez l\'attribut html lang dans votre thème (ex. lang="fr" ou lang="en") pour l\'accessibilité et le SEO.',
  },
  'TR-002': {
    title: 'Page FAQ introuvable',
    description: 'Aucune page FAQ ou d\'aide n\'a été détectée.',
    remediationTemplate:
      'Publiez une FAQ couvrant la livraison, les retours, les tailles et les questions fréquentes avant achat.',
  },
  'TR-003': {
    title: 'Page de politique au contenu insuffisant',
    description:
      'Une page de politique ou de contact importante contient très peu de texte visible.',
    remediationTemplate:
      'Enrichissez les pages de politique avec des détails complets destinés aux clients — pas seulement un paragraphe ou un lien.',
  },
  'PR-003': {
    title: 'Image absente des données structurées produit',
    description: 'Un produit a des données JSON-LD Product sans image.',
    remediationTemplate:
      'Assurez-vous que chaque produit dispose d\'au moins une image dans les données structurées et sur la page.',
  },
  'PR-004': {
    title: 'Disponibilité absente des données structurées produit',
    description:
      'Un bloc JSON-LD produit ne spécifie pas la disponibilité ni le statut en stock.',
    remediationTemplate:
      'Ajoutez offers.availability (ex. InStock / OutOfStock) aux données structurées produit.',
  },
  'PR-005': {
    title: 'Aucun produit détecté lors de l\'exploration',
    description:
      'Le scan a trouvé des pages produit ou collection mais n\'a extrait aucune donnée structurée produit.',
    remediationTemplate:
      'Vérifiez que les produits sont publiés, indexables et incluent du JSON-LD Product avec offers.',
  },
};
