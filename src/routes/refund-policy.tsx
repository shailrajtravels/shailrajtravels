import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { generateSEO } from '@/backend/features/seo';

export const Route = createFileRoute("/refund-policy")({
  head: () => ({
    meta: generateSEO({
      title: "Refund Policy | Shailraj Travels",
      description:
        "Refund Policy for Shailraj Travels. Understand our timeline and process for tour payment refunds.",
      canonicalUrl: "https://www.shailrajtravels.com/refund-policy",
    }),
    links: [{ rel: "canonical", href: "https://www.shailrajtravels.com/refund-policy" }],
  }),
  component: RefundPolicyPage,
});

function RefundPolicyPage() {
  return (
    <main className="w-full bg-white pb-16 pt-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <h1 className="text-4xl md:text-5xl font-extrabold text-brand-blue-deep mb-8">
        Refund Policy
      </h1>
      <div className="prose max-w-none text-gray-700 space-y-6">
        <p>
          <strong>Last Updated: {new Date().toLocaleDateString()}</strong>
        </p>
        <p>
          At Shailraj Travels, we aim to provide a transparent and fair refund process for our
          customers.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Refund Eligibility</h2>
        <p>
          Refunds are applicable only for cancellations made within the stipulated time frame as
          mentioned in our Cancellation Policy. No-shows or mid-tour dropouts are not eligible for
          any refund.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Refund Processing Time</h2>
        <p>
          Approved refunds will be processed within 7 to 10 business days. The amount will be
          credited back to the original mode of payment used during booking.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Tour Cancellation by Us</h2>
        <p>
          In the rare event that Shailraj Travels must cancel a tour due to unforeseen circumstances
          (e.g., natural disasters, strikes, minimum occupancy not met), passengers will be offered
          a full 100% refund or an option to reschedule to the next available date.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Contact for Refunds</h2>
        <p>
          To follow up on a refund request, please email shailrajtravels9999@gmail.com with your
          booking ID.
        </p>
      </div>
    </main>
  );
}
