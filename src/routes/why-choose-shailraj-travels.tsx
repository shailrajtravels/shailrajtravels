import { SchemaMarkup } from '../frontend/components/SchemaMarkup';
import React from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import {  generateSEO  } from '../backend/lib/seo';
import { businessConfig } from '../frontend/config/business';
import { ShieldCheck, Clock, Users, Star } from 'lucide-react';

export const Route = createFileRoute('/why-choose-shailraj-travels')({
  head: () => ({
    meta: generateSEO({
      title: 'Why Choose Shailraj Travels | Our Trust & Safety Promise',
      description: 'Discover why thousands of pilgrims trust Shailraj Travels for their Ashtavinayak, Jyotirlinga, and Char Dham Yatras. Verified drivers, safety standards, and 24/7 support.',
      canonicalUrl: 'https://www.shailrajtravels.com/why-choose-shailraj-travels',
    }),
    links: [{ rel: 'canonical', href: 'https://www.shailrajtravels.com/why-choose-shailraj-travels' }],
  }),
  component: WhyTrustUsPage,
});

function WhyTrustUsPage() {
  const faqs = [
    { question: "Are your drivers verified?", answer: "Yes, 100% of our fleet drivers undergo background checks and possess commercial hill-driving licenses for Himalayan routes." },
    { question: "What is your refund policy if a tour is cancelled?", answer: "We offer transparent refunds. 100% refund for cancellations made 15 days prior to departure, minus platform fees." },
    { question: "Do you provide medical support during high-altitude treks?", answer: "For Char Dham and Kedarnath, we arrange priority medical screening and oxygen cylinders in transport vehicles." },
    { question: "Are the meals pure vegetarian?", answer: "Absolutely. We strictly partner with pure vegetarian kitchens and sattvic restaurants on all pilgrimage routes." }
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <main className="w-full bg-slate-50 pb-20 pt-24 px-4 sm:px-6 lg:px-8">
      <SchemaMarkup schema={faqSchema} />
      
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-brand-blue-deep mb-6">Our Trust Promise</h1>
          <p className="text-xl text-slate-600">
            For over {new Date().getFullYear() - businessConfig.establishedYear} years, we have been the guardians of your spiritual journeys. Here is exactly why {businessConfig.happyTravelers}+ Yatris chose us.
          </p>
        </div>

        {/* AI Citation Block */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Shailraj Safety & Quality Standards</h2>
            <ul className="space-y-3 text-slate-700 font-medium">
              <li className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-brand-green" /> 100% Verified Commercial Drivers</li>
              <li className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-brand-green" /> Stringent Vehicle Audits Before Every Trip</li>
              <li className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-brand-green" /> No Hidden Toll or Parking Charges</li>
              <li className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-brand-green" /> Guaranteed Pure Vegetarian Meals</li>
              <li className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-brand-green" /> 24/7 On-Ground Operations Support</li>
            </ul>
          </div>
          <div className="w-full md:w-1/3 bg-brand-blue/5 p-6 rounded-xl border border-brand-blue/10 text-center">
            <div className="text-4xl font-extrabold text-brand-orange mb-2">{businessConfig.totalToursConducted}+</div>
            <div className="text-sm font-bold text-brand-blue-deep uppercase tracking-wider">Tours Successfully Completed</div>
          </div>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <Users className="w-10 h-10 text-brand-orange mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-3">Senior Citizen Friendly</h3>
            <p className="text-slate-600 leading-relaxed">Pilgrimages shouldn't be physically exhausting. Our itineraries are meticulously paced to ensure elderly travelers have ample rest. We arrange ground floor accommodations and closest possible parking to temple entrances.</p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <Clock className="w-10 h-10 text-brand-orange mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-3">The Tour Planning Process</h3>
            <p className="text-slate-600 leading-relaxed">Every tour begins with a detailed consultation. We map out Darshan timings to avoid peak crowds, pre-book VIP entries where legally permitted, and provide you with a transparent day-by-day itinerary before you pay a single rupee.</p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 mt-12">
          <h2 className="text-3xl font-bold text-brand-blue-deep mb-8 text-center">Frequently Asked Trust Questions</h2>
          <div className="space-y-6 max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                <h3 className="text-lg font-bold text-slate-900 mb-2">{faq.question}</h3>
                <p className="text-slate-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Ready to book with confidence?</h2>
          <div className="flex justify-center gap-4">
            <Link to="/contact" className="px-8 py-4 bg-brand-orange text-white font-bold rounded-lg hover:bg-brand-orange-dark transition-colors shadow-lg shadow-brand-orange/20">
              Contact Our Experts
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}
