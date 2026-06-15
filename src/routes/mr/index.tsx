import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { generateSEO, generateHreflangLinks } from '../../backend/lib/seo';
import { translations } from '../../frontend/features/core/i18n';
import { Navbar } from '../../frontend/features/core/Navbar';
import { FooterSection as Footer } from '../../frontend/features/core/Footer';
import { Hero } from '../../frontend/features/home/Hero';
import { AboutSection } from '../../frontend/features/home/AboutSection';
import { FeaturesSection } from '../../frontend/features/why-choose-us/FeaturesSection';
import { ToursSection } from '../../frontend/features/tours/ToursSection';
import { ReviewsSection } from '../../frontend/features/reviews/ReviewsSection';
import { GallerySection } from '../../frontend/features/gallery/GallerySection';

export const Route = createFileRoute('/mr/')({
  head: () => ({
    meta: generateSEO({
      title: 'शैलराज ट्रॅव्हल्स | पुणे येथील सर्वोत्तम पर्यटन संस्था',
      description: 'पुण्यातील सर्वोत्तम तीर्थक्षेत्र ट्रॅव्हल एजन्सी. अष्टविनायक, ज्योतिर्लिंग, पंढरपूर आणि चार धाम यात्रा आरामदायी प्रवास आणि दर्शन सुविधेसह बुक करा.',
      canonicalUrl: 'https://www.shailrajtravels.com/mr/',
      type: 'website',
      lang: 'mr'
    }),
    links: [
      { rel: 'canonical', href: 'https://www.shailrajtravels.com/mr/' },
      ...generateHreflangLinks('https://www.shailrajtravels.com/mr/')
    ]
  }),
  component: MarathiHomePage,
});

function MarathiHomePage() {
  const lang = "mr";
  const t = translations[lang];

  return (
    <div className="font-sans text-slate-800 bg-white selection:bg-brand-green/20 selection:text-brand-blue-deep overflow-x-hidden">
      <Navbar t={t} />
      <main>
        <Hero lang={lang} t={t} tripOptions={[]} />
        <AboutSection lang={lang} t={t} />
        <FeaturesSection lang={lang} t={t} />
        <ToursSection lang={lang} t={t} packages={[]} />
        <ReviewsSection lang={lang} t={t} />
        <GallerySection t={t} photos={[]} />
      </main>
      <Footer t={t} />
    </div>
  );
}
