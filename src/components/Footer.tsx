import React from 'react';
import { MessageCircle, Phone } from 'lucide-react';
import { CATEGORIES } from '../data/catalog.ts';
import { BrandMark, PaymentLogo } from './BrandMark.tsx';
import type { CategorySlug, PageView, PaymentMethodId } from '../types.ts';

interface FooterProps {
  onNavigate: (view: PageView) => void;
  onSelectCategory: (slug: CategorySlug) => void;
}

const ALL_PAYMENT_IDS: PaymentMethodId[] = [
  'visa',
  'mastercard',
  'meeza',
  'vodafone_cash',
  'orange_cash',
  'etisalat_cash',
  'we_pay',
  'instapay',
  'cod',
  'bank_transfer',
];

export const Footer: React.FC<FooterProps> = ({ onNavigate, onSelectCategory }) => {
  return (
    <footer className="border-t border-emerald-500/15 bg-[#040605] text-[#9DB0A4]">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-12">
          {/* Brand & Support */}
          <div className="lg:col-span-4">
            <BrandMark size="md" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#8FA396]">
              Discover Quality. Experience Innovation. Precision electronics, computing hardware,
              skeleton horology, and technical lifestyle essentials curated by ELYAN X.
            </p>

            <div className="mt-6 space-y-2.5 text-sm">
              <div className="flex items-center gap-2.5 text-[#F1F5F2]">
                <Phone className="h-4 w-4 text-[#10FF78]" />
                <a
                  href="tel:+201224595007"
                  className="font-mono font-semibold hover:text-[#10FF78] transition-colors"
                >
                  +201224595007
                </a>
              </div>
              <div>
                <a
                  href="https://wa.me/201224595007"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/25 bg-[#0A130E] px-3.5 py-2 text-xs font-semibold text-[#10FF78] hover:border-[#10FF78] transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>WhatsApp Customer Support</span>
                </a>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="mt-6 flex items-center gap-4 text-xs font-medium text-[#8FA396]">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#10FF78] transition-colors"
              >
                Instagram
              </a>
              <span aria-hidden="true">·</span>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#10FF78] transition-colors"
              >
                X / Twitter
              </a>
              <span aria-hidden="true">·</span>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#10FF78] transition-colors"
              >
                YouTube
              </a>
              <span aria-hidden="true">·</span>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#10FF78] transition-colors"
              >
                LinkedIn
              </a>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="lg:col-span-3">
            <h3 className="font-display text-sm font-semibold text-[#F1F5F2]">Navigation</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                { label: 'Homepage', view: 'home' as PageView },
                { label: 'Full Catalog', view: 'catalog' as PageView },
                { label: 'Track Order', view: 'track-order' as PageView },
                { label: 'Customer Account', view: 'account' as PageView },
                { label: 'About ELYAN X', view: 'about' as PageView },
                { label: 'Contact Us', view: 'contact' as PageView },
                { label: 'Privacy Policy', view: 'privacy' as PageView },
                { label: 'Terms & Conditions', view: 'terms' as PageView },
              ].map((link) => (
                <li key={link.view}>
                  <button
                    type="button"
                    onClick={() => onNavigate(link.view)}
                    className="text-left hover:text-[#10FF78] transition-colors cursor-pointer"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Product Categories */}
          <div className="lg:col-span-5">
            <h3 className="font-display text-sm font-semibold text-[#F1F5F2]">
              Product Categories
            </h3>
            <ul className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2.5 text-sm sm:grid-cols-2">
              {CATEGORIES.map((cat) => (
                <li key={cat.slug}>
                  <button
                    type="button"
                    onClick={() => onSelectCategory(cat.slug)}
                    className="text-left hover:text-[#10FF78] transition-colors cursor-pointer"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Payment Method Logos */}
        <div className="mt-12 border-t border-emerald-500/10 pt-8">
          <p className="text-xs font-medium text-[#7A8F82]">Supported Payment Networks</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {ALL_PAYMENT_IDS.map((pid) => (
              <PaymentLogo key={pid} id={pid} compact />
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-emerald-500/10 pt-6 text-xs text-[#7A8F82] sm:flex-row sm:items-center">
          <p>© 2026 ELYAN X. All Rights Reserved.</p>
          <p>Customer Support Hotline: +201224595007</p>
        </div>
      </div>
    </footer>
  );
};
