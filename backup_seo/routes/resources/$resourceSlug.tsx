import React from 'react';
import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { generateSEO, SchemaMarkup } from '../../lib/seo';
import { resources } from '../../data/resources';
import { tours } from '../../data/tours.en';

export const Route = createFileRoute('/resources/$resourceSlug')({
  loader: ({ params }) => {
    const resource = resources.find(r => r.slug === params.resourceSlug);
    if (!resource) throw notFound();
    return resource;
  },
  head: ({ loaderData }) => ({
    meta: generateSEO({
      title: loaderData.metaTitle,
      description: loaderData.metaDescription,
      canonicalUrl: `https://www.shailrajtravels.com/resources/${loaderData.slug}`,
    }),
    links: [{ rel: 'canonical', href: `https://www.shailrajtravels.com/resources/${loaderData.slug}` }],
  }),
  component: ResourcePageTemplate,
});

function ResourcePageTemplate() {
  const resource = Route.useLoaderData();
  const linkedTours = tours.filter(t => resource.relatedTours.includes(t.slug));

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": resource.faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": resource.title,
    "description": resource.metaDescription,
    "author": {
      "@type": "Organization",
      "name": "Shailraj Travels Editorial"
    }
  };

  return (
    <main className="w-full bg-slate-50 pb-20 pt-24 px-4 sm:px-6 lg:px-8">
      <SchemaMarkup schema={articleSchema} />
      {resource.faqs.length > 0 && <SchemaMarkup schema={faqSchema} />}
      
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 md:p-12">
          <div className="text-sm font-bold text-brand-orange uppercase tracking-wider mb-4">Resource Guide</div>
          <h1 className="text-4xl font-extrabold text-brand-blue-deep mb-8">{resource.title}</h1>
          
          <div 
            className="prose max-w-none text-slate-700 space-y-6 prose-h2:text-2xl prose-h2:font-bold prose-h2:text-slate-900 prose-h2:mt-8 prose-h2:mb-4 prose-ul:list-disc prose-ul:pl-5"
            dangerouslySetInnerHTML={{ __html: resource.content }} 
          />

          {resource.faqs.length > 0 && (
            <div className="mt-12 pt-8 border-t border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-6">
                {resource.faqs.map((faq, idx) => (
                  <div key={idx} className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                    <h3 className="font-bold text-slate-900 mb-2">{faq.question}</h3>
                    <p className="text-slate-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {linkedTours.length > 0 && (
            <div className="mt-12 bg-brand-blue/5 p-8 rounded-2xl border border-brand-blue/10 text-center">
              <h2 className="text-2xl font-bold text-brand-blue-deep mb-4">Ready for the Journey?</h2>
              <p className="text-slate-700 mb-6">Let us handle the logistics so you can focus on devotion.</p>
              <div className="flex flex-wrap justify-center gap-4">
                {linkedTours.map(tour => (
                  <Link key={tour.slug} to={`/tours/${tour.slug}`} className="px-6 py-3 bg-brand-orange text-white font-bold rounded-lg hover:bg-brand-orange-dark transition-colors">
                    View {tour.title} Package
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
