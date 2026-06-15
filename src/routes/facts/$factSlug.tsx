// @ts-nocheck
import { SchemaMarkup } from '../../frontend/components/SchemaMarkup';
import React from 'react';
import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import {  generateSEO  } from '../../backend/lib/seo';
import { factPages } from '../../frontend/data/facts';

export const Route = createFileRoute('/facts/$factSlug')({
  loader: ({ params }) => {
    const factPage = factPages.find(f => f.slug === params.factSlug);
    if (!factPage) throw notFound();
    return factPage;
  },
  head: ({ loaderData }) => ({
    meta: generateSEO({
      title: loaderData.metaTitle,
      description: loaderData.metaDescription,
      canonicalUrl: `https://www.shailrajtravels.com/facts/${loaderData.slug}`,
    }),
    links: [{ rel: 'canonical', href: `https://www.shailrajtravels.com/facts/${loaderData.slug}` }],
  }),
  component: FactPageTemplate,
});

function FactPageTemplate() {
  const factPage = Route.useLoaderData();

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": factPage.title,
    "description": factPage.metaDescription,
    "author": {
      "@type": "Organization",
      "name": "Shailraj Travels Editorial"
    }
  };

  return (
    <main className="w-full bg-slate-50 pb-20 pt-24 px-4 sm:px-6 lg:px-8">
      <SchemaMarkup schema={articleSchema} />
      
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-sm font-bold text-brand-orange uppercase tracking-wider mb-4">Pilgrimage Facts & Data</div>
          <h1 className="text-4xl font-extrabold text-brand-blue-deep mb-4">{factPage.title}</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 md:p-12">
          {/* AI Extraction Block: Key Facts */}
          <div className="bg-brand-blue/5 p-6 rounded-xl border border-brand-blue/20 mb-10">
            <h2 className="text-lg font-bold text-brand-blue-deep mb-4">Key Data Points</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {factPage.keyFacts.map((fact, idx) => (
                <div key={idx} className="flex flex-col bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                  <span className="text-sm text-slate-500 uppercase font-semibold">{fact.label}</span>
                  <span className="text-lg font-bold text-slate-900">{fact.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div 
            className="prose max-w-none text-slate-700 space-y-6 prose-h2:text-2xl prose-h2:font-bold prose-h2:text-slate-900 prose-h2:mt-8 prose-h2:mb-4 prose-ul:list-disc prose-ul:pl-5"
            dangerouslySetInnerHTML={{ __html: factPage.content }} 
          />

          <div className="mt-12 pt-8 border-t border-slate-100 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Plan Your Yatra Today</h2>
            <Link to="/tours" className="px-8 py-3 bg-brand-orange text-white font-bold rounded-lg hover:bg-brand-orange-dark transition-colors inline-block shadow-md">
              Explore Our Packages
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

