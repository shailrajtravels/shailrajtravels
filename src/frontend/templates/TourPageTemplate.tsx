import React, { useState } from "react";
import { SEOFAQAccordion } from "../components/SEOFAQAccordion";
import { SEOBreadcrumbs, type BreadcrumbItem } from "../components/SEOBreadcrumbs";
import { SchemaMarkup } from "../components/SchemaMarkup";
import { generateProductSchema } from "../../backend/lib/schema-generators";
import { Tour } from "../types/tour";
import { RelatedTours } from "../components/RelatedTours";
import { RelatedBlogs } from "../components/RelatedBlogs";
import { useLanguage } from "../../routes/__root";
import { translations } from "../features/core/i18n";
import { createBookingFn } from "../../backend/lib/bookings";
import { LazyImage } from "../components/ui/lazy-image";

interface TourPageTemplateProps {
  data: Tour;
}

export function TourPageTemplate({ data }: TourPageTemplateProps) {
  const { lang } = useLanguage();
  const t = translations[lang];

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [persons, setPersons] = useState(2);
  const [travelDate, setTravelDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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
    <main className="w-full bg-white pb-16">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-6">
        <div className="lg:col-span-2 space-y-12">
          {/* Overview Section */}
          <section>
            <h2 className="text-3xl font-bold text-brand-blue-deep mb-6">
              {t.tourOverview || "Overview"}
            </h2>
            <div
              className="prose max-w-none text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: data.overview }}
            />
          </section>

          {/* Highlights Section */}
          <section>
            <h2 className="text-3xl font-bold text-brand-blue-deep mb-6">
              {t.tourHighlights || "Tour Highlights"}
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              {data.highlights.map((highlight, idx) => (
                <li key={idx} className="pl-1">
                  {highlight}
                </li>
              ))}
            </ul>
          </section>

          {/* Packages Section */}
          <section>
            <h2 className="text-3xl font-bold text-brand-blue-deep mb-6">
              {t.tourPackages || "Packages & Pricing"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.packages.map((pkg, idx) => (
                <div
                  key={idx}
                  className="border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col bg-white"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.title}</h3>
                  <p className="text-3xl font-bold text-brand-orange mb-6">
                    ₹{pkg.price}{" "}
                    <span className="text-sm font-normal text-gray-500">
                      {t.tourPerPerson || "per person"}
                    </span>
                  </p>
                  <div className="flex-grow space-y-4">
                    {pkg.inclusions && pkg.inclusions.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                          {t.tourIncludes || "Includes:"}
                        </h4>
                        <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1.5">
                          {pkg.inclusions.map((inc: string, i: number) => (
                            <li key={i}>{inc}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {pkg.exclusions && pkg.exclusions.length > 0 && (
                      <div className="pt-2">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          {t.tourExcludes || "Excludes:"}
                        </h4>
                        <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1.5">
                          {pkg.exclusions.map((exc: string, i: number) => (
                            <li key={i}>{exc}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <button
                    className="mt-8 w-full py-2.5 border-2 border-brand-orange text-brand-orange font-bold rounded-lg hover:bg-brand-orange hover:text-white transition-colors"
                    onClick={() => {
                      window.dataLayer?.push({
                        event: "inquire_package",
                        tour: data.title,
                        package: pkg.title,
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
                    {t.tourInquire || "Inquire Package"}
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* FAQs Section */}
          <section className="pt-4">
            <h2 className="text-3xl font-bold text-brand-blue-deep mb-4">
              {t.tourFaq || "Frequently Asked Questions"}
            </h2>
            <SEOFAQAccordion faqs={data.faq} />
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
                    setPersons(2);
                  }}
                  className="px-6 py-2 bg-brand-blue-deep text-white text-sm rounded-xl font-bold hover:bg-brand-blue transition-colors cursor-pointer"
                >
                  {lang === "mr" ? "नवीन बुकिंग करा" : "Make Another Booking"}
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  {t.tourCustomQuote || "Request a Custom Quote"}
                </h3>
                <form
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
