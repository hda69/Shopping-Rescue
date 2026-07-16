import type { Metadata } from 'next';

import { HomePageContent } from '@/components/home-page';
import { getMessages } from '@/config/messages';

const m = getMessages('en');

export const metadata: Metadata = {
  title: m.meta.homeTitle,
  description: m.meta.homeDescription,
};

export default function HomePage() {
  return <HomePageContent locale="en" />;
}
