import React, { useState, useEffect, useRef } from 'react';
import { Map, Users, Star } from 'lucide-react';
import { getPublicStatsFn } from '@/backend/shared/bookings';
import { highlightBrandName } from '@/frontend/core/BrandHighlight';

const AnimatedCounter = ({
  target,
  duration = 1500,
  suffix = "",
  decimals = 0,
}: {
  target: number;
  duration?: number;
  suffix?: string;
  decimals?: number;
}) => {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (elementRef.current) {
      observer.observe(elementRef.current);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasStarted) return;
    const start = 0;
    const end = target;
    const startTime = performance.now();
    let animationFrameId: number;

    const updateCount = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function: easeOutQuad
      const easeProgress = progress * (2 - progress);
      const currentValue = start + (end - start) * easeProgress;
      
      setCount(currentValue);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateCount);
      } else {
        setCount(end);
      }
    };

    animationFrameId = requestAnimationFrame(updateCount);
    return () => cancelAnimationFrame(animationFrameId);
  }, [hasStarted, target, duration]);

  return (
    <span ref={elementRef}>
      {count.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
};

export function AboutSection({ lang, t }: { lang: "mr" | "en"; t: any }) {
  const [stats, setStats] = useState({
    travelersCount: 0,
    packagesCount: 0,
    toursCount: 0,
    tripOptionsCount: 0,
    avgRating: 4.9,
  });

  useEffect(() => {
    getPublicStatsFn()
      .then((res) => {
        if (res) {
          setStats(res);
        }
      })
      .catch((err) => console.error("Failed to load statistics:", err));
  }, []);

  // Start at 1.5 in June 2026, and increase dynamically month-by-month (by 1/12th of a year each month).
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // June is 5
  const elapsedMonths = (currentYear - 2026) * 12 + (currentMonth - 5);
  const yearsOfExperience = (1.5 + elapsedMonths / 12).toFixed(1);
  const happyYatris = 150 + Math.max(0, stats.travelersCount - 121);
  // Current database count is 9 packages + tours. Start at 50, and increase as new ones are added.
  const currentDestinationsCount = stats.packagesCount + stats.toursCount;
  const sacredDestinations = 50 + Math.max(0, currentDestinationsCount - 9);

  return (
    <div id="about" className="scroll-mt-28 md:scroll-mt-32">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-brand-mist pt-20 pb-20 lg:pt-32 lg:pb-32">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-mist to-white pointer-events-none z-0" />

        {/* Minimal Diagonal Texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.25] mix-blend-multiply z-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40 L40 0' stroke='%2394A3B8' stroke-width='0.5' fill='none'/%3E%3C/svg%3E")`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Background Accents */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-brand-green/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-80 w-80 rounded-full bg-brand-blue/5 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-[1200px] px-6 text-center animate-reveal">
          <p className="flex items-center justify-center gap-3 text-[13px] md:text-[15px] font-bold tracking-[0.2em] text-brand-green-dark mb-6">
            <span className="h-px w-8 bg-brand-green" />
            {t.storyLabel}
            <span className="h-px w-8 bg-brand-green" />
          </p>
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-bold font-display text-brand-blue-deep leading-tight"
            style={lang === "mr" ? { fontFamily: "'Tiro Devanagari Marathi', serif" } : {}}
          >
            {t.heroHeadingPrefix} <br />
            <span className="text-brand-green-dark">{t.heroHeadingHighlight}</span>
          </h2>
          <div className="mx-auto mt-8 max-w-3xl text-[16px] leading-relaxed text-slate-600 md:text-[18px] space-y-6 text-justify sm:text-center">
            <p>{highlightBrandName(t.heroP1)}</p>
            <p>{highlightBrandName(t.heroP2)}</p>
            <p>{highlightBrandName(t.heroP3)}</p>
            <p>{highlightBrandName(t.heroP4)}</p>
          </div>
        </div>
      </section>

      {/* Stats/Highlight Section */}
      <section className="relative z-20 mx-auto -mt-16 max-w-[1200px] px-6">
        <div
          className="grid grid-cols-2 gap-4 md:grid-cols-4 animate-reveal"
          style={{ animationDelay: "0.2s" }}
        >
          {[
            { icon: <Map className="h-6 w-6" />, count: <AnimatedCounter target={sacredDestinations} suffix="+" />, label: t.statDestinations },
            { icon: <Users className="h-6 w-6" />, count: <AnimatedCounter target={happyYatris} suffix="+" />, label: t.statYatris },
            { icon: <Star className="h-6 w-6" />, count: <AnimatedCounter target={parseFloat(String(yearsOfExperience))} decimals={1} suffix="+" />, label: t.statExperience },
            { icon: <Star className="h-6 w-6" />, count: <AnimatedCounter target={stats.avgRating} decimals={1} suffix="/5" />, label: t.statRating },
          ].map((stat, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center rounded-3xl bg-white p-6 shadow-xl shadow-brand-blue/5 border border-slate-50 transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.03] hover:shadow-2xl hover:shadow-brand-blue/10 hover:border-brand-blue/10"
            >
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
