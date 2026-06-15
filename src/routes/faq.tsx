import { SchemaMarkup } from '../frontend/components/SchemaMarkup';
import React, { useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { generateSEO } from '../backend/lib/seo';
import { getToursFn } from '../backend/lib/tours';

export const Route = createFileRoute('/faq')({
  loader: async () => {
    const tours = await getToursFn();
    return { tours };
  },
  head: () => ({
    meta: generateSEO({
      title: 'Pilgrimage FAQs | Char Dham, Ashtavinayak, Jyotirlinga Questions',
      description: 'Frequently asked questions about our pilgrimage tours. Learn about booking, cancellation, physical fitness, and what to pack.',
      canonicalUrl: 'https://www.shailrajtravels.com/faq',
    }),
    links: [{ rel: 'canonical', href: 'https://www.shailrajtravels.com/faq' }],
  }),
  component: FAQPage,
});

function FAQPage() {
  const { tours } = Route.useLoaderData();
  const [searchTerm, setSearchTerm] = useState('');

  // Aggregate FAQs from all tours
  const allFaqs = (tours as any[]).flatMap(t => 
    (t.faq || []).map((f: any) => ({ ...f, tourTitle: t.title, tourSlug: t.slug }))
  );

  const filteredFaqs = allFaqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": filteredFaqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <main className="w-full bg-slate-50 pb-20 pt-24 px-4 sm:px-6 lg:px-8 min-h-screen">
      <SchemaMarkup schema={faqSchema} />
      
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-brand-blue-deep mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-slate-600 mb-8">Everything you need to know about our pilgrimage packages.</p>
          
          <div className="max-w-2xl mx-auto">
            <input 
              type="text" 
              placeholder="Search for questions (e.g., cancellation, senior citizens)..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-6 py-4 rounded-xl border border-slate-200 shadow-sm focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none text-lg"
            />
          </div>
        </div>

        <div className="space-y-6">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <Link to={`/tours/${faq.tourSlug}`} className="text-xs font-bold text-brand-orange uppercase tracking-wider mb-2 hover:underline block">{faq.tourTitle} &rarr;</Link>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{faq.question}</h3>
                <p className="text-slate-700 leading-relaxed">{faq.answer}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-slate-500">
              No questions found matching your search. Please try a different term or contact us directly.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
