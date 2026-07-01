import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { generateSEO } from '@/backend/features/seo';

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: generateSEO({
      title: "Terms & Conditions | Shailraj Travels",
      description:
        "Terms and Conditions for Shailraj Travels. Please read these terms carefully before booking your pilgrimage tour.",
      canonicalUrl: "https://www.shailrajtravels.com/terms",
    }),
    links: [{ rel: "canonical", href: "https://www.shailrajtravels.com/terms" }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <main className="w-full bg-white pb-16 pt-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <h1 className="text-4xl md:text-5xl font-extrabold text-brand-blue-deep mb-8">
        Terms & Conditions
      </h1>
      <div className="prose max-w-none text-gray-700 space-y-6">
        <p>
          <strong>Last Updated: {new Date().toLocaleDateString()}</strong>
        </p>
        <p>
          Welcome to Shailraj Travels. By booking a tour with us, you agree to comply with and be
          bound by the following terms and conditions.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Bookings and Payments</h2>
        <p>
          All bookings are subject to availability. A minimum advance payment (as specified per
          tour) is required to confirm your seat. The remaining balance must be paid before the
          departure date.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Tour Itinerary Changes</h2>
        <p>
          While we strive to follow the published itinerary, Shailraj Travels reserves the right to
          modify routes, schedules, or accommodations due to unforeseen circumstances (e.g.,
          weather, traffic, VIP movements at temples).
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
          3. Passenger Responsibilities
        </h2>
        <p>
          Passengers are responsible for their personal belongings. Shailraj Travels is not liable
          for any loss or damage to luggage or valuables during the journey.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Dispute Resolution</h2>
        <p>
          Any disputes arising out of or in connection with these terms shall be subject to the
          exclusive jurisdiction of the courts in Pune, Maharashtra.
        </p>
      </div>
    </main>
  );
}
