import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Check,
  MessageCircle,
  Phone,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import { BrandMark, PaymentLogo } from './components/BrandMark.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { CheckoutView } from './components/CheckoutView.tsx';
import { Footer } from './components/Footer.tsx';
import { Header } from './components/Header.tsx';
import { ProductCard } from './components/ProductCard.tsx';
import { ProductDetailView } from './components/ProductDetailView.tsx';
import {
  AboutView,
  AccountView,
  ContactView,
  LegalView,
  TrackOrderView,
} from './components/SecondaryViews.tsx';
import { CATEGORIES, HERO_SHOWCASE_IMAGE, INITIAL_REVIEWS, PRODUCTS } from './data/catalog.ts';
import type {
  CartItem,
  CategorySlug,
  OrderRecord,
  PageView,
  PaymentProviderInfo,
  Product,
  Review,
  UserProfile,
} from './types.ts';

export default function App() {
  const [currentView, setCurrentView] = useState<PageView>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeCategory, setActiveCategory] = useState<CategorySlug | 'all'>('all');
  const [homeTab, setHomeTab] = useState<'special-offers' | 'new-arrivals' | 'best-sellers'>(
    'special-offers'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>(
    'featured'
  );
  const [inStockOnly, setInStockOnly] = useState(false);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [reviewsByProduct, setReviewsByProduct] =
    useState<Record<string, Review[]>>(INITIAL_REVIEWS);
  const [paymentProviders, setPaymentProviders] = useState<PaymentProviderInfo[]>([]);
  const [trackingTargetOrder, setTrackingTargetOrder] = useState<string>('');

  useEffect(() => {
    fetch('/api/payment-providers')
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.providers)) setPaymentProviders(d.providers);
      })
      .catch(() => {});

    fetch('/api/reviews')
      .then((r) => r.json())
      .then((d) => {
        if (d.reviews && typeof d.reviews === 'object') setReviewsByProduct(d.reviews);
      })
      .catch(() => {});
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2600);
  };

  const navigateTo = (view: PageView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openCategory = (slug: CategorySlug | 'all') => {
    setActiveCategory(slug);
    setCurrentView('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openProductDetail = (product: Product) => {
    setSelectedProduct(product);
    navigateTo('product');
  };

  const addToCart = (product: Product, variant?: string, quantity = 1) => {
    const chosenVariant = variant || product.variants[0] || 'Standard';
    setCart((prev) => {
      const existing = prev.find(
        (i) => i.product.id === product.id && i.variant === chosenVariant
      );
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id && i.variant === chosenVariant
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { product, variant: chosenVariant, quantity }];
    });
    showToast(`Added ${product.name} to bag`);
  };

  const buyNow = (product: Product, variant?: string, quantity = 1) => {
    addToCart(product, variant, quantity);
    setCartOpen(false);
    navigateTo('checkout');
  };

  const updateCartQty = (productId: string, variant: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId && item.variant === variant
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeCartItem = (productId: string, variant: string) => {
    setCart((prev) =>
      prev.filter((item) => !(item.product.id === productId && item.variant === variant))
    );
  };

  const toggleWishlist = async (productId: string) => {
    if (authToken) {
      try {
        const res = await fetch('/api/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ productId }),
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data.productIds)) {
          setWishlistIds(data.productIds);
          showToast(
            data.productIds.includes(productId) ? 'Saved to wishlist' : 'Removed from wishlist'
          );
          return;
        }
      } catch {
        // Fallback to local state if network hiccups
      }
    }
    setWishlistIds((prev) => {
      const exists = prev.includes(productId);
      const next = exists ? prev.filter((id) => id !== productId) : [...prev, productId];
      showToast(exists ? 'Removed from wishlist' : 'Saved to wishlist');
      return next;
    });
  };

  const handleAuthSuccess = async (loggedUser: UserProfile, token: string) => {
    setUser(loggedUser);
    setAuthToken(token);
    showToast(`Welcome back, ${loggedUser.name}`);
    try {
      const res = await fetch('/api/wishlist', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.productIds)) {
        setWishlistIds((prev) => Array.from(new Set([...prev, ...data.productIds])));
      }
    } catch {
      // ignore
    }
  };

  const handleLogout = () => {
    setUser(null);
    setAuthToken(null);
    showToast('Signed out');
  };

  const handleSubmitReview = async (
    productId: string,
    payload: { authorName: string; rating: number; title: string; comment: string }
  ) => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authToken) headers.Authorization = `Bearer ${authToken}`;
    const res = await fetch(`/api/products/${encodeURIComponent(productId)}/reviews`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not publish review.');
    setReviewsByProduct((prev) => ({
      ...prev,
      [productId]: data.reviews,
    }));
  };

  const handleOrderComplete = (_order: OrderRecord) => {
    setCart([]);
  };

  const handleTrackOrder = (orderNumber: string) => {
    setTrackingTargetOrder(orderNumber);
    navigateTo('track-order');
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const filteredCatalog = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = PRODUCTS.filter((p) => {
      if (activeCategory !== 'all') {
        const isCollection =
          activeCategory === 'special-offers' ||
          activeCategory === 'new-arrivals' ||
          activeCategory === 'best-sellers';
        if (isCollection) {
          if (!p.collections.includes(activeCategory)) return false;
        } else if (p.category !== activeCategory) {
          return false;
        }
      }
      if (inStockOnly && p.availability !== 'In Stock') return false;
      if (q) {
        const hay = `${p.name} ${p.categoryLabel} ${p.shortDescription} ${p.sku}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    if (sortBy === 'price-asc') return [...list].sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') return [...list].sort((a, b) => b.price - a.price);
    if (sortBy === 'rating') return [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [activeCategory, inStockOnly, searchQuery, sortBy]);

  const homeFeaturedProducts = useMemo(() => {
    return PRODUCTS.filter((p) => p.collections.includes(homeTab)).slice(0, 6);
  }, [homeTab]);

  return (
    <div className="min-h-screen flex flex-col bg-[#050706] text-[#F1F5F2]">
      <Header
        currentView={currentView}
        onNavigate={navigateTo}
        cartCount={cartCount}
        wishlistCount={wishlistIds.length}
        onOpenCart={() => setCartOpen(true)}
        onSearchSubmit={(q) => {
          setSearchQuery(q);
          setActiveCategory('all');
          navigateTo('catalog');
        }}
        user={user}
      />

      <main className="flex-1">
        {/* -------------------- HOMEPAGE -------------------- */}
        {currentView === 'home' && (
          <>
            {/* Hero Section */}
            <section className="elyan-grid-bg relative overflow-hidden border-b border-emerald-500/15">
              <div className="mx-auto grid max-w-7xl grid-cols-1 items-stretch gap-10 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:py-20 lg:px-8">
                <div className="flex flex-col justify-center lg:col-span-6">
                  <div className="mb-6">
                    <BrandMark size="lg" />
                  </div>

                  <h1 className="font-display text-4xl font-extrabold tracking-tight text-[#F1F5F2] sm:text-5xl lg:text-[3.5rem] leading-[1.06] [text-wrap:balance]">
                    WELCOME TO <span className="text-[#10FF78]">ELYAN X</span>
                  </h1>

                  <p className="mt-4 font-display text-lg font-medium text-[#D2DDD5] sm:text-xl">
                    Discover Quality. Experience Innovation.
                  </p>

                  <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#92A699] sm:text-base">
                    Precision-engineered laptops, Grade-5 titanium mobile hardware, skeleton
                    chronographs, planar audio, and technical apparel curated under one dark-emerald
                    roof.
                  </p>

                  <div className="mt-8 flex flex-wrap items-center gap-3.5">
                    <button
                      type="button"
                      onClick={() => openCategory('all')}
                      className="inline-flex h-12 items-center gap-2.5 rounded-lg bg-[#10FF78] px-7 text-sm font-bold text-[#050706] hover:bg-[#34FF8F] shadow-[0_0_30px_rgba(16,255,120,0.3)] transition-all duration-200 cursor-pointer"
                    >
                      <span>SHOP NOW</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => openCategory('special-offers')}
                      className="inline-flex h-12 items-center gap-2 rounded-lg border border-emerald-500/30 bg-[#0A120D] px-6 text-sm font-semibold text-[#F1F5F2] hover:border-[#10FF78] hover:text-[#10FF78] transition-colors cursor-pointer"
                    >
                      <Sparkles className="h-4 w-4 text-[#10FF78]" />
                      <span>Special Offers</span>
                    </button>
                  </div>

                  {/* Direct Trust & Support Line */}
                  <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-emerald-500/15 pt-6 text-xs text-[#9DB0A4]">
                    <span>Insured Express Delivery</span>
                    <span aria-hidden="true">·</span>
                    <span>Cash on Delivery & Digital Wallets</span>
                    <span aria-hidden="true">·</span>
                    <a
                      href="tel:+201224595007"
                      className="font-mono font-semibold text-[#10FF78] hover:underline"
                    >
                      Support: +201224595007
                    </a>
                  </div>
                </div>

                {/* 16:9 Studio Hero Showcase */}
                <div className="lg:col-span-6 flex items-stretch">
                  <div className="relative w-full overflow-hidden rounded-2xl border border-emerald-500/25 bg-[#080C09] shadow-[0_0_60px_rgba(16,255,120,0.12)]">
                    <img
                      src={HERO_SHOWCASE_IMAGE}
                      alt="ELYAN X flagship laptop, titanium phone, planar headphones, and chronograph watch"
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover min-h-[280px]"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050706]/80 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-5 right-5 flex flex-wrap items-center justify-between gap-2 text-xs text-[#D2DDD5]">
                      <span className="font-medium">2026 Flagship Lineup</span>
                      <span className="font-mono text-[#10FF78]">10 Categories · Ready to Ship</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Featured Collections (Special Offers / New Arrivals / Best Sellers) */}
            <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div>
                  <h2 className="font-display text-2xl font-bold text-[#F1F5F2] sm:text-3xl">
                    Featured Curations
                  </h2>
                  <p className="mt-1.5 text-sm text-[#92A699]">
                    Explore limited-time markdowns, latest releases, and highest-rated flagships.
                  </p>
                </div>

                <div className="inline-flex flex-wrap gap-1 rounded-xl border border-emerald-500/15 bg-[#0B110D] p-1">
                  {[
                    { id: 'special-offers' as const, label: 'Special Offers' },
                    { id: 'new-arrivals' as const, label: 'New Arrivals' },
                    { id: 'best-sellers' as const, label: 'Best Sellers' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setHomeTab(tab.id)}
                      className={`h-9 rounded-lg px-4 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        homeTab === tab.id
                          ? 'bg-[#10FF78] text-[#050706]'
                          : 'text-[#A5B8AC] hover:text-[#F1F5F2]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {homeFeaturedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isWishlisted={wishlistIds.includes(product.id)}
                    onToggleWishlist={toggleWishlist}
                    onAddToCart={addToCart}
                    onBuyNow={buyNow}
                    onSelectProduct={openProductDetail}
                  />
                ))}
              </div>
            </section>

            {/* Organized Product Categories (All 10 Categories with dedicated sections) */}
            <section className="border-t border-emerald-500/15 bg-[#060907]">
              <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-[#F1F5F2] sm:text-3xl">
                      Shop by Category
                    </h2>
                    <p className="mt-1.5 text-sm text-[#92A699]">
                      Browse every ELYAN X division with direct pricing, stock status, and instant
                      checkout.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openCategory('all')}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#10FF78] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>Open Full Filterable Catalog</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                {/* Quick Jump Category Strip */}
                <div className="mt-6 flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <a
                      key={cat.slug}
                      href={`#cat-${cat.slug}`}
                      className="inline-flex h-9 items-center rounded-lg border border-emerald-500/20 bg-[#0B110D] px-3.5 text-xs font-medium text-[#C8D6CD] hover:border-[#10FF78] hover:text-[#10FF78] transition-colors whitespace-nowrap shrink-0"
                    >
                      {cat.name}
                    </a>
                  ))}
                </div>

                {/* Separate Organized Sections for Each of the 10 Categories */}
                <div className="mt-12 space-y-14">
                  {CATEGORIES.map((cat) => {
                    const catProducts = PRODUCTS.filter((p) =>
                      cat.isCollection
                        ? p.collections.includes(
                            cat.slug as 'special-offers' | 'new-arrivals' | 'best-sellers'
                          )
                        : p.category === cat.slug
                    ).slice(0, 3);

                    return (
                      <div
                        key={cat.slug}
                        id={`cat-${cat.slug}`}
                        className="scroll-mt-24 border-t border-emerald-500/10 pt-10 first:border-t-0 first:pt-0"
                      >
                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                          <div>
                            <h3 className="font-display text-xl font-bold text-[#F1F5F2]">
                              {cat.name}
                            </h3>
                            <p className="mt-1 text-sm text-[#8FA396]">{cat.description}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => openCategory(cat.slug)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#10FF78] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            <span>View {cat.name}</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                          {catProducts.map((product) => (
                            <ProductCard
                              key={`${cat.slug}-${product.id}`}
                              product={product}
                              isWishlisted={wishlistIds.includes(product.id)}
                              onToggleWishlist={toggleWishlist}
                              onAddToCart={addToCart}
                              onBuyNow={buyNow}
                              onSelectProduct={openProductDetail}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Payment Methods & Provider Readiness Section */}
            <section className="border-t border-emerald-500/15 bg-[#050706]">
              <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
                <div className="max-w-2xl">
                  <h2 className="font-display text-2xl font-bold text-[#F1F5F2] sm:text-3xl">
                    Payment Networks & Checkout Security
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-[#92A699]">
                    ELYAN X supports local and international cards, mobile wallets, InstaPay, bank
                    transfers, and Cash on Delivery. Payment channels activate strictly after their
                    provider credentials are configured.
                  </p>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  {paymentProviders.map((provider) => (
                    <div
                      key={provider.id}
                      className="flex flex-col justify-between rounded-xl border border-emerald-500/15 bg-[#0A0F0C] p-4"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <PaymentLogo id={provider.id} compact />
                        </div>
                        <p className="mt-3 text-xs leading-relaxed text-[#8FA396]">
                          {provider.instructions}
                        </p>
                      </div>
                      <div className="mt-4 border-t border-emerald-500/10 pt-2.5 text-[11px] font-medium">
                        {provider.active ? (
                          <span className="inline-flex items-center gap-1 text-[#10FF78]">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Active in Checkout
                          </span>
                        ) : (
                          <span className="text-[#7A8F82]">Provider Setup Required</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Customer Support & WhatsApp Section */}
            <section className="border-t border-emerald-500/15 bg-gradient-to-b from-[#07120C] to-[#050706]">
              <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-12 sm:px-6 lg:flex-row lg:items-center lg:px-8">
                <div>
                  <h2 className="font-display text-2xl font-bold text-[#F1F5F2]">
                    Direct Customer Support & Concierge
                  </h2>
                  <p className="mt-1.5 text-sm text-[#9DB0A4]">
                    Speak directly with an ELYAN X specialist for sizing, hardware specs, or order
                    verification on{' '}
                    <a
                      href="tel:+201224595007"
                      className="font-mono font-bold text-[#10FF78] hover:underline"
                    >
                      +201224595007
                    </a>
                    .
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href="https://wa.me/201224595007"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#10FF78] px-5 text-sm font-semibold text-[#050706] hover:bg-[#34FF8F] transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>WhatsApp Support</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => navigateTo('contact')}
                    className="inline-flex h-11 items-center gap-2 rounded-lg border border-emerald-500/30 bg-[#0A110D] px-5 text-sm font-semibold text-[#F1F5F2] hover:border-[#10FF78] transition-colors cursor-pointer"
                  >
                    <Phone className="h-4 w-4 text-[#10FF78]" />
                    <span>Contact Us Page</span>
                  </button>
                </div>
              </div>
            </section>
          </>
        )}

        {/* -------------------- CATALOG & FILTERS VIEW -------------------- */}
        {currentView === 'catalog' && (
          <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-4 border-b border-emerald-500/15 pb-6 lg:flex-row lg:items-end">
              <div>
                <h1 className="font-display text-3xl font-bold text-[#F1F5F2]">
                  {activeCategory === 'all'
                    ? 'Full ELYAN X Catalog'
                    : CATEGORIES.find((c) => c.slug === activeCategory)?.name || 'Catalog'}
                </h1>
                <p className="mt-1.5 text-sm text-[#92A699]">
                  {activeCategory === 'all'
                    ? 'Filter across all 10 curated divisions, search by model or SKU, and sort by price or rating.'
                    : CATEGORIES.find((c) => c.slug === activeCategory)?.description}
                </p>
              </div>
              <span className="font-mono text-xs text-[#8FA396] tabular-nums">
                {filteredCatalog.length} products shown
              </span>
            </div>

            {/* Filter & Search Toolbar */}
            <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6F8276]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, SKU, or category..."
                  className="h-11 w-full rounded-lg border border-emerald-500/20 bg-[#0A0F0C] pl-10 pr-4 text-sm text-[#F1F5F2] placeholder-[#687B6F] focus:border-[#10FF78] focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex h-11 items-center gap-2 rounded-lg border border-emerald-500/20 bg-[#0A0F0C] px-3.5 text-xs font-medium text-[#D2DDD5] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="accent-[#10FF78]"
                  />
                  <span>In Stock Only</span>
                </label>

                <div className="inline-flex h-11 items-center gap-2 rounded-lg border border-emerald-500/20 bg-[#0A0F0C] px-3">
                  <SlidersHorizontal className="h-4 w-4 text-[#10FF78]" />
                  <select
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(
                        e.target.value as 'featured' | 'price-asc' | 'price-desc' | 'rating'
                      )
                    }
                    aria-label="Sort products"
                    className="bg-transparent text-xs font-medium text-[#F1F5F2] focus:outline-none cursor-pointer"
                  >
                    <option value="featured" className="bg-[#0A0F0C]">
                      Sort: Featured
                    </option>
                    <option value="price-asc" className="bg-[#0A0F0C]">
                      Price: Low to High
                    </option>
                    <option value="price-desc" className="bg-[#0A0F0C]">
                      Price: High to Low
                    </option>
                    <option value="rating" className="bg-[#0A0F0C]">
                      Top Rated
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                className={`h-9 rounded-lg px-3.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeCategory === 'all'
                    ? 'bg-[#10FF78] text-[#050706]'
                    : 'border border-emerald-500/20 bg-[#0A0F0C] text-[#B5C4BA] hover:border-[#10FF78]/50'
                }`}
              >
                All Categories
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => setActiveCategory(cat.slug)}
                  className={`h-9 rounded-lg px-3.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeCategory === cat.slug
                      ? 'bg-[#10FF78] text-[#050706]'
                      : 'border border-emerald-500/20 bg-[#0A0F0C] text-[#B5C4BA] hover:border-[#10FF78]/50'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Product Grid */}
            {filteredCatalog.length === 0 ? (
              <div className="mt-10 rounded-2xl border border-emerald-500/15 bg-[#0A0F0C] p-12 text-center">
                <p className="font-display text-lg font-semibold text-[#F1F5F2]">
                  No matching products found
                </p>
                <p className="mt-1 text-sm text-[#8FA396]">
                  Try clearing your search query or switching to All Categories.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('all');
                    setInStockOnly(false);
                  }}
                  className="mt-5 h-10 rounded-lg bg-[#10FF78] px-5 text-xs font-semibold text-[#050706] cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredCatalog.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isWishlisted={wishlistIds.includes(product.id)}
                    onToggleWishlist={toggleWishlist}
                    onAddToCart={addToCart}
                    onBuyNow={buyNow}
                    onSelectProduct={openProductDetail}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* -------------------- PRODUCT DETAIL VIEW -------------------- */}
        {currentView === 'product' && selectedProduct && (
          <ProductDetailView
            product={selectedProduct}
            reviews={reviewsByProduct[selectedProduct.id] || []}
            isWishlisted={wishlistIds.includes(selectedProduct.id)}
            user={user}
            onBack={() => navigateTo('catalog')}
            onToggleWishlist={toggleWishlist}
            onAddToCart={addToCart}
            onBuyNow={buyNow}
            onSubmitReview={handleSubmitReview}
          />
        )}

        {/* -------------------- CHECKOUT VIEW -------------------- */}
        {currentView === 'checkout' && (
          <CheckoutView
            items={cart}
            providers={paymentProviders}
            user={user}
            authToken={authToken}
            onBackToShop={() => navigateTo('home')}
            onOrderComplete={handleOrderComplete}
            onTrackOrder={handleTrackOrder}
          />
        )}

        {/* -------------------- TRACK ORDER VIEW -------------------- */}
        {currentView === 'track-order' && (
          <TrackOrderView initialOrderNumber={trackingTargetOrder} />
        )}

        {/* -------------------- ACCOUNT & WISHLIST VIEW -------------------- */}
        {currentView === 'account' && (
          <AccountView
            user={user}
            authToken={authToken}
            wishlistIds={wishlistIds}
            onAuthSuccess={handleAuthSuccess}
            onLogout={handleLogout}
            onToggleWishlist={toggleWishlist}
            onAddToCart={(prod) => addToCart(prod)}
            onSelectProduct={openProductDetail}
            onTrackOrder={handleTrackOrder}
          />
        )}

        {/* -------------------- ABOUT US VIEW -------------------- */}
        {currentView === 'about' && <AboutView onNavigate={navigateTo} />}

        {/* -------------------- CONTACT US VIEW -------------------- */}
        {currentView === 'contact' && <ContactView />}

        {/* -------------------- PRIVACY & TERMS VIEWS -------------------- */}
        {currentView === 'privacy' && <LegalView type="privacy" />}
        {currentView === 'terms' && <LegalView type="terms" />}
      </main>

      <Footer onNavigate={navigateTo} onSelectCategory={openCategory} />

      <CartDrawer
        open={cartOpen}
        items={cart}
        onClose={() => setCartOpen(false)}
        onUpdateQty={updateCartQty}
        onRemoveItem={removeCartItem}
        onCheckout={() => {
          setCartOpen(false);
          navigateTo('checkout');
        }}
      />

      {/* Floating WhatsApp Support Button */}
      <a
        href="https://wa.me/201224595007"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp Customer Support +201224595007"
        className="fixed bottom-5 right-5 z-30 inline-flex h-12 items-center gap-2 rounded-xl border border-emerald-400/45 bg-[#07130C]/95 px-4 text-xs font-semibold text-[#10FF78] shadow-[0_8px_30px_rgba(0,0,0,0.65)] backdrop-blur-md hover:border-[#10FF78] hover:bg-[#0B1F14] transition-all"
      >
        <MessageCircle className="h-4 w-4 shrink-0" />
        <span className="hidden sm:inline">WhatsApp · +201224595007</span>
        <span className="sm:hidden">Support</span>
      </a>

      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-5 left-5 z-50 inline-flex items-center gap-2 rounded-xl border border-[#10FF78]/50 bg-[#08120C] px-4 py-3 text-xs font-semibold text-[#F1F5F2] shadow-2xl"
        >
          <Check className="h-4 w-4 text-[#10FF78]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
