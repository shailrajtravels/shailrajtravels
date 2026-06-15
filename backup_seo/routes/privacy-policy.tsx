import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { generateSEO } from '../lib/seo';

export const Route = createFileRoute('/privacy-policy')({
  head: () => ({
    meta: generateSEO({
      title: 'Privacy Policy | Shailraj Travels',
      description: 'Privacy Policy for Shailraj Travels. Learn how we collect, use, and protect your personal information.',
      canonicalUrl: 'https://www.shailrajtravels.com/privacy-policy',
    }),
    links: [{ rel: 'canonical', href: 'https://www.shailrajtravels.com/privacy-policy' }],
  }),
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  return (
    <main className="w-full bg-white pb-16 pt-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <h1 className="text-4xl md:text-5xl font-extrabold text-brand-blue-deep mb-8">Privacy Policy</h1>
      <div className="prose max-w-none text-gray-700 space-y-6">
        <p><strong>Last Updated: {new Date().toLocaleDateString()}</strong></p>
        <p>At Shailraj Travels, we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website or use our tour services.</p>
        
        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
        <p>We may collect the following types of information:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Personal Data:</strong> Name, email address, phone number, and address when you make a booking or inquiry.</li>
          <li><strong>Payment Information:</strong> Processed securely by our payment gateways; we do not store full credit card details.</li>
          <li><strong>Usage Data:</strong> Information about your interactions with our website for analytics purposes.</li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. How We Use Your Information</h2>
        <p>Your information is used to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Process and manage your tour bookings.</li>
          <li>Communicate with you regarding your itinerary, updates, and customer support.</li>
          <li>Improve our website and services.</li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Data Security</h2>
        <p>We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us at privacy@shailrajtravels.com or call us at +91 98765 43210.</p>
      </div>
    </main>
  );
}
