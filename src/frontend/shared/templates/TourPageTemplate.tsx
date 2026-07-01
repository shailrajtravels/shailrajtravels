import React, { useState } from 'react';
import { SEOBreadcrumbs, type BreadcrumbItem } from '@/frontend/shared/components/SEOBreadcrumbs';
import { SchemaMarkup } from '@/frontend/shared/components/SchemaMarkup';
import { generateProductSchema } from '@/backend/shared/schema-generators';
import { Tour } from '@/frontend/shared/types/tour';
import { RelatedTours } from '@/frontend/shared/components/RelatedTours';
import { RelatedBlogs } from '@/frontend/shared/components/RelatedBlogs';
import { useLanguage } from '@/routes/__root';
import { translations } from '@/frontend/core/i18n';
import { createBookingFn } from '@/backend/shared/bookings';
import { LazyImage } from '@/frontend/shared/ui/lazy-image';
import { CheckCircle2 } from 'lucide-react';

const RECOMMENDED_VEHICLES = [
  {
    id: "swift-dzire",
    name: "Swift Dzire",
    capacityStr: "1–4 Travelers",
    minCap: 1,
    maxCap: 4,
    description: "Perfect for couples and small families.",
    amenities: ["Air Conditioning", "Comfortable Seating", "Driver Included", "Luggage Space", "Fuel Included", "Toll Included", "Parking Included"],
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "ertiga",
    name: "Ertiga",
    capacityStr: "5–7 Travelers",
    minCap: 5,
    maxCap: 7,
    description: "Best for medium-sized families.",
    amenities: ["Air Conditioning", "Spacious Cabin", "Driver Included", "Large Luggage Capacity", "Fuel Included", "Toll Included", "Parking Included"],
    image: "https://images.unsplash.com/photo-1513681414995-777174eec705?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "innova-crysta",
    name: "Innova Crysta",
    capacityStr: "5–7 Travelers",
    minCap: 5,
    maxCap: 7,
    badge: "Premium Choice",
    description: "Luxury travel experience with extra comfort.",
    amenities: ["Premium Seats", "Air Conditioning", "Driver Included", "Large Luggage Space", "Fuel Included", "Toll Included", "Parking Included"],
    image: "https://images.unsplash.com/photo-1605810736025-0d3210438ec3?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "urbania-12",
    name: "Urbania 12 Seater",
    capacityStr: "8–12 Travelers",
    minCap: 8,
    maxCap: 12,
    description: "Ideal for group tours and pilgrimages.",
    amenities: ["Pushback Seats", "Air Conditioning", "Driver Included", "Extra Luggage", "Fuel Included", "Toll Included", "Parking Included"],
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "urbania-16",
    name: "Urbania 16 Seater",
    capacityStr: "13–16 Travelers",
    minCap: 13,
    maxCap: 16,
    description: "Perfect for large groups.",
    amenities: ["Premium Interior", "Air Conditioning", "Pushback Seats", "Driver Included", "Large Storage", "Fuel Included", "Toll Included", "Parking Included"],
    image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=600&q=80",
  },
];

interface TourPageTemplateProps {
  data: Tour;
}

