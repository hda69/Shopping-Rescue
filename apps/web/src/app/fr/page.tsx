import type { Metadata } from 'next';

import { HomePageContent } from '@/components/home-page';
import { getMessages } from '@/config/messages';

const m = getMessages('fr');

export const metadata: Metadata = {
  title: m.meta.homeTitle,
  description: m.meta.homeDescription,
  alternates: {
    canonical: '/fr',
    languages: {
      en: '/',
      fr: '/fr',
    },
  },
};

export default function FrenchHomePage() {
  return <HomePageContent locale="fr" />;
}
