import React from 'react';
import { createFileRoute, notFound } from '@tanstack/react-router';
import { getTourBySlugFn } from '../backend/lib/tours';
import { TourPageTemplate } from '../frontend/templates/TourPageTemplate';
import {  generateSEO  } from '../backend/lib/seo';
import { generateProductSchema } from '../backend/lib/schema-generators';

export const Route = createFileRoute('/tours/$tourSlug')({
  validateSearch: (search: Record<string, unknown>): { lang?: string } => ({ lang: search.lang as string | undefined }),
  loaderDeps: ({ search: { lang } }) => ({ lang }),
  loader: async ({ params, deps: { lang } }) => {
    const tour = await getTourBySlugFn({ data: { slug: params.tourSlug, lang: lang || 'en' } });
    if (!tour) {
      throw notFound();
    }
    
    // Dynamically generate schema since it's no longer stored in DB
    (tour as any).schemaData = generateProductSchema({
      name: tour.title,
      description: tour.metaDescription || tour.heroContent?.description,
      image: `https://www.shailrajtravels.com${tour.heroContent?.image || ''}`,
      price: tour.packages?.[0]?.price || '0',
      ratingValue: 4.8,
      reviewCount: 150
    });
    
    return tour as any;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: '404 Not Found' },
          { name: 'robots', content: 'noindex, nofollow' }
        ]
      };
    }
    
    return {
      meta: generateSEO({
        title: loaderData.metaTitle,
        description: loaderData.metaDescription,
        canonicalUrl: loaderData.canonicalUrl,
        ogImage: `https://www.shailrajtravels.com${loaderData.heroContent.image}`,
        type: 'website'
      }),
      links: [
        { rel: 'canonical', href: loaderData.canonicalUrl }
      ]
    };
  },
  component: TourPageComponent,
});

function TourPageComponent() {
  const tour = Route.useLoaderData();
  return <TourPageTemplate data={tour} />;
}
