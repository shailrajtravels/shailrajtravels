import React, { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useLanguage } from '@/routes/__root';
import { getReviewsFn } from '@/backend/features/reviews';

import { translations } from '@/frontend/core/i18n';
import { Navbar } from '@/frontend/core/Navbar';
import { FooterSection as Footer } from '@/frontend/core/Footer';
import { Hero } from '@/frontend/features/home/Hero';
import { AboutSection } from '@/frontend/features/home/AboutSection';
import { FeaturesSection } from '@/frontend/features/why-choose-us/FeaturesSection';
import { ToursSection } from '@/frontend/features/tours/ToursSection';
import { ReviewsSection } from '@/frontend/features/reviews/ReviewsSection';
import { GallerySection } from '@/frontend/features/gallery/GallerySection';
import { BookingModal } from '@/frontend/features/tours/BookingModal';

import { getPackagesFn } from '@/backend/features/packages';

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { lang?: string } => ({
    lang: search.lang as string | undefined,
  }),
  loaderDeps: ({ search: { lang } }) => ({ lang }),
  component: HomePage,
  loader: async ({ deps: { lang } }) => {
    try {
      const [reviews, packages, tripOptions, galleryPhotos, tours] = await Promise.all([
        getReviewsFn(),
        getPackagesFn(),
        import('@/backend/shared/bookings').then((m) => m.getTripOptionsFn()),
        import('@/backend/shared/gallery').then((m) => m.getGalleryPhotosFn()),
        import('@/backend/features/tours').then((m) => m.getToursFn({ data: { lang: lang || "en" } })),
      ]);
      return { reviews, packages, tripOptions, galleryPhotos, tours };
    } catch (e) {
      console.error(e);
      return { reviews: [], packages: [], tripOptions: [], galleryPhotos: [], tours: [] };
    }
  },
});

function HomePage() {
  const { lang } = useLanguage();
  const t = translations[lang];

  const {
    reviews: dbReviews,
    packages: dbPackages,
    tripOptions = [],
    galleryPhotos = [],
    tours = [],
  } = Route.useLoaderData() as any;

  const [bookingTour, setBookingTour] = useState<any | null>(null);

  const handleBookSeat = (tour: any) => {
    setBookingTour(tour);
  };

  return (
    <div className="font-sans text-slate-800 bg-white selection:bg-brand-green/20 selection:text-brand-blue-deep overflow-x-hidden">
      <Navbar t={t} />
      <main>
        <Hero lang={lang} t={t} tripOptions={tripOptions} activeTripId="" />
        <AboutSection lang={lang} t={t} />
        <FeaturesSection lang={lang} t={t} />
        <ToursSection
          lang={lang}
          t={t}
          packages={dbPackages}
          tripOptions={tripOptions}
          tours={tours}
          onBookSeat={handleBookSeat}
        />
        <ReviewsSection lang={lang} t={t} />
        <GallerySection t={t} photos={galleryPhotos} />
      </main>
      {bookingTour && (
        <BookingModal tour={bookingTour} onClose={() => setBookingTour(null)} t={t} lang={lang} />
      )}
      <Footer t={t} lang={lang} />
    </div>
  );
}
