import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Phone,
  MapPin,
  Users,
  Calendar,
  Minus,
  Plus,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { TourData } from '@/frontend/features/tours/TourCard';
import { createBookingFn } from '@/backend/shared/bookings';

interface BookingModalProps {
  tour: TourData;
  onClose: () => void;
  t: any;
  lang: "en" | "mr";
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

export function BookingModal({ tour, onClose, t, lang }: BookingModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [persons, setPersons] = useState(1);
  const [travelDate, setTravelDate] = useState("");
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

  // Prevent background scrolling when open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

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

  // Extract valid dates if present
  const validDates = Array.isArray(tour.dates) ? tour.dates.filter(isUpcomingDate) : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const bookingData = {
        name: name.trim(),
        phone: phone.trim(),
        pickupLocation: pickupLocation.trim(),
        tripName: tour.title,
        persons: Number(persons),
        travelDate: travelDate,
        idempotencyKey: generateUUID(),
      };

      await createBookingFn({ data: bookingData });
      setSuccess(true);
    } catch (err: any) {
      alert(err.message || "Failed to submit booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 sm:p-6 bg-[#112233]/45 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-[500px] max-h-[95vh] bg-white rounded-[28px] sm:rounded-[36px] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-250">
        {/* Header */}
        <div className="flex justify-between items-start p-6 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-[#112233] font-bold text-2xl leading-tight">
              {t.bookingModalTitle || "Book Seat"}
            </h3>
            <p className="text-slate-500 text-xs mt-1 font-medium">
              {t.bookingModalDesc || `Reserving seats for ${tour.title}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 -mt-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6">
          {success ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6 animate-bounce">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-[#112233] mb-3">
                {t.bookingModalSuccessTitle || "Booking Received!"}
              </h3>
              <p className="text-slate-600 text-sm max-w-sm mb-8 leading-relaxed">
                {t.bookingModalSuccessDesc ||
                  "We have received your booking request for this tour and will contact you shortly to confirm the details."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
                <button 
                  onClick={() => {
                    setSuccess(false);
                    setName("");
                    setPhone("");
                    setPickupLocation("");
                    setTravelDate("");
                    setPersons(1);
                  }}
                  className="px-6 py-3 bg-[#F59E0B] hover:bg-[#E5910A] text-[#112233] font-bold rounded-xl transition-all shadow-md cursor-pointer"
                >
                  {lang === "mr" ? "दुसरी बुकिंग करा" : "Book Another Trip"}
                </button>
                <button 
                  onClick={onClose}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all border border-slate-200/50 cursor-pointer"
                >
                  {lang === "mr" ? "बंद करा" : "Close"}
                </button>
              </div>
            </div>
          ) : (
            <form
              onKeyDown={handleFormKeyDown}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {/* Full Name */}
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  {t.formName || "Full Name"} <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 h-[56px] transition focus-within:border-[#F59E0B] focus-within:ring-2 focus-within:ring-[#F59E0B]/15">
                  <User className="h-5 w-5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    name="name"
                    id="booking-name"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.formNamePlace || "Enter your name"}
                    className="w-full bg-transparent text-[15px] font-semibold text-brand-blue-deep placeholder:text-slate-400 placeholder:font-medium focus:outline-none"
                  />
                </div>
              </div>

              {/* Contact Number */}
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  {t.formContact || "Contact Number"} <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 h-[56px] transition focus-within:border-[#F59E0B] focus-within:ring-2 focus-within:ring-[#F59E0B]/15">
                  <Phone className="h-5 w-5 text-slate-400 shrink-0" />
                  <input
                    type="tel"
                    name="phone"
                    id="booking-phone"
                    autoComplete="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 00000 00000"
                    className="w-full bg-transparent text-[15px] font-semibold text-brand-blue-deep placeholder:text-slate-400 placeholder:font-medium focus:outline-none"
                  />
                </div>
              </div>

              {/* Pickup Location */}
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  {t.formPickupLocation || "Pickup Location"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 h-[56px] transition focus-within:border-[#F59E0B] focus-within:ring-2 focus-within:ring-[#F59E0B]/15">
                  <MapPin className="h-5 w-5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    name="pickupLocation"
                    id="booking-pickup"
                    autoComplete="street-address"
                    required
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    placeholder={t.formPickupLocationPlace || "Enter pickup point / address"}
                    className="w-full bg-transparent text-[15px] font-semibold text-brand-blue-deep placeholder:text-slate-400 placeholder:font-medium focus:outline-none"
                  />
                </div>
              </div>

              {/* Persons counter */}
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  {t.formPersons || "Persons"}
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 h-[56px] transition focus-within:border-[#F59E0B] focus-within:ring-2 focus-within:ring-[#F59E0B]/15">
                  <Users className="h-5 w-5 text-slate-400 shrink-0" />
                  <div className="flex items-center justify-between flex-grow">
                    <button
                      type="button"
                      onClick={() => setPersons((p) => Math.max(1, p - 1))}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition cursor-pointer"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="text-[15px] font-semibold text-brand-blue-deep">
                      {persons}{" "}
                      {persons === 1 ? t.formPerson || "Person" : t.formPersonsPlural || "Persons"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPersons((p) => Math.min(16, p + 1))}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-[#F59E0B] hover:bg-amber-100 transition cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Date selector */}
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  {t.formDate || "Travel Date"} <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 h-[56px] transition focus-within:border-[#F59E0B] focus-within:ring-2 focus-within:ring-[#F59E0B]/15">
                  <Calendar className="h-5 w-5 text-slate-400 shrink-0" />
                  <div className="relative flex items-center w-full">
                    {validDates.length > 0 ? (
                      <select
                        name="travelDate"
                        id="booking-travel-date"
                        autoComplete="off"
                        required
                        value={travelDate}
                        onChange={(e) => setTravelDate(e.target.value)}
                        className="w-full appearance-none bg-transparent text-[15px] font-semibold text-[#112233] focus:outline-none cursor-pointer pr-6"
                      >
                        <option value="">{t.tourSelectDate || "Select a date"}</option>
                        {validDates.map((date: string) => (
                          <option key={date} value={date}>
                            {date}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="date"
                        name="travelDate"
                        id="booking-travel-date"
                        autoComplete="off"
                        required
                        value={travelDate}
                        onChange={(e) => setTravelDate(e.target.value)}
                        className="w-full bg-transparent text-[15px] font-semibold text-[#112233] focus:outline-none cursor-pointer"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-6 bg-[#F59E0B] hover:bg-[#E5910A] text-[#112233] font-bold text-base rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {lang === "mr" ? "पाठवत आहे..." : "Submitting..."}
                  </>
                ) : (
                  <>{t.formBook || "Book Now"}</>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
