import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useLanguage } from "./__root";
import { getReviewsFn } from "../lib/reviews";

import { translations } from "../features/core/i18n";
import { Navbar } from "../features/core/Navbar";
import { FooterSection as Footer } from "../features/core/Footer";
import { Hero } from "../features/home/Hero";
import { AboutSection } from "../features/home/AboutSection";
import { FeaturesSection } from "../features/why-choose-us/FeaturesSection";
import { ToursSection } from "../features/tours/ToursSection";
import { ReviewsSection } from "../features/reviews/ReviewsSection";
import { GallerySection } from "../features/gallery/GallerySection";

import { getPackagesFn } from "../lib/packages";

export const Route = createFileRoute("/")({
  component: HomePage,
  loader: async () => {
    try {
      const [reviews, packages, tripOptions, galleryPhotos] = await Promise.all([
        getReviewsFn(),
        getPackagesFn(),
        import('../lib/bookings').then(m => m.getTripOptionsFn()),
        import('../lib/gallery').then(m => m.getGalleryPhotosFn())
      ]);
      return { reviews, packages, tripOptions, galleryPhotos };
    } catch (e) {
      console.error(e);
      return { reviews: [], packages: [] };
    }
  },
});

function HomePage() {
  const { lang } = useLanguage();
  const t = translations[lang];

  const { reviews: dbReviews, packages: dbPackages, tripOptions = [], galleryPhotos = [] } = Route.useLoaderData() as any;

  return (
    <div className="font-sans text-slate-800 bg-white selection:bg-brand-green/20 selection:text-brand-blue-deep overflow-x-hidden">
      <Navbar t={t} />
      <main>
        <Hero lang={lang} t={t} tripOptions={tripOptions} />
        <AboutSection lang={lang} t={t} />
        <FeaturesSection lang={lang} t={t} />
        <ToursSection lang={lang} t={t} packages={dbPackages} />
        <ReviewsSection lang={lang} t={t} />
        <GallerySection t={t} photos={galleryPhotos} />
      </main>
      <Footer t={t} />
    </div>
  );
}
