import React from 'react';
import { SEOFAQAccordion } from '../components/SEOFAQAccordion';
import { SEOBreadcrumbs, type BreadcrumbItem } from '../components/SEOBreadcrumbs';
import { SchemaMarkup } from '../components/SchemaMarkup';
import { generateProductSchema } from '../lib/schema-generators';
import { Tour } from '../types/tour';
import { RelatedTours } from '../components/RelatedTours';
import { RelatedBlogs } from '../components/RelatedBlogs';

interface TourPageTemplateProps {
  data: Tour;
}

export function TourPageTemplate({ data }: TourPageTemplateProps) {
  const breadcrumbs: BreadcrumbItem[] = [
    { name: 'Tours', url: '/tours' },
    { name: data.title, url: `/tours/${data.slug}` }
  ];

  return (
    <main className="w-full bg-white pb-16">
      <SchemaMarkup schema={data.schemaData} />

      {/* Hero Section */}
      <section className="relative w-full h-[60vh] min-h-[450px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={data.heroContent.image} 
            alt={data.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl pt-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6">
            {data.title}
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto">
            {data.heroContent.description}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              className="px-8 py-3 bg-brand-orange text-white font-semibold rounded-lg hover:bg-brand-orange-dark transition-colors"
              onClick={() => window.dataLayer?.push({ event: 'book_now_hero', tour: data.title })}
            >
              Book Now
            </button>
            <a 
              href="tel:+919876543210" 
              className="px-8 py-3 bg-white text-brand-blue-deep font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => window.dataLayer?.push({ event: 'call_now_hero', tour: data.title })}
            >
              Call Now
            </a>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <SEOBreadcrumbs items={breadcrumbs} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-6">
          <div className="lg:col-span-2 space-y-12">
            {/* Overview Section */}
            <section>
              <h2 className="text-3xl font-bold text-brand-blue-deep mb-6">Overview</h2>
              <div className="prose max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: data.overview }} />
            </section>

            {/* Highlights Section */}
            <section>
              <h2 className="text-3xl font-bold text-brand-blue-deep mb-6">Tour Highlights</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                {data.highlights.map((highlight, idx) => (
                  <li key={idx} className="pl-1">{highlight}</li>
                ))}
              </ul>
            </section>

            {/* Packages Section */}
            <section>
              <h2 className="text-3xl font-bold text-brand-blue-deep mb-6">Packages & Pricing</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.packages.map((pkg, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col bg-white">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.title}</h3>
                    <p className="text-3xl font-bold text-brand-orange mb-6">₹{pkg.price} <span className="text-sm font-normal text-gray-500">per person</span></p>
                    <div className="flex-grow space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Includes:</h4>
                        <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1.5">
                          {pkg.inclusions.map((inc, i) => <li key={i}>{inc}</li>)}
                        </ul>
                      </div>
                      {pkg.exclusions.length > 0 && (
                        <div className="pt-2">
                          <h4 className="font-semibold text-gray-900 mb-2">Excludes:</h4>
                          <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1.5">
                            {pkg.exclusions.map((exc, i) => <li key={i}>{exc}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                    <button 
                      className="mt-8 w-full py-2.5 border-2 border-brand-orange text-brand-orange font-bold rounded-lg hover:bg-brand-orange hover:text-white transition-colors"
                      onClick={() => window.dataLayer?.push({ event: 'inquire_package', tour: data.title, package: pkg.title })}
                    >
                      Inquire Package
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* FAQs Section */}
            <section className="pt-4">
              <h2 className="text-3xl font-bold text-brand-blue-deep mb-4">Frequently Asked Questions</h2>
              <SEOFAQAccordion faqs={data.faq} />
            </section>

            {/* Internal Linking Components */}
            <RelatedTours tours={data.relatedTours} />
            <RelatedBlogs blogs={data.relatedBlogs} />
          </div>

          <div className="lg:col-span-1">
            {/* Sidebar Booking Form */}
            <div className="sticky top-24 bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Request a Custom Quote</h3>
              <form className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                  <input type="text" className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none transition-shadow" placeholder="Your Name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                  <input type="tel" className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none transition-shadow" placeholder="+91" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Travel Date</label>
                  <input type="date" className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none transition-shadow" />
                </div>
                <button 
                  type="button" 
                  className="w-full py-3.5 mt-2 bg-brand-blue-deep text-white font-bold rounded-lg hover:bg-brand-blue transition-colors shadow-md"
                  onClick={() => window.dataLayer?.push({ event: 'submit_request', tour: data.title })}
                >
                  Submit Request
                </button>
                <p className="text-xs text-center text-gray-500 mt-4">We will contact you within 24 hours.</p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
