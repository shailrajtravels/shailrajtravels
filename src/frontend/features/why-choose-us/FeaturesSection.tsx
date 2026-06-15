import React from 'react';
import { ArrowRight } from 'lucide-react';
import iconPin from '@/frontend/assets/ChatGPT Image Jun 10, 2026, 05_09_01 PM.png';
import iconTag from '@/frontend/assets/ChatGPT Image Jun 10, 2026, 05_09_26 PM.png';
// Provide fallback imports for the others
import iconShield from '@/frontend/assets/ChatGPT Image Jun 10, 2026, 04_55_09 PM.png'; // Fallback
import iconBus from '@/frontend/assets/ChatGPT Image Jun 10, 2026, 04_57_55 PM.png';    // Fallback

import { FeatureCardBig, CheckItem } from './components';

export function FeaturesSection({ lang, t }: { lang: 'mr' | 'en', t: any }) {
  return (
    <div id="features" className="scroll-mt-28 md:scroll-mt-32 bg-[#FCFCFC] flex flex-col relative pb-12 lg:pb-16">
      <div className="absolute inset-0 pointer-events-none opacity-[0.35] z-0" style={{ backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '36px 36px' }} />

      <section className="flex-1 w-full pt-20 px-6 max-w-[1280px] mx-auto relative z-10 flex flex-col items-center animate-reveal">
        {/* Top Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-10 h-[1px] bg-[#10A34A]"></div>
          <span className="text-[13px] md:text-[15px] font-bold text-[#10A34A] tracking-widest uppercase">{t.whyChooseUs}</span>
          <div className="w-10 h-[1px] bg-[#10A34A]"></div>
        </div>

        <h2 className="text-5xl md:text-7xl lg:text-[80px] font-bold font-display text-[#112233] mb-8 text-center leading-tight tracking-tight" style={lang === "mr" ? { fontFamily: "'Tiro Devanagari Marathi', serif" } : {}}>
          {t.titlePrefix} <span className="text-[#10A34A]">{t.titleHighlight}</span>
        </h2>

        <p className="text-[16px] md:text-[19px] text-slate-600 text-center max-w-3xl leading-relaxed whitespace-pre-line mb-16 md:mb-24 font-medium">
          {t.subtitle}
        </p>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 w-full mb-16 md:mb-24">
          <FeatureCardBig
            icon={<img src={iconShield} alt="Safe & Secure Travel" className="w-[160px] h-[160px] max-w-none object-contain mix-blend-multiply drop-shadow-md scale-[1.1] hover:scale-[1.15] transition-transform" />}
            title={t.card1Title}
            desc={t.card1Desc}
          />
          <FeatureCardBig
            icon={<img src={iconBus} alt="Comfortable AC Coaches" className="w-[160px] h-[160px] max-w-none object-contain mix-blend-multiply drop-shadow-md scale-[1.1] hover:scale-[1.15] transition-transform" />}
            title={t.card2Title}
            desc={t.card2Desc}
          />
          <FeatureCardBig
            icon={<img src={iconTag} alt="Best Price Guarantee" className="w-[160px] h-[160px] max-w-none object-contain mix-blend-multiply drop-shadow-md scale-[1.1] hover:scale-[1.15] transition-transform" />}
            title={t.card3Title}
            desc={t.card3Desc}
          />
          <FeatureCardBig
            icon={<img src={iconPin} alt="Curated Travel Experiences" className="w-[160px] h-[160px] max-w-none object-contain mix-blend-multiply drop-shadow-md scale-[1.1] hover:scale-[1.15] transition-transform" />}
            title={t.card4Title}
            desc={t.card4Desc}
          />
        </div>

        {/* Checkmarks */}
        <div className="flex flex-col md:flex-row flex-wrap justify-center items-start md:items-center gap-4 md:gap-6 mb-20 w-fit md:w-full max-w-5xl mx-auto">
          <CheckItem text={t.check1} />
          <CheckItem text={t.check2} />
          <CheckItem text={t.check3} />
          <CheckItem text={t.check4} />
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 md:gap-6 w-full max-w-md mx-auto sm:max-w-none">
          <a href="#about" className="flex w-full sm:w-[220px] items-center justify-center gap-2 bg-[#10A34A] hover:bg-[#0D8A3E] text-white rounded-lg px-6 py-4 text-[16px] font-semibold transition-all shadow-sm hover:shadow-[0_8px_20px_rgba(16,163,74,0.25)] hover:-translate-y-0.5">
            {t.btnExplore} <ArrowRight className="w-5 h-5" />
          </a>
          <a href="tel:+919876543210" className="flex w-full sm:w-[220px] items-center justify-center gap-2 bg-white border-2 border-[#10A34A] text-[#10A34A] hover:bg-[#10A34A]/5 rounded-lg px-6 py-4 text-[16px] font-semibold transition-all hover:shadow-sm hover:-translate-y-0.5">
            {t.btnContact} <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>
    </div>
  );
}
