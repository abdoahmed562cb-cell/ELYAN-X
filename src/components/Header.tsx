import React, { useState } from 'react';
import { Heart, Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import { BrandMark } from './BrandMark.tsx';
import type { PageView, UserProfile } from '../types.ts';

interface HeaderProps {
  currentView: PageView;
  onNavigate: (view: PageView) => void;
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onSearchSubmit: (query: string) => void;
  user: UserProfile | null;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  cartCount,
  wishlistCount,
  onOpenCart,
  onSearchSubmit,
  user,
}) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: Array<{ label: string; view: PageView }> = [
    { label: 'Shop', view: 'home' },
    { label: 'Categories', view: 'catalog' },
    { label: 'Track Order', view: 'track-order' },
    { label: 'About', view: 'about' },
    { label: 'Support', view: 'contact' },
  ];

  const handleNav = (view: PageView) => {
    setMobileMenuOpen(false);
    onNavigate(view);
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit(searchText);
    setSearchOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-emerald-500/15 bg-[#050706]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          type="button"
          onClick={() => handleNav('home')}
          className="flex items-center whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#10FF78] cursor-pointer"
          aria-label="ELYAN X Home"
        >
          <BrandMark size="md" />
        </button>

        {/* Zone 2: 5 single-line navigation links */}
        <nav className="hidden lg:flex items-center gap-7" aria-label="Main navigation">
          {navItems.map((item) => {
            const active = currentView === item.view;
            return (
              <button
                key={item.view}
                type="button"
                onClick={() => handleNav(item.view)}
                className={`relative py-1 text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#10FF78] ${
                  active ? 'text-[#10FF78]' : 'text-[#B5C4BA] hover:text-[#F1F5F2]'
                }`}
              >
                {item.label}
                <span
                  className={`absolute inset-x-0 -bottom-0.5 h-px bg-[#10FF78] transition-transform duration-200 origin-left ${
                    active ? 'scale-x-100' : 'scale-x-0'
                  }`}
                />
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary action & compact utility controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setSearchOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-500/15 bg-[#0C120E] text-[#B5C4BA] hover:border-emerald-400/40 hover:text-[#10FF78] transition-colors cursor-pointer"
            aria-label="Search products"
            title="Search catalog"
          >
            <Search className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => handleNav('account')}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-500/15 bg-[#0C120E] text-[#B5C4BA] hover:border-emerald-400/40 hover:text-[#10FF78] transition-colors cursor-pointer"
            aria-label="Wishlist"
            title="Wishlist"
          >
            <Heart className="h-4 w-4" />
            {wishlistCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#10FF78] px-1 font-mono text-[10px] font-bold text-[#050706] tabular-nums">
                {wishlistCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleNav('account')}
            className="hidden sm:inline-flex h-10 items-center gap-2 rounded-lg border border-emerald-500/15 bg-[#0C120E] px-3 text-xs font-medium text-[#D2DDD5] hover:border-emerald-400/40 hover:text-[#10FF78] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <User className="h-4 w-4" />
            <span>{user ? user.name.split(' ')[0] : 'Account'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenCart}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#10FF78] px-3.5 text-xs font-semibold text-[#050706] hover:bg-[#34FF8F] shadow-[0_0_20px_rgba(16,255,120,0.22)] transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="tabular-nums">Bag ({cartCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="inline-flex lg:hidden h-10 w-10 items-center justify-center rounded-lg border border-emerald-500/15 bg-[#0C120E] text-[#D2DDD5] hover:text-[#10FF78] cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Expandable Search Bar */}
      {searchOpen && (
        <div className="border-t border-emerald-500/15 bg-[#070B08] px-4 py-3 sm:px-6 lg:px-8">
          <form onSubmit={submitSearch} className="mx-auto flex max-w-3xl items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7A8F82]" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search laptops, smartphones, planar audio, watches, jackets..."
                autoFocus
                className="h-11 w-full rounded-lg border border-emerald-500/25 bg-[#0C120E] pl-10 pr-4 text-sm text-[#F1F5F2] placeholder-[#6F8276] focus:border-[#10FF78] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="h-11 rounded-lg bg-[#10FF78] px-5 text-sm font-semibold text-[#050706] hover:bg-[#34FF8F] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>
      )}

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-emerald-500/15 bg-[#070B08] px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <button
                key={item.view}
                type="button"
                onClick={() => handleNav(item.view)}
                className={`flex h-11 items-center justify-between rounded-lg px-3 text-sm font-medium transition-colors cursor-pointer ${
                  currentView === item.view
                    ? 'bg-[#10FF78]/10 text-[#10FF78]'
                    : 'text-[#D2DDD5] hover:bg-[#0D1410]'
                }`}
              >
                <span>{item.label}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleNav('account')}
              className="flex h-11 items-center justify-between rounded-lg px-3 text-sm font-medium text-[#D2DDD5] hover:bg-[#0D1410] cursor-pointer"
            >
              <span>{user ? `Account (${user.name})` : 'Sign In / Account'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
