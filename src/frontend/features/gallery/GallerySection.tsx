import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { LazyImage } from '@/frontend/shared/ui/lazy-image';

export function GallerySection({ t, photos = [] }: { t: any; photos?: any[] }) {
  if (!photos || photos.length === 0) return null;
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" }, [
    Autoplay({ delay: 3000, stopOnInteraction: false }),
  ]);

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  return (
    <section
      id="gallery"
      className="w-full bg-[#FCFCFC] py-12 lg:py-20 scroll-mt-28 md:scroll-mt-32 relative"
    >
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="flex flex-col items-center text-center mb-16 animate-reveal">
          <p className="flex items-center gap-3 text-[13px] md:text-[15px] font-bold tracking-[0.2em] text-brand-green-dark mb-4 uppercase">
            <span className="h-px w-8 bg-brand-green" />
            {t.galleryTitle}
            <span className="h-px w-8 bg-brand-green" />
          </p>
          <h2 className="text-4xl md:text-5xl font-bold font-display text-brand-blue-deep leading-tight">
            {t.gallerySubtitle}
          </h2>
        </div>

        <div className="relative group">
          <div className="overflow-hidden -mx-4 px-4 pb-4" ref={emblaRef}>
            <div className="flex gap-4 md:gap-6">
              {photos.map((photo, idx) => (
                <div
                  key={photo._id || idx}
                  className="flex-[0_0_100%] md:flex-[0_0_calc(50%-0.75rem)] lg:flex-[0_0_calc(33.333%-1rem)] min-w-0 flex flex-col transition-transform"
                >
                  <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden rounded-2xl group/item border border-slate-100 shadow-sm bg-white flex items-center justify-center p-4">
                    <LazyImage
                      src={photo.imageUrl}
                      alt="Gallery"
                      className="h-full w-full object-contain transition-transform duration-700 group-hover/item:scale-110"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            suppressHydrationWarning
            onClick={scrollPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-lg text-brand-blue-deep opacity-0 transition-all hover:bg-brand-green hover:text-white group-hover:opacity-100"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            suppressHydrationWarning
            onClick={scrollNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-lg text-brand-blue-deep opacity-0 transition-all hover:bg-brand-green hover:text-white group-hover:opacity-100"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </div>
    </section>
  );
}
