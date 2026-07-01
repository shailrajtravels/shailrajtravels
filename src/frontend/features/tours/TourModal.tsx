import React, { useEffect, useCallback } from 'react';
import { X, Clock, Bus, Calendar, Route, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { TourData } from '@/frontend/features/tours/TourCard';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

interface TourModalProps {
  tour: TourData;
  onClose: () => void;
  onBookSeat?: (tour: TourData) => void;
  t: any;
}

export function TourModal({ tour, onClose, onBookSeat, t }: TourModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const hasMultipleImages = tour.images && tour.images.length > 1;
  const displayImages = hasMultipleImages ? tour.images : [tour.image];
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 4000 })]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 bg-[#112233]/40 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop click handler */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative w-full max-w-[500px] max-h-[90vh] bg-white rounded-[24px] sm:rounded-[32px] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-start p-6 pb-4">
          <div>
            <p className="text-[#F59E0B] font-medium text-[13px] mb-1">{tour.subtitle}</p>
            <h2 className="text-[#112233] font-bold text-2xl leading-tight pr-4">{tour.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 -mt-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 px-6 pb-24">
          {/* Main Image Slider */}
          <div className="relative w-full h-[200px] sm:h-[240px] rounded-[24px] overflow-hidden mb-6 group">
            {hasMultipleImages ? (
              <>
                <div className="overflow-hidden h-full" ref={emblaRef}>
                  <div className="flex h-full">
                    {displayImages?.map((img: string, index: number) => (
                      <div key={index} className="flex-[0_0_100%] min-w-0 h-full relative">
                        <img
                          src={img}
                          alt={`${tour.title} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#112233]/40 to-transparent" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation Arrows */}
                <button
                  onClick={scrollPrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-slate-800 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-md"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={scrollNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-slate-800 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-md"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            ) : (
              <img
                src={displayImages?.[0] || tour.image}
                alt={tour.title}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-[#F8FAFC] rounded-2xl flex flex-col items-center justify-center py-3 px-2 text-center">
              <Clock className="w-5 h-5 text-[#F59E0B] mb-1.5" />
              <span className="text-[#112233] font-bold text-[14px]">{tour.durationBadge}</span>
            </div>
            <div className="bg-[#F8FAFC] rounded-2xl flex flex-col items-center justify-center py-3 px-2 text-center">
              <Bus className="w-5 h-5 text-[#F59E0B] mb-1.5" />
              <span className="text-[#112233] font-bold text-[14px]">{tour.location}</span>
            </div>
            <div className="bg-[#F8FAFC] rounded-2xl flex flex-col items-center justify-center py-3 px-2 text-center">
              <Calendar className="w-5 h-5 text-[#F59E0B] mb-1.5" />
              <span className="text-[#112233] font-bold text-[14px]">{tour.schedule}</span>
            </div>
          </div>

          {/* Detailed Route Box */}
          <div className="bg-amber-50 rounded-[20px] p-5 mb-8 border border-amber-100">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <div className="flex items-center gap-1.5 text-[#112233] font-bold text-[14px]">
                <Route className="w-4 h-4 text-[#F59E0B]" />
                {tour.frequency}
              </div>
              <span className="text-[#F59E0B] font-bold text-[14px]">›</span>
              <span className="text-[#112233] font-bold text-[14px]">
                {t?.modalFullRoute || "Full Route"}
              </span>
            </div>
            <div className="flex flex-wrap items-center text-[14px] text-[#112233] font-medium leading-relaxed gap-x-1.5">
              {(tour.route || []).map((stop, index) => (
                <React.Fragment key={index}>
                  <span>{stop}</span>
                  {index < (tour.route || []).length - 1 && (
                    <span className="text-[#F59E0B] text-[12px] font-bold opacity-80">›</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Itinerary */}
          <div className="mb-8">
            <h3 className="text-[#112233] font-bold text-[18px] mb-4">
              {t?.modalItinerary || "Itinerary"}
            </h3>
            <div className="space-y-4">
              {(tour.itinerary || []).map((item, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className="bg-[#112233] text-white font-bold text-[12px] px-3 py-1.5 rounded-full shrink-0 whitespace-nowrap mt-0.5">
                    {item.day}
                  </div>
                  <div className="text-slate-600 text-[15px] leading-relaxed">{item.title}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Package Includes */}
          <div>
            <h3 className="text-[#112233] font-bold text-[18px] mb-4">
              {t?.modalIncludes || "Package includes"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4">
              {(tour.includes || []).map((item, index) => (
                <div key={index} className="flex items-center gap-2.5">
                  <Check className="w-[18px] h-[18px] text-[#10A34A]" />
                  <span className="text-slate-600 text-[15px] font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-100 p-6 flex justify-between items-center rounded-b-[24px] sm:rounded-b-[32px]">
          <div>
            <p className="text-[13px] font-medium text-slate-500 mb-0.5">
              {t?.cardPerPerson || "Per person"}
            </p>
            <p className="text-[#112233] font-bold text-3xl tracking-tight leading-none">
              {tour.price}
            </p>
          </div>
          {onBookSeat ? (
            <button
              onClick={() => {
                onClose();
                onBookSeat(tour);
              }}
              className="flex items-center justify-center px-8 py-3.5 rounded-[14px] bg-[#F59E0B] hover:bg-[#E5910A] text-[#112233] font-bold text-[16px] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
            >
              {t?.cardBookSeat || "Book Seat"}
            </button>
          ) : (
            <a
              href="#book"
              className="flex items-center justify-center px-8 py-3.5 rounded-[14px] bg-[#F59E0B] hover:bg-[#E5910A] text-[#112233] font-bold text-[16px] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              {t?.cardBookSeat || "Book Seat"}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