export function TourPageTemplate({ data }: TourPageTemplateProps) {
  const { lang } = useLanguage();
  const t = translations[lang];

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [persons, setPersons] = useState(1);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [travelDate, setTravelDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [showTrust, setShowTrust] = useState(false);
  const [showHighlights, setShowHighlights] = useState(false);
  const [isOverviewExpanded, setIsOverviewExpanded] = useState(false);

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

  const breadcrumbs: BreadcrumbItem[] = [
    { name: t.breadcrumbTours || "Tours", url: "/tours" },
    { name: data.title, url: `/tours/${data.slug}` },
  ];

  const isUpcomingDate = (dateStr: string) => {
    if (typeof dateStr !== "string") return false;
    const match = dateStr.match(/(\d+)\s+([a-zA-Z]+)(?:\s+(\d{4}))?/);
    if (!match) return true;
    const now = new Date();
    const year = match[3] || now.getFullYear();
    const parsedDate = new Date(`${match[1]} ${match[2]} ${year}`);
    if (isNaN(parsedDate.getTime())) return true;
    now.setHours(0, 0, 0, 0);
    return parsedDate >= now;
  };

  const validDates = Array.isArray(data.dates) ? data.dates.filter(isUpcomingDate) : [];

  return (
    <main className="w-full bg-white">
      <SchemaMarkup schema={data.schemaData} />

      {/* Hero Section */}
      <section className="relative w-full flex flex-col md:block md:h-[60vh] md:min-h-[450px] overflow-hidden bg-slate-900">
        {/* Image Area */}
        <div className="relative w-full md:absolute md:inset-0 md:h-full z-0 flex flex-col items-center justify-center">
          {/* Desktop blurred background */}
          <LazyImage
            src={data.heroContent.image}
            alt={data.title}
    className="hidden md:block absolute inset-0 w-full h-full object-cover blur-2xl opacity-50 scale-110"
    loading="eager"
  />

  {/* Mobile Image */ }
          <LazyImage
            src={data.heroContent.mobileImage || data.heroContent.image}
            alt={data.title}
    className="block md:hidden w-full h-auto object-contain relative z-10"
    loading="eager"
  />

  {/* Desktop Main Image */ }
          <LazyImage
            src={data.heroContent.image}
            alt={data.title}
    className="hidden md:block w-full h-full object-contain relative z-10"
    loading="eager"
  />

  {/* Desktop Overlay only */ }
  <div className="hidden md:block absolute inset-0 bg-black/60 z-20" />
        </div >

    {/* Text Content Area */ }
    < div className = "relative z-30 text-center px-4 py-8 md:py-0 md:absolute md:inset-0 md:flex md:flex-col md:items-center md:justify-center max-w-4xl mx-auto w-full" >
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 md:mb-6 drop-shadow-md">
            {data.title}
          </h1>
          <p className="hidden md:block text-base md:text-xl text-slate-200 mb-6 md:mb-8 max-w-2xl mx-auto drop-shadow-sm">
            {data.heroContent.description}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <button
              className="w-full sm:w-auto px-8 py-3 bg-brand-orange text-white font-semibold rounded-lg hover:bg-brand-orange-dark transition-colors"
              onClick={() => {
                window.dataLayer?.push({ event: "book_now_hero", tour: data.title });
                document
                  .getElementById("sidebar-booking-form")
                  ?.scrollIntoView({ behavior: "smooth" });
                setTimeout(() => {
                  const input = document.getElementById("booking-name-input");
                  if (input) (input as HTMLElement).focus();
                }, 500);
              }}
            >
              {t.formBook || "Book Now"}
            </button>
            <a
              href="tel:+918600396056"
              className="w-full sm:w-auto text-center px-8 py-3 bg-white/10 text-white font-semibold rounded-lg border border-white md:border-white/50 hover:bg-white hover:text-brand-blue-deep transition-colors backdrop-blur-sm"
              onClick={() => window.dataLayer?.push({ event: "call_now_hero", tour: data.title })}
            >
              {t.callNow || "Call Now"}
            </a>
          </div>
        </div >
      </section >

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <SEOBreadcrumbs items={breadcrumbs} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-12 mt-6">
        <div className="lg:col-span-2 space-y-8">
          {/* Overview Section */}
          <section>
            <h2 className="text-3xl font-bold text-brand-blue-deep mb-6">
              {t.tourOverview || "Overview"}
            </h2>
            <div className={`relative ${!isOverviewExpanded ? "max-h-[300px] overflow-hidden" : ""}`}>
              <div
                className="prose max-w-none text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: data.overview }}
              />
              {!isOverviewExpanded && (
                <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />
              )}
            </div>
            <button
              onClick={() => setIsOverviewExpanded(!isOverviewExpanded)}
              className="mt-4 text-brand-orange font-bold text-sm hover:text-brand-orange-dark transition-colors flex items-center"
            >
              {isOverviewExpanded ? "Read Less" : "Read More"}
              <svg
                className={`ml-1.5 w-4 h-4 transition-transform duration-300 ${isOverviewExpanded ? "rotate-180" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </section>

          {/* Highlights Section */}
          <section className="pt-4">
            <button 
              onClick={() => setShowHighlights(!showHighlights)}
              className="w-full flex items-center justify-between text-left group"
            >
              <h2 className="text-3xl font-bold text-brand-blue-deep group-hover:text-brand-orange transition-colors">
                {t.tourHighlights || "Tour Highlights"}
              </h2>
              <svg 
                className={`w-6 h-6 text-brand-blue-deep transition-transform duration-300 ${showHighlights ? "rotate-180" : ""}`} 
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showHighlights && (
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-6">
                {data.highlights.map((highlight, idx) => (
                  <li key={idx} className="pl-1">
                    {highlight}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Recommended Vehicles Section */}
          <section className="pt-4">
            <h2 className="text-3xl font-bold text-brand-blue-deep mb-2">
              Recommended Vehicle for Your Group
            </h2>
            <p className="text-gray-600 mb-8">
              Choose your group size and we'll recommend the perfect vehicle for a comfortable journey.
            </p>

            {/* Smart Traveler Selector */}
            <div className="bg-brand-blue-deep/5 p-6 rounded-2xl mb-8 border border-brand-blue-deep/10">
              <label className="block text-lg font-bold text-brand-blue-deep mb-3">
                How many travelers are joining?
              </label>
              <select
                className="w-full md:w-1/2 px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none text-slate-800 text-lg shadow-sm"
                value={persons}
                onChange={(e) => {
                  const num = Number(e.target.value);
                  setPersons(num);
                  // Find best vehicle
                  const best = RECOMMENDED_VEHICLES.find(v => num >= v.minCap && num <= v.maxCap) || RECOMMENDED_VEHICLES[0];
                  setSelectedVehicle(best.name);
                  // Scroll slightly to let them see it
                  setTimeout(() => {
                    document.getElementById(`vehicle-${best.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }, 100);
                }}
              >
                <option value={1}>1–4 Travelers</option>
                <option value={5}>5–7 Travelers</option>
                <option value={8}>8–12 Travelers</option>
                <option value={13}>13–16 Travelers</option>
              </select>
            </div>

            <div className="flex overflow-x-auto pb-6 -mx-4 px-4 snap-x snap-mandatory gap-6 md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible md:mx-0 md:px-0 scrollbar-hide">
              {RECOMMENDED_VEHICLES.map((vehicle) => {
                const isRecommended = persons >= vehicle.minCap && persons <= vehicle.maxCap;
                return (
                  <div
                    key={vehicle.id}
                    id={`vehicle-${vehicle.id}`}
                    className="group min-w-[85vw] sm:min-w-[300px] snap-center shrink-0 md:min-w-0 md:shrink relative border rounded-2xl overflow-hidden bg-white flex flex-col transition-all duration-300 border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-brand-blue/30"
                  >
                    <div className="relative h-40 w-full bg-gray-100 overflow-hidden">
                      <LazyImage
                        src={vehicle.image}
                        alt={vehicle.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      {vehicle.badge && (
                        <div className="absolute top-4 left-4 bg-gray-900/90 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full z-10">
                          {vehicle.badge}
                        </div>
                      )}
                      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur text-brand-blue-deep text-xs font-bold px-3 py-1 rounded-full shadow-sm z-10">
                        {vehicle.capacityStr}
                      </div>
                    </div>
                    
                    <div className="p-4 flex flex-col flex-grow">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{vehicle.name}</h3>
                      <p className="text-gray-600 text-sm mb-4 flex-grow">{vehicle.description}</p>
                      
                      <div className="space-y-1.5 mb-5">
                        {vehicle.amenities.map((amenity, i) => (
                          <div key={i} className="flex items-start text-sm text-gray-700">
                            <CheckCircle2 className="w-4 h-4 text-brand-green mr-2 mt-0.5 shrink-0" />
                            <span>{amenity}</span>
                          </div>
                        ))}
                      </div>
                      
                      <button
                        className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                          selectedVehicle === vehicle.name
                            ? 'bg-brand-blue-deep text-white shadow-md'
                            : 'border-2 border-brand-blue-deep text-brand-blue-deep hover:bg-brand-blue-deep hover:text-white'
                        }`}
                        onClick={() => {
                          setSelectedVehicle(vehicle.name);
                          setPersons(vehicle.maxCap);
                          window.dataLayer?.push({
                            event: "inquire_vehicle",
                            tour: data.title,
                            vehicle: vehicle.name,
                          });
                          document
                            .getElementById("sidebar-booking-form")
                            ?.scrollIntoView({ behavior: "smooth" });
                          setTimeout(() => {
                            const input = document.getElementById("booking-name-input");
                            if (input) (input as HTMLElement).focus();
                          }, 500);
                        }}
                      >
                        {selectedVehicle === vehicle.name ? 'Selected' : 'Choose Vehicle'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Vehicle Comparison Table */}
          <section>
            <button 
              onClick={() => setShowCompare(!showCompare)}
              className="w-full flex items-center justify-between text-left group"
            >
              <h3 className="text-2xl font-bold text-brand-blue-deep group-hover:text-brand-orange transition-colors">Compare Vehicles</h3>
              <svg 
                className={`w-6 h-6 text-brand-blue-deep transition-transform duration-300 ${showCompare ? "rotate-180" : ""}`} 
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showCompare && (
              <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm mt-6">
                <table className="w-full text-left border-collapse bg-white whitespace-nowrap">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
                      <th className="p-4 font-semibold">Vehicle</th>
                      <th className="p-4 font-semibold">Capacity</th>
                      <th className="p-4 font-semibold">Comfort</th>
                      <th className="p-4 font-semibold">Luggage</th>
                      <th className="p-4 font-semibold">Best For</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm text-gray-800">
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium">Swift Dzire</td>
                      <td className="p-4">1–4</td>
                      <td className="p-4 text-brand-orange">★★★★☆</td>
                      <td className="p-4">Medium</td>
                      <td className="p-4">Couples</td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium">Ertiga</td>
                      <td className="p-4">5–7</td>
                      <td className="p-4 text-brand-orange">★★★★☆</td>
                      <td className="p-4">Large</td>
                      <td className="p-4">Families</td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium">Innova Crysta</td>
                      <td className="p-4">5–7</td>
                      <td className="p-4 text-brand-orange">★★★★★</td>
                      <td className="p-4">Large</td>
                      <td className="p-4">Premium Family Tours</td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium">Urbania 12</td>
                      <td className="p-4">8–12</td>
                      <td className="p-4 text-brand-orange">★★★★★</td>
                      <td className="p-4">Extra Large</td>
                      <td className="p-4">Group Tours</td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium">Urbania 16</td>
                      <td className="p-4">13–16</td>
                      <td className="p-4 text-brand-orange">★★★★★</td>
                      <td className="p-4">Extra Large</td>
                      <td className="p-4">Large Groups</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Trust Section */}
          <section>
            <button 
              onClick={() => setShowTrust(!showTrust)}
              className="w-full flex items-center justify-between text-left group"
            >
              <h3 className="text-2xl font-bold text-brand-blue-deep group-hover:text-brand-orange transition-colors">Why Our Vehicles?</h3>
              <svg 
                className={`w-6 h-6 text-brand-blue-deep transition-transform duration-300 ${showTrust ? "rotate-180" : ""}`} 
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showTrust && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                {[
                  "Professional Drivers", "Sanitized Before Every Trip", "GPS Enabled",
                  "24×7 Roadside Support", "Comfortable Long-Distance Travel", "Well Maintained Fleet"
                ].map((trust, idx) => (
                  <div key={idx} className="flex items-center space-x-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="bg-brand-green/10 p-2 rounded-full text-brand-green shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium text-gray-800">{trust}</span>
                  </div>
                ))}
              </div>
            )}
          </section>


          {/* Internal Linking Components */}
          <RelatedTours tours={data.relatedTours} />
          <RelatedBlogs blogs={data.relatedBlogs} />
        </div>

        <div className="lg:col-span-1">
          {/* Sidebar Booking Form */}
          <div
            id="sidebar-booking-form"
            className="sticky top-24 bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm"
          >
            {success ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 bg-brand-green/5 rounded-2xl border border-brand-green/20 text-center">
                <div className="w-12 h-12 bg-brand-green/10 text-brand-green rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-brand-green-dark"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-brand-blue-deep mb-2">
                  {lang === "mr" ? "बुकिंग प्राप्त झाले!" : "Booking Received!"}
                </h3>
                <p className="text-slate-600 text-sm mb-6 max-w-sm">
                  {lang === "mr"
                    ? "आम्हाला तुमची बुकिंग विनंती मिळाली आहे. आम्ही लवकरच तुमच्याशी संपर्क साधू."
                    : "We have received your booking request and will contact you shortly to confirm."}
                </p>
                <button
                  onClick={() => {
                    setSuccess(false);
                    setName("");
                    setPhone("");
                    setTravelDate("");
                    setPersons(1);
                  }}
                  className="px-6 py-2 bg-brand-blue-deep text-white text-sm rounded-xl font-bold hover:bg-brand-blue transition-colors cursor-pointer"
                >
                  {lang === "mr" ? "नवीन बुकिंग करा" : "Make Another Booking"}
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {t.tourCustomQuote || "Request a Custom Quote"}
                </h3>
                {selectedVehicle && (
                  <div className="mb-6 bg-brand-orange/10 border border-brand-orange/20 px-4 py-3 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs text-brand-orange-dark font-bold uppercase tracking-wider mb-0.5">Selected Vehicle</p>
                      <p className="text-sm font-bold text-gray-900">{selectedVehicle}</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setSelectedVehicle("")}
                      className="text-xs text-gray-500 hover:text-gray-700 underline"
                    >
                      Clear
                    </button>
                  </div>
                )}
                <form
                  onKeyDown={handleFormKeyDown}
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setLoading(true);
                    try {
                      const bookingData = {
                        name: name.trim(),
                        phone: phone.trim(),
                        tripName: data.title,
                        persons,
                        travelDate,
                        vehicle: selectedVehicle || "Not specified",
                      };
                      await createBookingFn({ data: bookingData });
                      setSuccess(true);
                    } catch (err: any) {
                      alert(err.message || "Failed to submit booking. Please try again.");
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="space-y-5"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {t.formName || "Full Name"}
                    </label>
                    <input
                      id="booking-name-input"
                      type="text"
                      name="name"
                      autoComplete="name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none transition-shadow text-slate-800"
                      placeholder={t.formNamePlace || "Your Name"}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {t.formContact || "Phone Number"}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      id="tour-phone"
                      autoComplete="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none transition-shadow text-slate-800"
                      placeholder="+91"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {lang === "mr" ? "प्रवासी संख्या" : "Number of Persons"}
                    </label>
                    <select
                      name="persons"
                      id="tour-persons"
                      autoComplete="off"
                      value={persons}
                      onChange={(e) => setPersons(Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none transition-shadow cursor-pointer text-slate-800"
                    >
                      {[...Array(16)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}{" "}
                          {i + 1 === 1
                            ? lang === "mr"
                              ? "प्रवासी"
                              : "Person"
                            : lang === "mr"
                              ? "प्रवासी"
                              : "Persons"}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {"Travel Date"}
                    </label>
                    {validDates && validDates.length > 0 ? (
                      <select
                        name="travelDate"
                        id="tour-travel-date"
                        autoComplete="off"
                        required
                        value={travelDate}
                        onChange={(e) => setTravelDate(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none transition-shadow cursor-pointer text-slate-800"
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
                        id="tour-travel-date"
                        autoComplete="off"
                        required
                        value={travelDate}
                        onChange={(e) => setTravelDate(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none transition-shadow text-slate-800"
                      />
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 mt-2 bg-brand-blue-deep hover:bg-brand-blue text-white font-bold rounded-lg transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        {lang === "mr" ? "सादर करत आहे..." : "Submitting..."}
                      </>
                    ) : (
                      t.tourSubmit || "Submit Request"
                    )}
                  </button>
                  <p className="text-xs text-center text-gray-500 mt-4">
                    {t.tourContactSoon || "We will contact you within 24 hours."}
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
    </main >
  );
}
