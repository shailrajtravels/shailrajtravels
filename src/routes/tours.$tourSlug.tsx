import React from 'react';
import { createFileRoute, notFound } from '@tanstack/react-router';
import { tours } from '../data/tours';
import { TourPageTemplate } from '../templates/TourPageTemplate';
import { generateSEO } from '../lib/seo';

export const Route = createFileRoute('/tours/$tourSlug')({
  loader: ({ params }) => {
    const tour = tours.find((t) => t.slug === params.tourSlug);
    if (!tour) {
      throw notFound();
    }
    return tour;
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
