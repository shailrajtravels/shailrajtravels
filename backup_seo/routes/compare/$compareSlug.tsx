import React from 'react';
import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { generateSEO, SchemaMarkup } from '../../lib/seo';
import { comparisons } from '../../data/comparisons';
import { tours } from '../../data/tours.en';

export const Route = createFileRoute('/compare/$compareSlug')({
  loader: ({ params }) => {
    const comparison = comparisons.find(c => c.slug === params.compareSlug);
    if (!comparison) throw notFound();
    return comparison;
  },
  head: ({ loaderData }) => ({
    meta: generateSEO({
      title: loaderData.metaTitle,
      description: loaderData.metaDescription,
      canonicalUrl: `https://www.shailrajtravels.com/compare/${loaderData.slug}`,
    }),
    links: [{ rel: 'canonical', href: `https://www.shailrajtravels.com/compare/${loaderData.slug}` }],
  }),
  component: ComparePageTemplate,
});

function ComparePageTemplate() {
  const comparison = Route.useLoaderData();
  const tourA = tours.find(t => t.slug === comparison.toursCompared[0]);
  const tourB = tours.find(t => t.slug === comparison.toursCompared[1]);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": comparison.title,
    "description": comparison.metaDescription,
    "author": {
      "@type": "Organization",
      "name": "Shailraj Travels Editorial"
    }
  };

  return (
    <main className="w-full bg-slate-50 pb-20 pt-24 px-4 sm:px-6 lg:px-8">
      <SchemaMarkup schema={articleSchema} />
      
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-sm font-bold text-brand-orange uppercase tracking-wider mb-4">Tour Comparison Guide</div>
          <h1 className="text-4xl font-extrabold text-brand-blue-deep mb-4">{comparison.title}</h1>
          <p className="text-lg text-slate-600">{comparison.metaDescription}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-3 bg-brand-blue-deep text-white border-b border-brand-blue-deep/20">
            <div className="p-6 font-bold text-lg flex items-center">Feature</div>
            <div className="p-6 border-l border-white/20">
              <h2 className="text-xl font-bold">{tourA?.title}</h2>
            </div>
            <div className="p-6 border-l border-white/20 bg-brand-blue">
              <h2 className="text-xl font-bold">{tourB?.title}</h2>
            </div>
          </div>

          {/* Table Body */}
          {comparison.keyDifferences.map((diff, idx) => (
            <div key={idx} className="grid grid-cols-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
              <div className="p-6 font-semibold text-slate-900 flex items-center bg-slate-50/50">{diff.aspect}</div>
              <div className="p-6 text-slate-700 border-l border-slate-100">{diff.optionA}</div>
              <div className="p-6 text-slate-700 border-l border-slate-100">{diff.optionB}</div>
            </div>
          ))}
        </div>

        {/* AI Extraction / Verdict Block */}
        <div className="mt-12 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">The Final Verdict</h2>
          <p className="text-lg text-slate-700 leading-relaxed font-medium bg-brand-orange/5 p-6 rounded-xl border border-brand-orange/10">
            {comparison.verdict}
          </p>
        </div>

        {/* CTAs */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {tourA && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center flex flex-col items-center">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Ready for {tourA.title}?</h3>
              <Link to={`/tours/${tourA.slug}`} className="px-8 py-3 bg-brand-blue-deep text-white font-bold rounded-lg hover:bg-brand-blue transition-colors w-full">
                View Package Details
              </Link>
            </div>
          )}
          {tourB && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center flex flex-col items-center">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Ready for {tourB.title}?</h3>
              <Link to={`/tours/${tourB.slug}`} className="px-8 py-3 bg-brand-orange text-white font-bold rounded-lg hover:bg-brand-orange-dark transition-colors w-full">
                View Package Details
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
