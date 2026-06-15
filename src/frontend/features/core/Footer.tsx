import React from 'react';
import { Phone, Mail, MapPin, Instagram, Facebook, Youtube, ArrowRight } from 'lucide-react';
import { translations } from './i18n';

export function FooterSection({ t }: { t: typeof translations.mr }) {
  return (
    <footer id="contact" className="w-full bg-[#0a192f] text-slate-300 pt-20 pb-8 md:pt-24 md:pb-10 relative overflow-hidden scroll-mt-28 md:scroll-mt-32">
      {/* Premium subtle top gradient border */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-green/30 to-transparent" />
      
      {/* Background subtle glow effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[300px] bg-brand-green/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="mx-auto max-w-[1440px] px-6 md:px-10 relative z-10">
        {/* Main Grid: Custom 5-cols on desktop, 6-cols on tablet, 1 on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-6 xl:grid-cols-[2fr_1fr_1fr_1.5fr_1.5fr] gap-y-8 gap-x-8 xl:gap-x-16 mb-16 md:mb-20">

          {/* 1. Brand & About */}
          <div className="col-span-1 md:col-span-2 xl:col-span-1 flex flex-col items-center md:items-start text-center md:text-left gap-6 xl:pr-6">
            <div className="flex flex-col items-center md:items-start">
              <span className="leading-none">
                <span className="block font-display text-[32px] font-extrabold text-white tracking-tight">
                  Shailraj
                </span>
                <span className="block text-[11px] font-bold uppercase tracking-[0.35em] text-brand-green mt-1.5 ml-0.5">
                  Travels
                </span>
              </span>
            </div>
            <p className="text-slate-400 text-[15px] leading-relaxed max-w-sm md:max-w-none">
              {t.footerAbout}
            </p>
            
            {/* Follow Us */}
            <div className="mt-2 flex flex-col items-center md:items-start gap-4">
              <span className="text-[13px] font-bold text-white tracking-wider uppercase opacity-90">Follow Us</span>
              <div className="flex items-center gap-4">
                <a 
                  href="#" 
                  aria-label="Instagram"
                  className="w-10 h-10 rounded-full bg-slate-800/60 border border-slate-700/50 flex items-center justify-center text-slate-400 hover:bg-brand-green hover:border-brand-green hover:text-[#0a192f] hover:-translate-y-1 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a192f]"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a 
                  href="#" 
                  aria-label="Facebook"
                  className="w-10 h-10 rounded-full bg-slate-800/60 border border-slate-700/50 flex items-center justify-center text-slate-400 hover:bg-brand-green hover:border-brand-green hover:text-[#0a192f] hover:-translate-y-1 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a192f]"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a 
                  href="#" 
                  aria-label="YouTube"
                  className="w-10 h-10 rounded-full bg-slate-800/60 border border-slate-700/50 flex items-center justify-center text-slate-400 hover:bg-brand-green hover:border-brand-green hover:text-[#0a192f] hover:-translate-y-1 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a192f]"
                >
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* 2. Quick Links */}
          <div className="col-span-1 md:col-span-2 xl:col-span-1 flex flex-col gap-6">
            <h3 className="text-[17px] font-bold text-white font-display tracking-wide relative inline-block pb-2 self-start">
              Quick Links
              <span className="absolute bottom-0 left-0 w-8 h-[2px] bg-brand-green rounded-full"></span>
            </h3>
            <ul className="flex flex-col gap-3.5">
              {[
                { label: 'Home', href: '/' },
                { label: 'About', href: '/#about' },
                { label: 'Packages', href: '/tours' },
                { label: 'Gallery', href: '/#gallery' },
                { label: 'Reviews', href: '/#reviews' },
                { label: 'Blog', href: '/blog' },
                { label: 'Contact', href: '/contact' }
              ].map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href} 
                    className="group inline-flex items-center text-[15px] text-slate-400 hover:text-white transition-colors py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green rounded-sm"
                  >
                    <ArrowRight className="w-3.5 h-3.5 mr-2 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 text-brand-green transition-all duration-300" />
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Popular Tours */}
          <div className="col-span-1 md:col-span-2 xl:col-span-1 flex flex-col gap-6">
            <h3 className="text-[17px] font-bold text-white font-display tracking-wide relative inline-block pb-2 self-start">
              Popular Tours
              <span className="absolute bottom-0 left-0 w-8 h-[2px] bg-brand-green rounded-full"></span>
            </h3>
            <ul className="flex flex-col gap-3.5">
              {[
                { label: 'Ashtavinayak', href: '/tours/ashtavinayak-yatra' },
                { label: 'Pandharpur', href: '/tours/pandharpur-wari' },
                { label: 'Jyotirling', href: '/tours/jyotirlinga-darshan' },
                { label: 'Char Dham', href: '/tours/char-dham-yatra' }
              ].map((tour) => (
                <li key={tour.label}>
                  <a 
                    href={tour.href} 
                    className="group inline-flex items-center text-[15px] text-slate-400 hover:text-white transition-colors py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green rounded-sm"
                  >
                    <ArrowRight className="w-3.5 h-3.5 mr-2 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 text-brand-green transition-all duration-300" />
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{tour.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. Contact Us */}
          <div className="col-span-1 md:col-span-3 xl:col-span-1 flex flex-col gap-6">
            <h3 className="text-[17px] font-bold text-white font-display tracking-wide relative inline-block pb-2 self-start">
              Contact Us
              <span className="absolute bottom-0 left-0 w-8 h-[2px] bg-brand-green rounded-full"></span>
            </h3>
            <ul className="flex flex-col gap-5 text-[15px] text-slate-400">
              <li className="flex items-start gap-3.5 group">
                <div className="w-8 h-8 rounded-full bg-slate-800/50 flex items-center justify-center shrink-0 group-hover:bg-brand-green/20 transition-colors">
                  <MapPin className="w-4 h-4 text-brand-green" />
                </div>
                <span className="mt-1 leading-relaxed line-clamp-2">{t.footerAddress}</span>
              </li>
              <li className="flex items-center gap-3.5 group">
                <div className="w-8 h-8 rounded-full bg-slate-800/50 flex items-center justify-center shrink-0 group-hover:bg-brand-green/20 transition-colors">
                  <Phone className="w-4 h-4 text-brand-green" />
                </div>
                <a href="tel:+919876543210" className="whitespace-nowrap hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green rounded-sm">
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-center gap-3.5 group">
                <div className="w-8 h-8 rounded-full bg-slate-800/50 flex items-center justify-center shrink-0 group-hover:bg-brand-green/20 transition-colors">
                  <Mail className="w-4 h-4 text-brand-green" />
                </div>
                <a href="mailto:contact@shailrajtravels.com" className="whitespace-nowrap hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green rounded-sm overflow-hidden text-ellipsis">
                  contact@shailrajtravels.com
                </a>
              </li>
            </ul>
          </div>

          {/* 5. Legal & Security */}
          <div className="col-span-1 md:col-span-3 xl:col-span-1 flex flex-col gap-10">
            {/* Legal */}
            <div className="flex flex-col gap-6">
              <h3 className="text-[17px] font-bold text-white font-display tracking-wide relative inline-block pb-2 self-start">
                Legal
                <span className="absolute bottom-0 left-0 w-8 h-[2px] bg-brand-green rounded-full"></span>
              </h3>
              <ul className="flex flex-col gap-3.5">
                {[
                  { label: 'Privacy Policy', href: '/privacy-policy' },
                  { label: 'Terms & Conditions', href: '/terms' },
                  { label: 'Refund Policy', href: '/refund-policy' },
                  { label: 'Cancellation Policy', href: '/cancellation-policy' }
                ].map((link) => (
                  <li key={link.label}>
                    <a 
                      href={link.href} 
                      className="group inline-flex items-center text-[15px] text-slate-400 hover:text-white transition-colors py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green rounded-sm whitespace-nowrap"
                    >
                      <ArrowRight className="w-3.5 h-3.5 mr-2 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 text-brand-green transition-all duration-300 shrink-0" />
                      <span className="group-hover:translate-x-1 transition-transform duration-300">{link.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Security */}
            <div className="flex flex-col gap-6">
              <h3 className="text-[17px] font-bold text-white font-display tracking-wide relative inline-block pb-2 self-start">
                Security
                <span className="absolute bottom-0 left-0 w-8 h-[2px] bg-brand-green rounded-full"></span>
              </h3>
              <ul className="flex flex-col gap-3.5">
                {[
                  { label: 'Security Policy', href: '#' },
                  { label: 'Report Issue', href: '#' }
                ].map((link) => (
                  <li key={link.label}>
                    <a 
                      href={link.href} 
                      className="group inline-flex items-center text-[15px] text-slate-400 hover:text-white transition-colors py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green rounded-sm whitespace-nowrap"
                    >
                      <ArrowRight className="w-3.5 h-3.5 mr-2 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 text-brand-green transition-all duration-300 shrink-0" />
                      <span className="group-hover:translate-x-1 transition-transform duration-300">{link.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

        {/* Bottom Bar - Copyright */}
        <div className="border-t border-slate-800/80 pt-8 pb-4 flex flex-col md:flex-row items-center justify-between gap-4 text-[14px] text-slate-500 text-center md:text-left">
          <p className="font-medium tracking-wide">© {new Date().getFullYear()} Shailraj Travels. All Rights Reserved.</p>
          <p className="flex items-center gap-1.5">
            Designed & Developed by <span className="text-slate-300 font-semibold">Axenor Studio</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
