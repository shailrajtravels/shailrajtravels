import React, { useState, useEffect } from 'react';
import { Instagram, MapPin, Phone, Menu, X } from 'lucide-react';
import logo from '@/assets/logo11.png';
import { translations } from './i18n';

const NAV_KEYS = [
  "navHome",
  "navAbout",
  "navTours",
  "navPilgrimage",
  "navReviews",
  "navGallery",
  "navBlog",
  "navContact",
] as const;

export function Navbar({ t }: { t: typeof translations.mr }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 p-2 md:p-4 transition-all">
      <div
        className={`mx-auto flex max-w-[1600px] items-center justify-between rounded-2xl pl-2 pr-4 py-3 transition-all duration-200 md:pl-2 md:pr-6 md:py-4 ${isScrolled ? "bg-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-md" : "bg-transparent"
          }`}
      >

        {/* Left: Logo */}
        <div className="flex flex-1 justify-start">
          <a href="#" className="flex items-center gap-4 md:gap-4">
            <img src={logo} alt="Shailraj Travels Logo" className="mr-2 h-14 w-auto object-contain md:mr-4 md:h-16" />
            <span className="leading-tight">
              <span className="block font-display text-xl font-semibold text-red-600 md:text-2xl">
                Shailraj
              </span>
              <span className="block text-[8px] font-semibold uppercase tracking-[0.32em] text-brand-green md:text-[10px]">
                Travels
              </span>
            </span>
          </a>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden flex-[1.5] justify-center gap-4 xl:gap-8 lg:flex">
          {NAV_KEYS.map((key, i) => {
            const isAbout = key === "navAbout";
            const isFeatures = key === "navTours";
            const isHome = key === "navHome";
            const isPackages = key === "navPilgrimage";
            const isReviews = key === "navReviews";
            const isGallery = key === "navGallery";
            const isBlog = key === "navBlog";
            const isContact = key === "navContact";

            const className = `whitespace-nowrap text-[13px] xl:text-[14px] font-medium transition ${i === 0
              ? "text-brand-blue-deep"
              : "text-slate-700 hover:text-brand-blue"
              }`;

            if (isAbout || isHome || isFeatures || isPackages || isReviews || isGallery || isContact) {
              return (
                <a
                  key={key}
                  href={isHome ? "/" : isAbout ? "/#about" : isFeatures ? "/#features" : isPackages ? "/#tours" : isReviews ? "/#reviews" : isGallery ? "/#gallery" : "/#contact"}
                  className={className}
                >
                  {t[key]}
                </a>
              );
            }
            if (isBlog) {
              return (
                <a
                  key={key}
                  href="/blog"
                  className={className}
                >
                  {t[key]}
                </a>
              );
            }
            return (
              <a
                key={key}
                href="#"
                className={className}
              >
                {t[key]}
              </a>
            );
          })}
        </nav>

        {/* Right: 3 CTA Buttons */}
        <div className="flex flex-1 items-center justify-end gap-1.5 md:gap-3">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="flex h-10 w-10 items-center justify-center gap-2 rounded-xl bg-pink-50 text-[13px] font-semibold text-pink-600 transition hover:bg-pink-100 md:h-11 md:w-auto md:px-4"
            title="Instagram"
          >
            <Instagram className="h-4 w-4" />
            <span className="hidden xl:inline">Instagram</span>
          </a>

          <a
            href="tel:+919876543210"
            className="btn-cta flex h-10 w-10 items-center justify-center gap-2.5 rounded-xl text-sm font-semibold md:h-11 md:w-auto md:px-5"
          >
            <Phone className="h-4 w-4" />
            <span className="hidden md:inline">{t.callNow}</span>
          </a>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600 lg:hidden transition hover:bg-slate-100"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="absolute inset-x-2 top-full mt-2 rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 lg:hidden animate-reveal">
          <nav className="flex flex-col gap-5">
            {NAV_KEYS.map((key) => {
              const isAbout = key === "navAbout";
              const isFeatures = key === "navTours";
              const isHome = key === "navHome";
              const isPackages = key === "navPilgrimage";
              const isReviews = key === "navReviews";
              const isGallery = key === "navGallery";
              const isBlog = key === "navBlog";
              const isContact = key === "navContact";

              const className = "text-[16px] font-bold text-brand-blue-deep transition hover:text-brand-green";

              if (isAbout || isHome || isFeatures || isPackages || isReviews || isGallery || isContact) {
                return (
                  <a
                    key={key}
                    href={isHome ? "/" : isAbout ? "/#about" : isFeatures ? "/#features" : isPackages ? "/#tours" : isReviews ? "/#reviews" : isGallery ? "/#gallery" : "/#contact"}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={className}
                  >
                    {t[key]}
                  </a>
                );
              }
              if (isBlog) {
                return (
                  <a
                    key={key}
                    href="/blog"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={className}
                  >
                    {t[key]}
                  </a>
                );
              }
              return (
                <a
                  key={key}
                  href="#"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={className}
                >
                  {t[key]}
                </a>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}