import React from 'react';
import { createFileRoute, notFound } from '@tanstack/react-router';
import { getTourBySlugFn } from '../../backend/lib/tours';
import { TourPageTemplate } from '../../frontend/templates/TourPageTemplate';
import { generateSEO, generateHreflangLinks } from '../../backend/lib/seo';

export const Route = createFileRoute('/mr/tours/$tourSlug')({
  loader: async ({ params }) => {
    // With our new seeded SEO DB, city variants are stored as individual documents!
    const tour = await getTourBySlugFn({ data: { slug: params.tourSlug, lang: 'mr' } });
    
    if (!tour) {
      throw notFound();
    }
    
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
        type: 'website',
        lang: 'mr'
      }),
      links: [
        { rel: 'canonical', href: loaderData.canonicalUrl },
        ...generateHreflangLinks(loaderData.canonicalUrl)
      ]
    };
  },
  component: TourPageComponent,
});

function TourPageComponent() {
  const tour = Route.useLoaderData();
  return <TourPageTemplate data={tour} />;
}
