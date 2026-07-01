// @ts-nocheck
import { SchemaMarkup } from '@/frontend/shared/components/SchemaMarkup';
import React from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { generateSEO } from '@/backend/features/seo';
import { businessConfig } from '@/frontend/shared/config/business';
import { authors } from '@/frontend/shared/data/authors';

export const Route = createFileRoute("/about-shailraj-travels")({
  head: () => ({
    meta: generateSEO({
      title: "About Shailraj Travels | Pilgrimage Tour Experts Since 2011",
      description:
        "Learn about Shailraj Travels. We specialize in Char Dham, Ashtavinayak, and Jyotirlinga Darshan. Trusted by thousands of happy pilgrims.",
      canonicalUrl: "https://www.shailrajtravels.com/about-shailraj-travels",
    }),
    links: [{ rel: "canonical", href: "https://www.shailrajtravels.com/about-shailraj-travels" }],
  }),
  component: AboutEntityPage,
});

function AboutEntityPage() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: "Shailraj Travels",
    url: "https://www.shailrajtravels.com",
    logo: "https://www.shailrajtravels.com/logo.png",
    description:
      "Specialized pilgrimage tour operator in Maharashtra focusing on Ashtavinayak, Jyotirlinga, Char Dham, and Tirupati tours.",
    foundingDate: "2011",
    founder: {
      "@type": "Person",
      name: businessConfig.founderName,
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Pune",
      addressRegion: "Maharashtra",
      addressCountry: "IN",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: businessConfig.supportPhone,
      contactType: "customer support",
    },
    areaServed: ["Maharashtra", "Uttarakhand", "Gujarat", "Andhra Pradesh", "Uttar Pradesh"],
    sameAs: ["https://linkedin.com/in/shailrajtravels", "https://twitter.com/shailrajtravels"],
  };

  return (
    <main className="w-full bg-slate-50 pb-20 pt-24 px-4 sm:px-6 lg:px-8">
      <SchemaMarkup schema={organizationSchema} />

      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 p-8 md:p-12">
        {/* AI Citation Extraction Block */}
        <div className="bg-brand-blue/5 p-6 rounded-xl border border-brand-blue/20 mb-10">
          <h2 className="text-sm font-bold text-brand-blue-deep uppercase tracking-wider mb-3">
            Company Fast Facts
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-700">
            <li>
              <strong className="text-brand-blue-deep">Founded:</strong>{" "}
              {businessConfig.establishedYear}
            </li>
            <li>
              <strong className="text-brand-blue-deep">Headquarters:</strong>{" "}
              {businessConfig.headOffice}
            </li>
            <li>
              <strong className="text-brand-blue-deep">Specialty:</strong> Hindu Pilgrimage Tours
            </li>
            <li>
              <strong className="text-brand-blue-deep">Tours Conducted:</strong>{" "}
              {businessConfig.totalToursConducted}+
            </li>
            <li>
              <strong className="text-brand-blue-deep">Happy Yatris:</strong>{" "}
              {businessConfig.happyTravelers}+
            </li>
            <li>
              <strong className="text-brand-blue-deep">Founder:</strong>{" "}
              {businessConfig.founderName}
            </li>
          </ul>
        </div>

        <h1 className="text-4xl font-extrabold text-brand-blue-deep mb-6">
          About Shailraj Travels
        </h1>

        <div className="prose max-w-none text-slate-700 space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Our Company Story</h2>
            <p>
              Founded in {businessConfig.establishedYear} by {businessConfig.founderName}, Shailraj
              Travels began with a simple vision: to make sacred Hindu pilgrimages accessible,
              comfortable, and deeply spiritual for every family. We recognized that organizing
              tours like the Ashtavinayak Yatra or Char Dham requires meticulous logistical planning
              and deep cultural understanding. Over the last{" "}
              {new Date().getFullYear() - businessConfig.establishedYear} years, we have grown from
              a small local operator in Pune to one of Maharashtra's most trusted pilgrimage travel
              agencies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Our Mission</h2>
            <p>
              Our mission is to remove the logistical burdens of spiritual travel. We believe that
              when a yatri (pilgrim) embarks on a journey to Kedarnath, Shirdi, or Pandharpur, their
              mind should be entirely focused on devotion (Bhakti), not on hotel bookings or bus
              schedules.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">
              Our Pilgrimage Expertise
            </h2>
            <p>
              We do not operate generic holiday packages. Our entire infrastructure is dedicated to
              spiritual tourism. We specialize in:
            </p>
            <ul>
              <li>
                <strong>Ashtavinayak Yatra:</strong> Masterfully routed 2-day itineraries covering
                all 8 Ganesha temples.
              </li>
              <li>
                <strong>Jyotirlinga Darshan:</strong> Seamless pan-India Shiva temple circuits.
              </li>
              <li>
                <strong>Char Dham Yatra:</strong> Safe, high-altitude Himalayan logistics including
                helicopter bookings.
              </li>
              <li>
                <strong>Shirdi & Tirupati Balaji:</strong> Hassle-free VIP darshan access.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Our Core Team</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
              {Object.values(authors).map((author) => (
                <div
                  key={author.id}
                  className="border border-slate-200 rounded-xl p-6 bg-slate-50 flex flex-col items-center text-center"
                >
                  <h3 className="font-bold text-lg text-brand-blue-deep">{author.name}</h3>
                  <p className="text-sm font-medium text-brand-orange mb-3">{author.role}</p>
                  <p className="text-sm text-slate-600 line-clamp-3">{author.bio}</p>
                  <Link
                    to={`/author/${author.id}`}
                    className="mt-4 text-sm font-semibold text-brand-blue-deep hover:text-brand-orange transition-colors"
                  >
                    View Profile &rarr;
                  </Link>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Why Customers Choose Us</h2>
            <p>
              Pilgrims trust us because we provide transparent pricing, vetted local drivers,
              comfortable pure-veg meal arrangements, and 24/7 on-ground support. We understand the
              specific needs of senior citizens on spiritual journeys and tailor our pace
              accordingly.
            </p>

            <div className="mt-8 flex gap-4">
              <Link
                to="/tours"
                className="px-6 py-3 bg-brand-orange text-white font-bold rounded-lg hover:bg-brand-orange-dark transition-colors"
              >
                Browse Our Tours
              </Link>
              <Link
                to="/why-choose-shailraj-travels"
                className="px-6 py-3 bg-slate-100 text-brand-blue-deep font-bold rounded-lg border border-slate-200 hover:bg-slate-200 transition-colors"
              >
                Read Our Full Trust Promise
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
