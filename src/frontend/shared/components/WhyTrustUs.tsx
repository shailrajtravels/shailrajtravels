import React from 'react';

export const WhyTrustUs: React.FC = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-brand-blue-deep mb-4">
            Why Trust Shailraj Travels?
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            We are not an aggregator. We are a physical, Pune-based pilgrimage operator with a
            deep-rooted commitment to your spiritual journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 mb-3">Hyper-Local Expertise</h3>
            <p className="text-slate-600">
              Our drivers are locals who know the fastest routes, cleanest highway dhabas, and exact
              Darshan timings to save you hours of waiting.
            </p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 mb-3">Transparent Pricing</h3>
            <p className="text-slate-600">
              No hidden toll charges, driver allowances, or sudden parking fees. What we quote is
              exactly what you pay.
            </p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 mb-3">Physical Presence</h3>
            <p className="text-slate-600">
              We have a physical office in Pune and a verified fleet of over 45 vehicles. You can
              always reach a human for 24/7 support.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
