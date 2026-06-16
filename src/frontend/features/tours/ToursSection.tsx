import React, { useState, useEffect, useCallback } from 'react';
import { TourCard } from './TourCard';
import { TourModal } from './TourModal';
import { getMockTours, TourData } from './data';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import bgFallback from '@/frontend/assets/hero-pandharpur.jpg';

export function ToursSection({ lang, t, packages, tripOptions }: { lang: 'mr' | 'en', t: any, packages?: any[], tripOptions?: any[] }) {
  const [selectedTour, setSelectedTour] = useState<TourData | null>(null);

  const mappedTripOptions = (tripOptions || []).map((trip: any) => ({
    id: trip._id,
    slug: trip._id,
    image: trip.image || bgFallback,
    durationBadge: "Weekly Trip",
    subtitle: trip.name,
    title: trip.name,
    location: "Various",
    schedule: trip.schedule || (Array.isArray(trip.dates) && trip.dates.length > 0 ? trip.dates.join(', ') : "Flexible"),
    frequency: "Weekly",
    route: [],
    tags: ["Pilgrimage"],
    seatsAvailable: 15,
    seatsTotal: 20,
    price: trip.price || "On Request",
    itinerary: [],
    includes: []
  }));

  // Display DB packages and mapped trip options
  const displayPackages = [...(packages || []), ...mappedTripOptions];

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'start' },
    [Autoplay({ delay: 3000, stopOnInteraction: true })]
  );
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  return (
    <section id="tours" className="w-full bg-[#F8FAFC] pt-12 pb-8 lg:pt-20 lg:pb-16 relative scroll-mt-28 md:scroll-mt-32">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="flex flex-col items-center justify-center text-center mb-12 animate-reveal">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-[1px] w-10 bg-brand-green" />
            <span className="text-[13px] md:text-[15px] font-bold tracking-[0.2em] text-brand-green-dark uppercase leading-none">
              {t.toursSubtitle || "PACKAGES"}
            </span>
            <div className="h-[1px] w-10 bg-brand-green" />
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display text-brand-blue-deep leading-tight">
            {t.toursTitlePrefix || "Popular"} <span className="text-brand-green-dark">{t.toursTitleHighlight || "Journeys"}</span>
          </h2>
        </div>

        <div className="relative group">
          <div className="overflow-hidden -mx-4 px-4 pb-4" ref={emblaRef}>
            <div className="flex gap-8">
              {displayPackages.map((tour: any) => (
                <div key={tour.id || tour._id} className="flex-[0_0_100%] md:flex-[0_0_calc(50%-1rem)] lg:flex-[0_0_calc(33.333%-1.33rem)] min-w-0 flex flex-col">
                  <TourCard tour={tour} onOpenDetails={setSelectedTour} t={t} />
                </div>
              ))}
            </div>
          </div>
          
          <button
            onClick={scrollPrev}
            className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-20 h-14 w-14 items-center justify-center rounded-full bg-white shadow-xl border border-slate-100 text-brand-blue-deep opacity-0 transition-all hover:bg-brand-green hover:text-white group-hover:opacity-100 hover:scale-110"
          >
            <ChevronLeft className="h-7 w-7 ml-[-2px]" />
          </button>
          <button
            onClick={scrollNext}
            className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20 h-14 w-14 items-center justify-center rounded-full bg-white shadow-xl border border-slate-100 text-brand-blue-deep opacity-0 transition-all hover:bg-brand-green hover:text-white group-hover:opacity-100 hover:scale-110"
          >
            <ChevronRight className="h-7 w-7 mr-[-2px]" />
          </button>
        </div>
      </div>

      {selectedTour && (
        <TourModal tour={selectedTour} onClose={() => setSelectedTour(null)} t={t} />
      )}
    </section>
  );
}
