import React from "react";
import { Link } from "@tanstack/react-router";
import { MapPin, Calendar, Repeat, Route, Info } from "lucide-react";
import { LazyImage } from "@/frontend/components/ui/lazy-image";

export interface TourData {
  id: string;
  slug?: string;
  image: string;
  images?: string[];
  durationBadge: string;
  subtitle: string;
  title: string;
  location: string;
  schedule: string;
  frequency: string;
  route: string[];
  tags: string[];
  seatsAvailable: number;
  seatsTotal: number;
  price: string;
  itinerary: { day: string; title: string }[];
  includes: string[];
  dates?: string[];
}

interface TourCardProps {
  tour: TourData;
  onOpenDetails: (tour: TourData) => void;
  onBookSeat?: (tour: TourData) => void;
  t: any;
}

export function TourCard({ tour, onOpenDetails, onBookSeat, t }: TourCardProps) {
  const seatsPercentage = (tour.seatsAvailable / tour.seatsTotal) * 100;

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col max-w-[400px] w-full mx-auto h-full">
      {/* Image Header */}
      <div className="relative h-[220px] w-full overflow-hidden">
        <LazyImage src={tour.image} alt={tour.title} className="w-full h-full object-cover" />
        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#112233] via-[#112233]/60 to-transparent" />

        {/* Duration Badge */}
        <div className="absolute top-4 right-4 bg-[#F59E0B] text-[#112233] font-bold text-[13px] px-3 py-1.5 rounded-full shadow-md z-10">
          {tour.durationBadge}
        </div>

        {/* Text Overlays */}
        <div className="absolute bottom-4 left-5 right-5 z-10">
          <p className="text-[#F59E0B] font-medium text-[13px] mb-1 drop-shadow-sm">
            {tour.subtitle}
          </p>
          <h3 className="text-white font-bold text-2xl leading-tight drop-shadow-md">
            {tour.title}
          </h3>
        </div>
      </div>

      {/* Info Section */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Location & Schedule */}
        <div className="flex items-center gap-6 mb-4">
          <div className="flex items-center gap-2 text-slate-600">
            <MapPin className="w-4 h-4 text-slate-500" />
            <span className="text-[15px] font-medium">{tour.location}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span className="text-[15px] font-medium">{tour.schedule}</span>
          </div>
        </div>

        {/* Frequency Badge */}
        <div className="bg-amber-50 text-amber-900 border border-amber-100 rounded-full px-4 py-2 flex items-center gap-2 w-fit mb-4">
          <Repeat className="w-4 h-4 text-amber-600" />
          <span className="text-[14px] font-semibold">{tour.frequency}</span>
        </div>

        {/* Route Box */}
        <div className="bg-[#F8FAFC] rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-2 text-[#112233] font-semibold">
            <Route className="w-4 h-4" />
            <span className="text-[14px]">{t?.cardRoute || "Route"}</span>
          </div>
          <div className="flex flex-wrap items-center text-[14px] text-[#112233] font-medium leading-relaxed gap-x-1.5">
            {(tour.route || []).map((stop, index) => (
              <React.Fragment key={index}>
                <span>{stop}</span>
                {index < (tour.route || []).length - 1 && (
                  <span className="text-amber-500 text-[12px] opacity-70">›</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-5">
          {(tour.tags || []).map((tag, index) => (
            <span
              key={index}
              className="bg-slate-100 text-slate-700 text-[13px] font-semibold px-3 py-1.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Seats Progress */}
        <div className="mb-5 mt-auto">
          <div className="flex justify-between items-center text-[13px] font-semibold text-slate-500 mb-2">
            <span>
              {tour.seatsAvailable} {t?.cardSeatsAvail || "seats available"}
            </span>
            <span>
              {tour.seatsTotal} {t?.cardSeatsTotal || "total"}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#F59E0B] h-full rounded-full"
              style={{ width: `${seatsPercentage}%` }}
            />
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-slate-100 mb-4" />

        {/* Footer: Price & Buttons */}
        <div className="flex justify-between items-end gap-2">
          <div>
            <p className="text-[13px] font-medium text-slate-500 mb-0.5">
              {t?.cardPerPerson || "Per person"}
            </p>
            <p className="text-[#112233] font-bold text-2xl tracking-tight">{tour.price}</p>
          </div>
          <div className="flex gap-2">
            {tour.slug ? (
              <Link
                to="/tours/$tourSlug"
                params={{ tourSlug: tour.slug }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-[#112233] font-semibold text-[14px] hover:bg-slate-50 transition-colors"
              >
                <Info className="w-4 h-4" /> {t?.cardDetails || "Details"}
              </Link>
            ) : (
              <button
                onClick={() => onOpenDetails(tour)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-[#112233] font-semibold text-[14px] hover:bg-slate-50 transition-colors"
              >
                <Info className="w-4 h-4" /> {t?.cardDetails || "Details"}
              </button>
            )}
            {onBookSeat ? (
              <button
                onClick={() => onBookSeat(tour)}
                className="flex items-center justify-center px-6 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-[#E5910A] text-[#112233] font-bold text-[14px] transition-colors cursor-pointer"
              >
                {t?.cardBookSeat || "Book Seat"}
              </button>
            ) : tour.slug ? (
              <Link
                to="/tours/$tourSlug"
                params={{ tourSlug: tour.slug }}
                hash="sidebar-booking-form"
                className="flex items-center justify-center px-6 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-[#E5910A] text-[#112233] font-bold text-[14px] transition-colors"
              >
                {t?.cardBookSeat || "Book Seat"}
              </Link>
            ) : (
              <a
                href="#sidebar-booking-form"
                className="flex items-center justify-center px-6 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-[#E5910A] text-[#112233] font-bold text-[14px] transition-colors"
              >
                {t?.cardBookSeat || "Book Seat"}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
