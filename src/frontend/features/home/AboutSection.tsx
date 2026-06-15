import React from 'react';
import { Map, Users, Star } from 'lucide-react';

export function AboutSection({ lang, t }: { lang: 'mr' | 'en', t: any }) {
  return (
    <div id="about" className="scroll-mt-28 md:scroll-mt-32">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-brand-mist pt-20 pb-20 lg:pt-32 lg:pb-32">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-mist to-white pointer-events-none z-0" />
        
        {/* Minimal Diagonal Texture */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.25] mix-blend-multiply z-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40 L40 0' stroke='%2394A3B8' stroke-width='0.5' fill='none'/%3E%3C/svg%3E")`, backgroundSize: '40px 40px' }} />

        {/* Background Accents */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-brand-green/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-80 w-80 rounded-full bg-brand-blue/5 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-[1200px] px-6 text-center animate-reveal">
          <p className="flex items-center justify-center gap-3 text-[13px] md:text-[15px] font-bold tracking-[0.2em] text-brand-green-dark mb-6">
            <span className="h-px w-8 bg-brand-green" />
            {t.storyLabel}
            <span className="h-px w-8 bg-brand-green" />
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display text-brand-blue-deep leading-tight" style={lang === "mr" ? { fontFamily: "'Tiro Devanagari Marathi', serif" } : {}}>
            {t.heroHeadingPrefix} <br />
            <span className="text-brand-green-dark">{t.heroHeadingHighlight}</span>
          </h2>
          <div className="mx-auto mt-8 max-w-3xl text-[16px] leading-relaxed text-slate-600 md:text-[18px] space-y-6 text-justify sm:text-center">
            <p>{t.heroP1}</p>
            <p>{t.heroP2}</p>
            <p>{t.heroP3}</p>
            <p>{t.heroP4}</p>
          </div>
        </div>
      </section>

      {/* Stats/Highlight Section */}
      <section className="relative z-20 mx-auto -mt-16 max-w-[1200px] px-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 animate-reveal" style={{ animationDelay: "0.2s" }}>
          {[
            { icon: <Map className="h-6 w-6" />, count: "50+", label: t.statDestinations },
            { icon: <Users className="h-6 w-6" />, count: "100+", label: t.statYatris },
            { icon: <Star className="h-6 w-6" />, count: "1.5+", label: t.statExperience },
            { icon: <Star className="h-6 w-6" />, count: "4.9/5", label: t.statRating },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center justify-center rounded-3xl bg-white p-6 shadow-xl shadow-brand-blue/5 border border-slate-50 transition-transform hover:-translate-y-1">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-mist text-brand-blue">
                {stat.icon}
              </div>
              <h3 className="text-3xl font-bold text-brand-blue-deep">{stat.count}</h3>
              <p className="mt-1 text-sm font-medium text-slate-500 text-center">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
