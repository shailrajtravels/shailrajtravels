import React from 'react';
import { MapPin } from 'lucide-react';

export const AreasWeServe: React.FC = () => {
  const regions = [
    { name: "Pune & PCMC", desc: "Our HQ and primary service area with free home pickup" },
    { name: "Mumbai Region", desc: "Dedicated vehicles for Mumbai, Thane, and Navi Mumbai" },
    { name: "Rest of Maharashtra", desc: "Nashik, Kolhapur, Nagpur, and all major cities" },
    { name: "Pan-India Airports", desc: "Airport transfers for Delhi, Dehradun, Chennai, etc." },
  ];

  return (
    <section className="py-16 bg-slate-50 border-t border-slate-100">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-brand-blue-deep mb-6">
              Areas We Serve
            </h2>
            <p className="text-slate-600 mb-8 text-lg">
              While our physical headquarters is in Pune, our fleet operates across major pilgrimage
              hubs in India, ensuring you get local expertise wherever your faith takes you.
            </p>

            <div className="space-y-6">
              {regions.map((region, idx) => (
                <div key={idx} className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <MapPin className="w-5 h-5 text-brand-green" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-800 mb-1">{region.name}</h4>
                    <p className="text-slate-600">{region.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 w-full bg-white p-2 rounded-3xl shadow-sm border border-slate-100">
            {/* A placeholder for an interactive or static map */}
            <div className="aspect-[4/3] bg-brand-blue/5 rounded-2xl flex items-center justify-center relative overflow-hidden">
              <div className="text-center p-8 relative z-10">
                <MapPin className="w-12 h-12 text-brand-orange mx-auto mb-4" />
                <h3 className="font-bold text-xl text-brand-blue-deep">Headquartered in Pune</h3>
                <p className="text-slate-500 mt-2">Serving Yatris Nationwide</p>
              </div>
              {/* Decorative map dots */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: "radial-gradient(#1E3A8A 2px, transparent 2px)",
                  backgroundSize: "24px 24px",
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
