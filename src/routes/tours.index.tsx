import React, { useState, useMemo } from 'react';
import { createFileRoute, Link, useLoaderData } from '@tanstack/react-router';
import { getToursFn } from '@/backend/features/tours';
import { generateSEO } from '@/backend/features/seo';
import { useLanguage } from '@/routes/__root';
import { translations } from '@/frontend/core/i18n';
import { Search, MapPin, Filter } from 'lucide-react';
import { Navbar } from '@/frontend/core/Navbar';
import { FooterSection as Footer } from '@/frontend/core/Footer';
import { LazyImage } from '@/frontend/shared/ui/lazy-image';

export const Route = createFileRoute("/tours/")({
  validateSearch: (search: Record<string, unknown>) => ({
    lang: search.lang as string | undefined,
  }),
  loaderDeps: ({ search: { lang } }) => ({ lang }),
  loader: ({ deps: { lang } }) => getToursFn({ data: { lang: lang || "en" } }),
  head: () => ({
    meta: generateSEO({
      title: "Pilgrimage Tours from Pune | Shailraj Travels",
      description:
        "Explore our popular pilgrimage tours including Ashtavinayak Yatra, Jyotirlinga Darshan, Pandharpur Wari, and Char Dham Yatra. AC travel and guided darshan from Pune.",
      canonicalUrl: "https://www.shailrajtravels.com/tours",
    }),
    links: [{ rel: "canonical", href: "https://www.shailrajtravels.com/tours" }],
  }),
  component: ToursListingPage,
  pendingComponent: ToursListingSkeleton
});

function ToursListingSkeleton() {
  const { lang } = useLanguage();
  const t = translations[lang];

  return (
    <main className="w-full bg-white pb-16 pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        {/* Skeleton for Title */}
        <div className="h-12 bg-slate-100 rounded-md w-72 mx-auto mb-4 animate-pulse" />
        {/* Skeleton for Description */}
        <div className="h-6 bg-slate-100 rounded-md max-w-xl mx-auto mb-2 animate-pulse" />
        <div className="h-6 bg-slate-100 rounded-md max-w-lg mx-auto animate-pulse" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm h-full flex flex-col bg-white">
            {/* Skeleton for Hero Image */}
            <div className="h-48 bg-slate-100 animate-pulse" />
            <div className="p-6 flex flex-col flex-grow">
              {/* Skeleton for Title */}
              <div className="h-6 bg-slate-100 rounded-md w-3/4 mb-3 animate-pulse" />
              {/* Skeleton for Description */}
              <div className="h-4 bg-slate-100 rounded-md w-full mb-2 animate-pulse" />
              <div className="h-4 bg-slate-100 rounded-md w-full mb-2 animate-pulse" />
              <div className="h-4 bg-slate-100 rounded-md w-1/2 mb-4 animate-pulse" />
              <div className="mt-auto animate-pulse">
                {/* Skeleton for link */}
                <div className="h-5 bg-slate-100 rounded-md w-32" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

function ToursListingPage() {
  const tours = useLoaderData({ from: "/tours/" });
  const { lang } = useLanguage();
  const t = translations[lang];

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDestination, setSelectedDestination] = useState("All");

  // Extract unique destinations across all tours
  const allDestinations = useMemo(() => {
    const dests = new Set<string>();
    tours.forEach((tour: any) => {
      if (tour.destinations && Array.isArray(tour.destinations)) {
        tour.destinations.forEach((d: string) => dests.add(d));
      }
    });
    return ["All", ...Array.from(dests)].sort();
  }, [tours]);

  // Filter tours based on search term and selected destination
  const filteredTours = useMemo(() => {
    return tours.filter((tour: any) => {
      const titleMatch = tour.title?.toLowerCase().includes(searchTerm.toLowerCase());
      const descMatch = tour.heroContent?.description
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesSearch = titleMatch || descMatch;

      const matchesDest =
        selectedDestination === "All" ||
        (tour.destinations && tour.destinations.includes(selectedDestination));

      return matchesSearch && matchesDest;
    });
  }, [tours, searchTerm, selectedDestination]);

  return (
    <div className="font-sans text-slate-800 bg-white selection:bg-brand-green/20 selection:text-brand-blue-deep overflow-x-hidden">
      <Navbar t={t} />
      <main className="w-full bg-slate-50 min-h-screen pb-16 pt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-brand-blue-deep mb-4">
              {t.toursIndexTitle || "Our Pilgrimage Tours"}
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {t.toursIndexDesc ||
                "Embark on a spiritual journey with our perfectly planned, comfortable, and guided pilgrimage tour packages from Pune."}
            </p>
          </div>

          {/* Filters Section */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-10 flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search tours..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none transition-all font-medium text-slate-700 placeholder-slate-400"
              />
            </div>

            <div className="relative w-full md:w-64 shrink-0">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                value={selectedDestination}
                onChange={(e) => setSelectedDestination(e.target.value)}
                className="w-full pl-12 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none transition-all font-medium text-slate-700 appearance-none cursor-pointer"
              >
                {allDestinations.map((dest) => (
                  <option key={dest} value={dest}>
                    {dest === "All" ? "All Destinations" : dest}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <Filter className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Results Grid */}
          {filteredTours.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
              <MapPin className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-2xl font-bold text-slate-700 mb-2">No tours found</h3>
              <p className="text-slate-500">
                Try adjusting your search or filter criteria to find more tours.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedDestination("All");
                }}
                className="mt-6 px-6 py-2.5 bg-brand-orange/10 text-brand-orange font-bold rounded-xl hover:bg-brand-orange/20 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTours.map((tour: any) => (
                <Link
                  key={tour.slug}
                  to="/tours/$tourSlug"
                  params={{ tourSlug: tour.slug! }}
                  className="group block h-full"
                >
                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col bg-white hover:-translate-y-1">
                    <div className="h-56 relative overflow-hidden bg-slate-100">
                      <LazyImage
                        src={tour.heroContent?.image || ""}
                        alt={tour.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex gap-2 mb-3 flex-wrap">
                        {tour.destinations?.slice(0, 2).map((dest: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 bg-brand-blue/5 text-brand-blue-deep text-[11px] font-bold rounded-lg border border-brand-blue/10 uppercase tracking-wider"
                          >
                            {dest}
                          </span>
                        ))}
                        {tour.destinations?.length > 2 && (
                          <span className="px-2.5 py-1 bg-slate-50 text-slate-500 text-[11px] font-bold rounded-lg border border-slate-100 uppercase tracking-wider">
                            +{tour.destinations.length - 2}
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-brand-orange transition-colors">
                        {tour.title}
                      </h2>
                      <p className="text-sm text-slate-500 line-clamp-3 mb-6 leading-relaxed">
                        {tour.heroContent?.description}
                      </p>
                      <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-brand-orange font-bold text-sm group-hover:underline flex items-center gap-1">
                          {t.toursIndexViewDetails || "View Tour Details"}
                          <span className="transition-transform group-hover:translate-x-1">→</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer t={t} lang={lang} />
    </div>
  );
}
