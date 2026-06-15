import React from 'react';
import { createFileRoute, Link, useLoaderData } from '@tanstack/react-router';
import { getToursFn } from '../backend/lib/tours';
import {  generateSEO  } from '../backend/lib/seo';

export const Route = createFileRoute('/tours/')({
  loader: () => getToursFn(),
  head: () => ({
    meta: generateSEO({
      title: 'Pilgrimage Tours from Pune | Shailraj Travels',
      description: 'Explore our popular pilgrimage tours including Ashtavinayak Yatra, Jyotirlinga Darshan, Pandharpur Wari, and Char Dham Yatra. AC travel and guided darshan from Pune.',
      canonicalUrl: 'https://www.shailrajtravels.com/tours'
    }),
    links: [
      { rel: 'canonical', href: 'https://www.shailrajtravels.com/tours' }
    ]
  }),
  component: ToursListingPage
});

function ToursListingPage() {
  const tours = useLoaderData({ from: '/tours/' });

  return (
    <main className="w-full bg-white pb-16 pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-brand-blue-deep mb-4">Our Pilgrimage Tours</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Embark on a spiritual journey with our perfectly planned, comfortable, and guided pilgrimage tour packages from Pune.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {tours.map((tour: any) => (
          <Link key={tour.slug} to="/tours/$tourSlug" params={{ tourSlug: tour.slug! }} className="group block h-full">
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all h-full flex flex-col bg-white">
              <div className="h-48 relative overflow-hidden bg-gray-100">
                <img src={tour.heroContent.image} alt={tour.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-brand-orange transition-colors">{tour.title}</h2>
                <p className="text-sm text-gray-600 line-clamp-3 mb-4">{tour.heroContent.description}</p>
                <div className="mt-auto">
                  <span className="text-brand-orange font-semibold group-hover:underline">View Tour Details &rarr;</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
