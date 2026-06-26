import React from 'react';
import { createFileRoute, notFound } from '@tanstack/react-router';
import { getTourBySlugFn } from '../backend/lib/tours';
import { TourPageTemplate } from '../frontend/templates/TourPageTemplate';
import { generateSEO } from '../backend/lib/seo';
import { generateProductSchema } from '../backend/lib/schema-generators';
import { useLanguage } from './__root';
import { translations } from '../frontend/features/core/i18n';
export const Route = createFileRoute("/tours/$tourSlug")({
  validateSearch: (search: Record<string, unknown>): { lang?: string } => ({
    lang: search.lang as string | undefined,
  }),
  loaderDeps: ({ search: { lang } }) => ({ lang }),
  loader: async ({ params, deps: { lang } }) => {
    const tour = await getTourBySlugFn({ data: { slug: params.tourSlug, lang: lang || "en" } });
    if (!tour) {
      throw notFound();
    }

    // Dynamically generate schema since it's no longer stored in DB
    (tour as any).schemaData = generateProductSchema({
      name: tour.title,
      description: tour.metaDescription || tour.heroContent?.description,
      image: `https://www.shailrajtravels.com${tour.heroContent?.image || ""}`,
      price: tour.packages?.[0]?.price || "0",
      ratingValue: 4.8,
      reviewCount: 150,
    });

    return tour as any;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "404 Not Found" }, { name: "robots", content: "noindex, nofollow" }],
      };
    }

    return {
      meta: generateSEO({
        title: loaderData.metaTitle,
        description: loaderData.metaDescription,
        canonicalUrl: loaderData.canonicalUrl,
        ogImage: `https://www.shailrajtravels.com${loaderData.heroContent.image}`,
        type: "website",
      }),
      links: [{ rel: "canonical", href: loaderData.canonicalUrl }],
    };
  },
  component: TourPageComponent,
  pendingComponent: TourPageSkeleton
});

function TourPageSkeleton() {
  const { lang } = useLanguage();
  const t = translations[lang];

  return (
    <main className="w-full bg-white pb-16">
      {/* Hero Section Skeleton */}
      <section className="relative w-full h-[60vh] min-h-[450px] bg-slate-100 flex flex-col items-center justify-center animate-pulse">
        <div className="text-center px-4 max-w-4xl w-full">
          <div className="h-12 md:h-16 bg-slate-200 rounded-md w-3/4 mx-auto mb-6" />
          <div className="h-5 bg-slate-200 rounded-md max-w-xl mx-auto mb-8" />
          <div className="flex justify-center gap-4">
            <div className="h-12 bg-slate-200 rounded-lg w-32" />
            <div className="h-12 bg-slate-200 rounded-lg w-32" />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb Skeleton */}
        <div className="h-5 bg-slate-100 rounded-md w-48 mb-6 animate-pulse" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-6">
          <div className="lg:col-span-2 space-y-12">
            {/* Overview Skeleton */}
            <section className="space-y-4">
              <div className="h-8 bg-slate-100 rounded-md w-36 mb-6 animate-pulse" />
              <div className="h-4 bg-slate-100 rounded-md w-full animate-pulse" />
              <div className="h-4 bg-slate-100 rounded-md w-full animate-pulse" />
              <div className="h-4 bg-slate-100 rounded-md w-5/6 animate-pulse" />
              <div className="h-4 bg-slate-100 rounded-md w-4/5 animate-pulse" />
            </section>

            {/* Highlights Skeleton */}
            <section className="space-y-3">
              <div className="h-8 bg-slate-100 rounded-md w-48 mb-6 animate-pulse" />
              <div className="h-4 bg-slate-100 rounded-md w-11/12 animate-pulse" />
              <div className="h-4 bg-slate-100 rounded-md w-5/6 animate-pulse" />
              <div className="h-4 bg-slate-100 rounded-md w-full animate-pulse" />
              <div className="h-4 bg-slate-100 rounded-md w-4/5 animate-pulse" />
            </section>

            {/* Pricing Skeleton */}
            <section>
              <div className="h-8 bg-slate-100 rounded-md w-52 mb-6 animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col bg-white space-y-4">
                    <div className="h-6 bg-slate-100 rounded-md w-1/2 animate-pulse" />
                    <div className="h-8 bg-slate-100 rounded-md w-2/3 animate-pulse" />
                    <div className="space-y-2 py-4">
                      <div className="h-4 bg-slate-100 rounded-md w-full animate-pulse" />
                      <div className="h-4 bg-slate-100 rounded-md w-5/6 animate-pulse" />
                      <div className="h-4 bg-slate-100 rounded-md w-4/5 animate-pulse" />
                    </div>
                    <div className="h-10 bg-slate-100 rounded-md w-full animate-pulse mt-auto" />
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="lg:col-span-1">
            {/* Sidebar Booking Skeleton */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
              <div className="h-6 bg-slate-200 rounded-md w-2/3 animate-pulse" />
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-slate-200 rounded-md w-1/4 animate-pulse" />
                    <div className="h-10 bg-slate-200 rounded-md w-full animate-pulse" />
                  </div>
                ))}
              </div>
              <div className="h-12 bg-slate-200 rounded-md w-full animate-pulse mt-4" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function TourPageComponent() {
  const tour = Route.useLoaderData();
  return <TourPageTemplate data={tour} />;
}
