import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import {  generateSEO  } from '../backend/lib/seo';

export const Route = createFileRoute('/cancellation-policy')({
  head: () => ({
    meta: generateSEO({
      title: 'Cancellation Policy | Shailraj Travels',
      description: 'Cancellation Policy for Shailraj Travels. Check our terms for cancelling your booked tour packages.',
      canonicalUrl: 'https://www.shailrajtravels.com/cancellation-policy',
    }),
    links: [{ rel: 'canonical', href: 'https://www.shailrajtravels.com/cancellation-policy' }],
  }),
  component: CancellationPolicyPage,
});

function CancellationPolicyPage() {
  return (
    <main className="w-full bg-white pb-16 pt-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <h1 className="text-4xl md:text-5xl font-extrabold text-brand-blue-deep mb-8">Cancellation Policy</h1>
      <div className="prose max-w-none text-gray-700 space-y-6">
        <p><strong>Last Updated: {new Date().toLocaleDateString()}</strong></p>
        <p>We understand that plans can change. Please review our standard cancellation policy for all our pilgrimage tours.</p>
        
        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Standard Cancellation Charges</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>30+ Days before departure:</strong> 10% of total tour cost will be deducted as processing fees.</li>
          <li><strong>15-29 Days before departure:</strong> 25% of total tour cost will be deducted.</li>
          <li><strong>7-14 Days before departure:</strong> 50% of total tour cost will be deducted.</li>
          <li><strong>Less than 7 Days / No Show:</strong> 100% of total tour cost will be deducted (No Refund).</li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Procedure for Cancellation</h2>
        <p>All cancellation requests must be submitted in writing via email to cancellations@shailrajtravels.com or by calling our customer service line directly. Verbal cancellations made to third parties will not be considered valid.</p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Special Circumstances</h2>
        <p>In cases of medical emergencies or unforeseeable personal tragedies, cancellation waivers may be considered at the sole discretion of the Shailraj Travels management, requiring official documentation.</p>
      </div>
    </main>
  );
}
