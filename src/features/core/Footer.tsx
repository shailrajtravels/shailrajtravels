import React from 'react';
import { Phone, Mail, MapPin, Instagram, Facebook, Youtube } from 'lucide-react';
import { translations } from './i18n';

export function FooterSection({ t }: { t: typeof translations.mr }) {
  return (
    <footer id="contact" className="w-full bg-[#0a192f] text-white pt-20 pb-10 relative overflow-hidden scroll-mt-28 md:scroll-mt-32">
      <div className="mx-auto max-w-[1280px] px-6 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-y-10 gap-x-8 mb-16">

          {/* Brand & About */}
          <div className="sm:col-span-2 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <span className="leading-tight">
                <span className="block font-display text-2xl font-bold text-white">
                  Shailraj
                </span>
                <span className="block text-[10px] font-semibold uppercase tracking-[0.32em] text-brand-green">
                  Travels
                </span>
              </span>
            </div>
            <p className="text-slate-400 text-[15px] leading-relaxed">
              {t.footerAbout}
            </p>
            
            {/* Follow Us */}
            <div className="mt-2">
              <h3 className="text-lg font-bold font-display mb-4">Follow Us</h3>
              <div className="flex items-center gap-4 text-slate-400">
                <a href="#" className="hover:text-brand-green transition-colors" aria-label="Instagram"><Instagram className="w-5 h-5" /></a>
                <a href="#" className="hover:text-brand-green transition-colors" aria-label="Facebook"><Facebook className="w-5 h-5" /></a>
                <a href="#" className="hover:text-brand-green transition-colors" aria-label="YouTube"><Youtube className="w-6 h-6" /></a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-6">
            <h3 className="text-lg font-bold font-display">Quick Links</h3>
            <ul className="flex flex-col gap-4 text-slate-400 text-[15px]">
              <li><a href="/" className="hover:text-brand-green transition-colors">Home</a></li>
              <li><a href="/#about" className="hover:text-brand-green transition-colors">About</a></li>
              <li><a href="/tours" className="hover:text-brand-green transition-colors">Packages</a></li>
              <li><a href="/#gallery" className="hover:text-brand-green transition-colors">Gallery</a></li>
              <li><a href="/#reviews" className="hover:text-brand-green transition-colors">Reviews</a></li>
              <li><a href="/blog" className="hover:text-brand-green transition-colors">Blog</a></li>
              <li><a href="/contact" className="hover:text-brand-green transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Popular Tours */}
          <div className="flex flex-col gap-6">
            <h3 className="text-lg font-bold font-display">Popular Tours</h3>
            <ul className="flex flex-col gap-4 text-slate-400 text-[15px]">
              <li><a href="/tours/ashtavinayak-yatra" className="hover:text-brand-green transition-colors">Ashtavinayak</a></li>
              <li><a href="/tours/pandharpur-wari" className="hover:text-brand-green transition-colors">Pandharpur</a></li>
              <li><a href="/tours/jyotirlinga-darshan" className="hover:text-brand-green transition-colors">Jyotirling</a></li>
              <li><a href="/tours/char-dham-yatra" className="hover:text-brand-green transition-colors">Char Dham</a></li>
            </ul>
          </div>

          {/* Contact Us */}
          <div className="flex flex-col gap-6">
            <h3 className="text-lg font-bold font-display">Contact Us</h3>
            <ul className="flex flex-col gap-5 text-slate-400 text-[15px]">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-green shrink-0 mt-0.5" />
                <span>{t.footerAddress}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-brand-green shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-brand-green shrink-0" />
                <span>contact@shailrajtravels.com</span>
              </li>
            </ul>
          </div>

          {/* Legal & Security */}
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-6">
              <h3 className="text-lg font-bold font-display">Legal</h3>
              <ul className="flex flex-col gap-4 text-slate-400 text-[15px]">
                <li><a href="/privacy-policy" className="hover:text-brand-green transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-brand-green transition-colors">Terms & Conditions</a></li>
                <li><a href="/refund-policy" className="hover:text-brand-green transition-colors">Refund Policy</a></li>
                <li><a href="/cancellation-policy" className="hover:text-brand-green transition-colors">Cancellation Policy</a></li>
              </ul>
            </div>
            <div className="flex flex-col gap-6">
              <h3 className="text-lg font-bold font-display">Security</h3>
              <ul className="flex flex-col gap-4 text-slate-400 text-[15px]">
                <li><a href="#" className="hover:text-brand-green transition-colors">Security Policy</a></li>
                <li><a href="#" className="hover:text-brand-green transition-colors">Report Issue</a></li>
              </ul>
            </div>
          </div>

        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-[14px]">
          <p>© 2026 Shailraj Travels. All Rights Reserved.</p>
          <p>Designed & Developed by Axenor Studio</p>
        </div>
      </div>
    </footer>
  );
}