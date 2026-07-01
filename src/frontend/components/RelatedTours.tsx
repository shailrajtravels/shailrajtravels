import React from "react";
import { Link } from "@tanstack/react-router";
import { RelatedItem } from "../types/tour";
import { LazyImage } from "../components/ui/lazy-image";

export function RelatedTours({ tours }: { tours: RelatedItem[] }) {
  if (!tours || tours.length === 0) return null;

  return (
    <div className="mt-6 border-t border-gray-200 pt-4">
      <h3 className="text-2xl font-bold text-brand-blue-deep mb-6">Related Pilgrimage Tours</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {tours.map((tour) => (
          <Link
            key={tour.slug}
            to="/tours/$tourSlug"
            params={{ tourSlug: tour.slug! }}
            className="block group"
          >
            <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-gray-100 h-32 flex items-center justify-center relative overflow-hidden">
                {tour.image ? (
                  <LazyImage
                    src={tour.image}
                    alt={tour.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <span className="text-brand-orange font-bold text-lg">Shailraj Travels</span>
                )}
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
              </div>
              <div className="p-4 bg-white">
                <h4 className="font-semibold text-gray-900 group-hover:text-brand-orange transition-colors">
                  {tour.title}
                </h4>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
