import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { SeoLandingPage } from '@/components/seo-landing-page';
import {
  buildSeoLandingMetadata,
  getSeoLandingPage,
  SEO_LANDING_SLUGS,
  type SeoLandingSlug,
} from '@/config/seo-landing-pages';

interface FrSeoLandingPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return SEO_LANDING_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: FrSeoLandingPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getSeoLandingPage(slug, 'fr');
  if (!page) return {};
  return buildSeoLandingMetadata(page, 'fr');
}

export default async function FrSeoLandingPage({ params }: FrSeoLandingPageProps) {
  const { slug } = await params;

  if (!SEO_LANDING_SLUGS.includes(slug as SeoLandingSlug)) {
    notFound();
  }

  const page = getSeoLandingPage(slug, 'fr');
  if (!page) notFound();

  return <SeoLandingPage page={page} locale="fr" />;
}
