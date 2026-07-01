import React, { useState, useEffect } from 'react';
import {
  Search,
  ChevronDown,
  BadgeIndianRupee,
  ShieldCheck,
  Headphones,
  Lock,
  User,
  Phone,
  MapPin,
  Users,
  Calendar,
  Minus,
  Plus,
  Snowflake,
  BedDouble,
  Compass,
  Loader2,
} from 'lucide-react';
import { Leaf } from '@/frontend/core/icons';
import { translations } from '@/frontend/core/i18n';
import { highlightBrandName } from '@/frontend/core/BrandHighlight';
import bgMobile from '@/frontend/shared/assets/hero-pandharpur.webp';
import temple from '@/frontend/shared/assets/hero-pandharpur.webp'; // fallback until correct image is found
import { createBookingFn } from '@/backend/shared/bookings';

export function getUpcomingDates(allowedDaysOfWeek: number[]) {
  const dates = [];
  const d = new Date();
  const currentMonth = d.getMonth();
  d.setDate(d.getDate() + 1);
  while (d.getMonth() === currentMonth) {
    if (allowedDaysOfWeek.includes(d.getDay())) {
      dates.push(new Date(d));
    }
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

function generateUUID() {
  if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function Hero({
  lang,
  t,
  tripOptions = [],
  activeTripId,
}: {
  lang: "en" | "mr";
  t: typeof translations.mr;
  tripOptions?: any[];
  activeTripId?: string;
}) {
  const [selectedTrip, setSelectedTrip] = useState<string>(tripOptions[0]?._id || "custom");
  const [persons, setPersons] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter") {
      const target = e.target as HTMLElement;
      if (
        (target.tagName === "INPUT" && (target as HTMLInputElement).type !== "button" && (target as HTMLInputElement).type !== "submit") ||
        target.tagName === "SELECT"
      ) {
        const form = e.currentTarget;
        const inputs = Array.from(
          form.querySelectorAll("input:not([type='hidden']):not([disabled]), select:not([disabled])")
        ) as HTMLElement[];
        
        const index = inputs.indexOf(target);
        if (index > -1 && index < inputs.length - 1) {
          e.preventDefault();
          inputs[index + 1].focus();
        }
      }
    }
  };

  useEffect(() => {
    if (activeTripId) {
      setSelectedTrip(activeTripId);
    }
  }, [activeTripId]);

  const selectedTripData = tripOptions.find((t) => t._id === selectedTrip);

  const isUpcomingDate = (dateStr: string): boolean => {
    if (typeof dateStr !== "string") return false;
    
    const cleanStr = dateStr.trim();
    
    // Extract year from string if present, otherwise default to current year
    const yearMatch = cleanStr.match(/\b(\d{4})\b/);
    const year = yearMatch ? yearMatch[1] : String(new Date().getFullYear());
    
    // Parse start date from range if it's a range
    const startPart = cleanStr.split(/\s+to\s+/i)[0].trim();
    
    // Clean startPart: remove day names (Sun, Mon, etc.) to help parser
    const cleanStart = startPart.replace(/^(Sun|Mon|Tue|Wed|Thu|Fri|Sat)\.?\s+/i, "").trim();
    
    // If the cleanStart doesn't end with a year, append the extracted year
    const finalParseString = /\b\d{4}\b/.test(cleanStart) 
      ? cleanStart 
      : `${cleanStart} ${year}`;
      
    const parsedDate = new Date(finalParseString);
    
    if (!isNaN(parsedDate.getTime())) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      return parsedDate >= now;
    }
    
    return true;
  };

  const validDates = Array.isArray(selectedTripData?.dates)
    ? selectedTripData.dates.filter(isUpcomingDate)
    : [];

  return (
    <section className="relative w-full overflow-hidden bg-brand-mist flex flex-col justify-start pt-[104px] pb-5 lg:pt-[136px]">
      {/* Background split */}
      <div className="absolute inset-0">
        {/* image right */}
        <div className="absolute inset-y-0 right-0 w-full lg:w-[60%] overflow-hidden">
          {/* Mobile background */}
          <img
            src={bgMobile}
            alt="Pandharpur temple ghats at golden sunrise"
            className="block lg:hidden h-full w-full object-cover object-center animate-hero-zoom"
            fetchPriority="high"
          />
          {/* Desktop background */}
          <img
            src={temple}
            alt="Pandharpur temple ghats at golden sunrise"
            className="hidden lg:block h-full w-full object-cover object-center animate-hero-zoom"
            fetchPriority="high"
          />
          {/* white fade for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-white/40 to-transparent lg:bg-gradient-to-r lg:from-white lg:via-white/40 lg:to-transparent" />
          {/* bottom soft fade */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-brand-mist to-transparent" />
        </div>
        {/* left soft surface */}
        <div className="absolute inset-y-0 left-0 hidden lg:block w-[55%] bg-gradient-to-r from-brand-mist via-white to-transparent" />
      </div>

      {/* Floating leaves */}
      <span
        className="absolute left-[75%] top-[12%] animate-float-leaf lg:left-[42%] lg:top-[18%] opacity-80 blur-[1px]"
        style={{ animationDuration: "8s", animationDelay: "0s" }}
      >
        <Leaf className="h-4 w-4 text-brand-green/80 lg:h-6 lg:w-6 fill-current" />
      </span>
      <span
        className="absolute right-[8%] top-[25%] animate-float-leaf lg:right-[12%] lg:top-[14%] opacity-60 blur-[1.5px]"
        style={{ animationDuration: "12s", animationDelay: "3s" }}
      >
        <Leaf className="h-3 w-3 text-brand-green-dark/70 lg:h-5 lg:w-5 fill-current" />
      </span>
      <span
        className="absolute left-[15%] top-[38%] animate-float-leaf lg:left-auto lg:right-[28%] lg:top-[42%] opacity-90 blur-[0.5px]"
        style={{ animationDuration: "10s", animationDelay: "1.5s" }}
      >
        <Leaf className="h-5 w-5 text-brand-green/90 lg:h-7 lg:w-7 fill-current" />
      </span>

      {/* Content */}
      <div className="relative z-20 mx-auto w-full max-w-[1600px] grid grid-cols-1 gap-10 px-4 md:px-6 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-7 animate-reveal">
          <p className="flex items-center gap-2 md:gap-3 text-[13px] md:text-[15px] font-bold tracking-[0.1em] sm:tracking-[0.2em] md:tracking-[0.32em] text-brand-green-dark">
            <span className="h-px w-4 sm:w-6 bg-brand-green md:w-8 shrink-0" />
            <span className="whitespace-nowrap">{t.explore}</span>
            <span className="h-px w-4 sm:w-6 bg-brand-green md:w-8 shrink-0" />
          </p>

          <h1
            className="mt-4 text-[38px] sm:text-[42px] font-bold leading-[1.1] text-brand-blue-deep md:mt-4 md:text-[52px] lg:text-[56px] md:leading-[1.15]"
            style={lang === "mr" ? { fontFamily: "'Tiro Devanagari Marathi', serif" } : {}}
          >
            <span className="whitespace-nowrap">
              {lang === "mr" ? "श्रद्धेपासून" : "From Devotion to"}
            </span>
            <br />
            <span className="text-brand-green-dark">
              {lang === "mr" ? "समाधानापर्यंत" : "Satisfaction"}
            </span>
          </h1>

          <p className="mt-4 max-w-[550px] text-[15px] leading-relaxed text-slate-600 md:mt-4 md:text-[16px]">
            {highlightBrandName(t.heroDesc)}
          </p>

          <div
            className="mt-6 md:mt-8 w-full max-w-[800px] animate-reveal rounded-2xl bg-white/75 p-4 shadow-lg backdrop-blur-md lg:p-5"
            style={{ animationDelay: "0.2s" }}
          >
            <p className="text-[15px] font-bold text-brand-blue-deep md:text-[17px]">
              {highlightBrandName(t.heroHighlight)}
            </p>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:mt-5 md:gap-4">
              <div className="flex items-center gap-3 text-brand-blue-deep">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-green text-white shadow-md">
                  <Snowflake className="h-[18px] w-[18px]" />
                </div>
                <span className="text-[13px] font-bold md:text-[15px]">{t.feat1}</span>
              </div>
              <div className="flex items-center gap-3 text-brand-blue-deep">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-green text-white shadow-md">
                  <Users className="h-[18px] w-[18px]" />
                </div>
                <span className="text-[13px] font-bold md:text-[15px]">{t.feat2}</span>
              </div>
              <div className="flex items-center gap-3 text-brand-blue-deep">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-green text-white shadow-md">
                  <BedDouble className="h-[18px] w-[18px]" />
                </div>
                <span className="text-[13px] font-bold md:text-[15px]">{t.feat3}</span>
              </div>
              <div className="flex items-center gap-3 text-brand-blue-deep">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-green text-white shadow-md">
                  <Compass className="h-[18px] w-[18px]" />
                </div>
                <span className="text-[13px] font-bold md:text-[15px]">{t.feat4}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating booking panel */}
      <div
        id="homepage-booking-form"
        className="relative z-30 mx-auto w-full max-w-[1600px] px-4 mt-5 md:px-6 lg:px-8"
      >
        <div
          className="rounded-3xl bg-white p-4 animate-reveal"
          style={{ boxShadow: "var(--shadow-luxury)", animationDelay: "0.4s" }}
        >
          {success ? (
            <div className="flex flex-col items-center justify-center p-8 bg-brand-green/5 rounded-2xl border border-brand-green/20">
              <div className="w-16 h-16 bg-brand-green/10 text-brand-green rounded-full flex items-center justify-center mb-4">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-brand-blue-deep mb-2">Booking Received!</h3>
              <p className="text-slate-600 text-center mb-6 max-w-sm">
                Thank you for choosing Shailraj. We have received your booking request and will
                contact you shortly to confirm the details.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="px-6 py-2 bg-brand-blue-deep text-white rounded-xl font-bold"
              >
                Make Another Booking
              </button>
            </div>
          ) : (
            <form
              suppressHydrationWarning
              onKeyDown={handleFormKeyDown}
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data = Object.fromEntries(formData.entries());

                // Add specific logic for trips
                if (selectedTripData) {
                  data.tripName = selectedTripData.name;
                } else if (selectedTrip === "custom") {
                  data.tripName = "custom";
                }

                data.idempotencyKey = generateUUID();

                setLoading(true);
                try {
                  await createBookingFn({ data });
                  setSuccess(true);
                  (e.target as HTMLFormElement).reset();
                } catch (err: any) {
                  alert(err.message || "Failed to submit booking. Please try again.");
                } finally {
                  setLoading(false);
                }
              }}
              className="grid grid-cols-1 gap-3 md:grid-cols-3"
            >
              <FieldBox icon={<User className="h-5 w-5" />} label={t.formName}>
                <input
                  suppressHydrationWarning
                  type="text"
                  name="name"
                  id="hero-name"
                  autoComplete="name"
                  required
                  placeholder={t.formNamePlace}
                  className="w-full bg-transparent text-[15px] font-semibold text-brand-blue-deep placeholder:text-slate-400 placeholder:font-medium focus:outline-none"
                />
              </FieldBox>

              <FieldBox icon={<Phone className="h-5 w-5" />} label={t.formContact}>
                <input
                  suppressHydrationWarning
                  type="tel"
                  name="phone"
                  id="hero-phone"
                  autoComplete="tel"
                  required
                  placeholder="+91 00000 00000"
                  className="w-full bg-transparent text-[15px] font-semibold text-brand-blue-deep placeholder:text-slate-400 placeholder:font-medium focus:outline-none"
                />
              </FieldBox>

              <FieldBox icon={<MapPin className="h-5 w-5" />} label={t.formTrip}>
                <div className="relative flex items-center w-full">
                  <select
                    suppressHydrationWarning
                    name="trip"
                    id="hero-trip"
                    autoComplete="off"
                    className="w-full appearance-none bg-transparent text-[15px] font-semibold text-brand-blue-deep focus:outline-none cursor-pointer"
                    value={selectedTrip}
                    onChange={(e) => setSelectedTrip(e.target.value)}
                  >
                    {tripOptions.map((trip) => (
                      <option key={trip._id} value={trip._id}>
                        {trip.name}
                      </option>
                    ))}
                    <option value="custom">{t.tripCustom}</option>
                  </select>
                  <ChevronDown className="absolute right-0 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </FieldBox>

              {selectedTrip === "custom" && (
                <FieldBox icon={<MapPin className="h-5 w-5" />} label={t.formCustom}>
                  <input
                    suppressHydrationWarning
                    type="text"
                    name="customDestination"
                    id="hero-custom-destination"
                    autoComplete="off"
                    required
                    placeholder={t.formCustomPlace}
                    className="w-full bg-transparent text-[15px] font-semibold text-brand-blue-deep placeholder:text-slate-400 placeholder:font-medium focus:outline-none"
                  />
                </FieldBox>
              )}

              <FieldBox icon={<Users className="h-5 w-5" />} label={t.formPersons}>
                <div className="flex items-center justify-between w-full h-full">
                  <input suppressHydrationWarning id="hero-persons" type="hidden" name="persons" value={persons} />
                  <button
                    suppressHydrationWarning
                    type="button"
                    onClick={() => setPersons((p) => Math.max(1, p - 1))}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-[15px] font-semibold text-brand-blue-deep">
                    {persons} {persons === 1 ? t.formPerson : t.formPersonsPlural}
                  </span>
                  <button
                    suppressHydrationWarning
                    type="button"
                    onClick={() => setPersons((p) => Math.min(16, p + 1))}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-green/10 text-brand-green-dark hover:bg-brand-green/20 transition"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </FieldBox>

              <FieldBox icon={<Calendar className="h-5 w-5" />} label={t.formDate}>
                {validDates && validDates.length > 0 ? (
                  <div className="relative flex items-center w-full">
                    <select
                      suppressHydrationWarning
                      name="travelDate"
                      id="hero-travel-date"
                      autoComplete="off"
                      required
                      className="w-full appearance-none bg-transparent text-[14px] md:text-[15px] font-semibold text-brand-blue-deep focus:outline-none cursor-pointer"
                    >
                      <option value="">Select a date</option>
                      {validDates.map((date: string) => (
                        <option key={date} value={date}>
                          {date}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-0 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                ) : (
                  <input
                    suppressHydrationWarning
                    type="datetime-local"
                    name="travelDate"
                    id="hero-travel-date"
                    autoComplete="off"
                    required
                    className="w-full bg-transparent text-[14px] md:text-[15px] font-semibold text-brand-blue-deep focus:outline-none cursor-pointer"
                  />
                )}
              </FieldBox>

              <button
                suppressHydrationWarning
                type="submit"
                disabled={loading}
                className={`btn-cta flex h-[70px] items-center justify-center gap-2.5 rounded-2xl px-8 text-base font-semibold ${selectedTrip === "custom" ? "md:col-span-3" : ""} disabled:opacity-70`}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Search className="h-5 w-5" />
                )}
                {t.formBook}
              </button>
            </form>
          )}

          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-sm md:grid-cols-4">
            <TrustBadge icon={<BadgeIndianRupee className="h-4 w-4" />} label={t.bestPrice} />
            <TrustBadge icon={<ShieldCheck className="h-4 w-4" />} label={t.trusted} />
            <TrustBadge icon={<Headphones className="h-4 w-4" />} label={t.support} />
            <TrustBadge icon={<Lock className="h-4 w-4" />} label={t.secure} />
          </div>
        </div>
      </div>
    </section>
  );
}

function FieldBox({
  icon,
  label,
  placeholder,
  value,
  chevron,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  placeholder?: string;
  value?: string;
  chevron?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 h-[70px] transition focus-within:border-brand-blue focus-within:ring-2 focus-within:ring-brand-blue/15">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-mist text-brand-blue">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </div>
        {children ? (
          children
        ) : value ? (
          <div className="flex items-center justify-between text-[15px] font-semibold text-brand-blue-deep">
            {value}
            {chevron && <ChevronDown className="h-4 w-4 text-slate-400" />}
          </div>
        ) : (
          <input
            placeholder={placeholder}
            className="w-full bg-transparent text-[15px] font-medium text-brand-blue-deep placeholder:text-slate-400 focus:outline-none"
          />
        )}
      </div>
    </div>
  );
}

function TrustBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2.5 text-slate-700">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-green/10 text-brand-green-dark">
        {icon}
      </span>
      <span className="text-[13px] font-medium">{label}</span>
    </div>
  );
}
