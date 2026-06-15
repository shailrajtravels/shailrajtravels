import React from 'react';
import { createFileRoute, notFound } from '@tanstack/react-router';
import { toursMr } from '../../data/tours.mr';
import { TourPageTemplate } from '../../templates/TourPageTemplate';
import { generateSEO, generateHreflangLinks } from '../../lib/seo';

export const Route = createFileRoute('/mr/tours/$tourSlug')({
  loader: ({ params }) => {
    let baseSlug = params.tourSlug;
    let citySlug: string | undefined;

    const fromMatch = params.tourSlug.match(/^(.*)-from-(.*)$/);
    if (fromMatch) {
      baseSlug = fromMatch[1];
      citySlug = fromMatch[2];
    }

    const baseTour = toursMr.find((t) => t.slug === baseSlug);
    if (!baseTour) {
      throw notFound();
    }

    if (citySlug) {
      const cityVariant = baseTour.cityVariants?.find(cv => cv.citySlug === citySlug);
      if (!cityVariant) {
        throw notFound();
      }

      // Merge city variant data
      const mergedTour = {
        ...baseTour,
        slug: params.tourSlug,
        title: `${baseTour.title} from ${cityVariant.cityName}`,
        metaTitle: cityVariant.metaTitle,
        metaDescription: cityVariant.metaDescription,
        canonicalUrl: `https://www.shailrajtravels.com/mr/tours/${params.tourSlug}`,
        heroContent: {
          ...baseTour.heroContent,
          description: cityVariant.heroDescription,
        },
        overview: cityVariant.overview,
        faq: cityVariant.faq,
      };
      
      if (cityVariant.packages && cityVariant.packages.length > 0) {
         mergedTour.packages = cityVariant.packages;
      }
      
      // Merge schema specific to city
      if (mergedTour.schemaData) {
        mergedTour.schemaData = {
          ...mergedTour.schemaData,
          name: mergedTour.title,
          description: mergedTour.metaDescription,
          url: mergedTour.canonicalUrl,
        };
        if (cityVariant.packages && cityVariant.packages[0]?.price) {
          mergedTour.schemaData.offers.price = cityVariant.packages[0].price;
        }
      }

      return mergedTour as NonNullable<typeof baseTour>;
    }

    return baseTour as NonNullable<typeof baseTour>;
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
  return <TourPageTemplate data={tour} lang="mr" />;
}
