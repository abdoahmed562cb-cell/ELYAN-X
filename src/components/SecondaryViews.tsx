import React, { useEffect, useState } from 'react';
import {
  Check,
  CheckCircle2,
  Clock,
  Heart,
  LogOut,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  Search,
  ShieldCheck,
  ShoppingBag,
  User,
} from 'lucide-react';
import { PRODUCTS } from '../data/catalog.ts';
import { BrandMark } from './BrandMark.tsx';
import type { OrderRecord, PageView, Product, UserProfile } from '../types.ts';

/* -------------------- ORDER TRACKING VIEW -------------------- */
interface TrackOrderViewProps {
  initialOrderNumber?: string;
}

export const TrackOrderView: React.FC<TrackOrderViewProps> = ({ initialOrderNumber = '' }) => {
  const [query, setQuery] = useState(initialOrderNumber || 'ELX-2026-1042');
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const lookupOrder = async (targetNumber: string) => {
    const clean = targetNumber.trim().toUpperCase();
    if (!clean) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/orders/track/${encodeURIComponent(clean)}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Order not found.');
      }
      setOrder(data.order);
    } catch (err) {
      setOrder(null);
      setError(err instanceof Error ? err.message : 'Unable to locate order.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderNumber) {
      setQuery(initialOrderNumber);
      lookupOrder(initialOrderNumber);
    } else {
      lookupOrder('ELX-2026-1042');
    }
  }, [initialOrderNumber]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    lookupOrder(query);
  };

  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold text-[#F1F5F2] sm:text-4xl">
          Track Your Order
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-[#92A699]">
          Enter your ELYAN X order number to inspect live fulfillment checkpoints and courier
          dispatch status. Sample orders: <code className="font-mono text-[#10FF78]">ELX-2026-1042</code> or{' '}
          <code className="font-mono text-[#10FF78]">ELX-2026-1089</code>.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto mt-8 flex max-w-xl gap-2.5">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6F8276]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ELX-2026-1042"
            className="h-12 w-full rounded-lg border border-emerald-500/25 bg-[#0A100D] pl-10 pr-4 font-mono text-sm uppercase text-[#F1F5F2] placeholder-[#687B6F] focus:border-[#10FF78] focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="h-12 rounded-lg bg-[#10FF78] px-6 text-sm font-semibold text-[#050706] hover:bg-[#34FF8F] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          {loading ? 'Checking...' : 'Track Order'}
        </button>
      </form>

      {error && (
        <div className="mx-auto mt-6 max-w-xl rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center text-sm text-red-300">
          {error}
        </div>
      )}

      {order && (
        <div className="mt-10 rounded-2xl border border-emerald-500/20 bg-[#0A0F0C] p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-500/15 pb-5">
            <div>
              <span className="text-xs text-[#83998B]">Order Reference</span>
              <h2 className="mt-0.5 font-mono text-xl font-bold text-[#F1F5F2]">
                #{order.orderNumber}
              </h2>
            </div>
            <div className="text-right">
              <span className="text-xs text-[#83998B]">Current Status</span>
              <p className="mt-0.5 font-display text-base font-semibold text-[#10FF78]">
                {order.orderStatus}
              </p>
            </div>
          </div>

          {/* 4-Step Timeline */}
          <ol className="mt-7 space-y-5">
            {order.trackingSteps.map((step, idx) => (
              <li key={step.title} className="flex items-start gap-4">
                <div
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
                    step.completed
                      ? 'border-[#10FF78] bg-[#10FF78]/15 text-[#10FF78]'
                      : 'border-emerald-500/20 bg-[#0F1612] text-[#5B7063]'
                  }`}
                >
                  {step.completed ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <span className="font-mono text-xs">{idx + 1}</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3
                      className={`font-display text-sm font-semibold ${
                        step.completed ? 'text-[#F1F5F2]' : 'text-[#7A8F82]'
                      }`}
                    >
                      {step.title}
                    </h3>
                    {step.timestamp && (
                      <span className="font-mono text-xs text-[#7A8F82] tabular-nums">
                        {step.timestamp}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-[#92A699]">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>

          {/* Items & Destination */}
          <div className="mt-8 grid grid-cols-1 gap-6 border-t border-emerald-500/15 pt-6 sm:grid-cols-2">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#83998B]">
                Shipment Items
              </h3>
              <ul className="mt-3 space-y-2.5 text-sm">
                {order.items.map((item, idx) => (
                  <li key={idx} className="flex items-center justify-between gap-3">
                    <span className="text-[#D2DDD5]">
                      {item.quantity} × {item.name}
                    </span>
                    <span className="font-mono text-[#F1F5F2] tabular-nums">
                      ${(item.unitPrice * item.quantity).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-emerald-500/15 bg-[#0D1410] p-4 text-xs text-[#9DB0A4]">
              <p className="font-semibold text-[#F1F5F2]">Delivery Summary</p>
              <p className="mt-1.5">
                {order.customerName} · {order.city}, {order.postalCode}
              </p>
              <p className="mt-1">
                Payment: {order.paymentMethodLabel} ({order.paymentStatus})
              </p>
              <p className="mt-2 font-mono text-sm font-bold text-[#10FF78] tabular-nums">
                Total: ${order.total.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

/* -------------------- ACCOUNT & WISHLIST VIEW -------------------- */
interface AccountViewProps {
  user: UserProfile | null;
  authToken: string | null;
  wishlistIds: string[];
  onAuthSuccess: (user: UserProfile, token: string) => void;
  onLogout: () => void;
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  onTrackOrder: (orderNumber: string) => void;
}

export const AccountView: React.FC<AccountViewProps> = ({
  user,
  authToken,
  wishlistIds,
  onAuthSuccess,
  onLogout,
  onToggleWishlist,
  onAddToCart,
  onSelectProduct,
  onTrackOrder,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const wishlistedProducts = PRODUCTS.filter((p) => wishlistIds.includes(p.id));

  useEffect(() => {
    if (!authToken) {
      setOrders([]);
      return;
    }
    setLoadingOrders(true);
    fetch('/api/orders', {
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.orders)) setOrders(data.orders);
      })
      .catch(() => {})
      .finally(() => setLoadingOrders(false));
  }, [authToken]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body =
        mode === 'login' ? { email, password } : { name, email, phone, password };
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed.');
      }
      onAuthSuccess(data.user, data.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* Account Panel */}
        <div className="lg:col-span-5">
          {user ? (
            <div className="rounded-2xl border border-emerald-500/20 bg-[#0A0F0C] p-7">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-500/30 bg-[#10FF78]/10 text-[#10FF78]">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="font-display text-xl font-bold text-[#F1F5F2]">{user.name}</h1>
                    <p className="text-xs text-[#8FA396]">{user.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onLogout}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-emerald-500/20 px-3 text-xs font-medium text-[#B5C4BA] hover:border-red-400/50 hover:text-red-300 cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>

              <div className="mt-6 border-t border-emerald-500/15 pt-5 text-sm">
                <p className="text-xs text-[#7A8F82]">Member Phone</p>
                <p className="mt-1 font-mono text-[#F1F5F2]">{user.phone || 'Not provided'}</p>
              </div>

              {/* Order History */}
              <div className="mt-8 border-t border-emerald-500/15 pt-6">
                <h2 className="font-display text-base font-semibold text-[#F1F5F2]">
                  Your Order History
                </h2>
                {loadingOrders ? (
                  <p className="mt-3 text-xs text-[#8FA396]">Loading orders...</p>
                ) : orders.length === 0 ? (
                  <p className="mt-3 text-xs text-[#8FA396]">
                    No orders placed under this account yet.
                  </p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {orders.map((ord) => (
                      <li
                        key={ord.orderNumber}
                        className="flex items-center justify-between rounded-xl border border-emerald-500/15 bg-[#0D1410] p-4"
                      >
                        <div>
                          <p className="font-mono text-sm font-semibold text-[#F1F5F2]">
                            #{ord.orderNumber}
                          </p>
                          <p className="text-xs text-[#83998B]">
                            {ord.orderStatus} · ${ord.total.toLocaleString()}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onTrackOrder(ord.orderNumber)}
                          className="rounded-lg border border-emerald-500/30 px-3 py-1.5 text-xs font-medium text-[#10FF78] hover:bg-[#10FF78]/10 cursor-pointer"
                        >
                          Track
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-500/20 bg-[#0A0F0C] p-7">
              <h1 className="font-display text-2xl font-bold text-[#F1F5F2]">
                {mode === 'login' ? 'Customer Sign In' : 'Create ELYAN X Account'}
              </h1>
              <p className="mt-1.5 text-sm text-[#92A699]">
                Sync your wishlist, accelerate checkout, and inspect order history.
              </p>

              <div className="mt-5 grid grid-cols-2 gap-1 rounded-lg bg-[#0F1712] p-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError('');
                  }}
                  className={`h-9 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    mode === 'login'
                      ? 'bg-[#10FF78] text-[#050706]'
                      : 'text-[#A5B8AC] hover:text-[#F1F5F2]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError('');
                  }}
                  className={`h-9 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    mode === 'register'
                      ? 'bg-[#10FF78] text-[#050706]'
                      : 'text-[#A5B8AC] hover:text-[#F1F5F2]'
                  }`}
                >
                  Create Account
                </button>
              </div>

              <form onSubmit={handleAuthSubmit} className="mt-5 space-y-4">
                {mode === 'register' && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-[#9DB0A4]">Full Name</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        className="mt-1.5 h-11 w-full rounded-lg border border-emerald-500/20 bg-[#0F1612] px-3.5 text-sm text-[#F1F5F2] focus:border-[#10FF78] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#9DB0A4]">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+201224595007"
                        className="mt-1.5 h-11 w-full rounded-lg border border-emerald-500/20 bg-[#0F1612] px-3.5 text-sm text-[#F1F5F2] focus:border-[#10FF78] focus:outline-none"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-medium text-[#9DB0A4]">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="mt-1.5 h-11 w-full rounded-lg border border-emerald-500/20 bg-[#0F1612] px-3.5 text-sm text-[#F1F5F2] focus:border-[#10FF78] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#9DB0A4]">
                    Password {mode === 'register' && '(min 8 characters)'}
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-1.5 h-11 w-full rounded-lg border border-emerald-500/20 bg-[#0F1612] px-3.5 text-sm text-[#F1F5F2] focus:border-[#10FF78] focus:outline-none"
                  />
                </div>

                {error && <p className="text-xs text-red-400">{error}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="h-11 w-full rounded-lg bg-[#10FF78] px-4 text-sm font-semibold text-[#050706] hover:bg-[#34FF8F] transition-colors cursor-pointer"
                >
                  {submitting
                    ? 'Please wait...'
                    : mode === 'login'
                    ? 'Sign In to ELYAN X'
                    : 'Create Account'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Wishlist Panel */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-emerald-500/20 bg-[#0A0F0C] p-7">
            <div className="flex items-center justify-between gap-4 border-b border-emerald-500/15 pb-4">
              <div className="flex items-center gap-2.5">
                <Heart className="h-5 w-5 text-[#10FF78]" />
                <h2 className="font-display text-xl font-bold text-[#F1F5F2]">Saved Wishlist</h2>
              </div>
              <span className="font-mono text-xs text-[#8FA396] tabular-nums">
                {wishlistedProducts.length} saved
              </span>
            </div>

            {wishlistedProducts.length === 0 ? (
              <div className="py-12 text-center">
                <Heart className="mx-auto h-9 w-9 text-[#384C40]" />
                <p className="mt-3 text-sm font-medium text-[#F1F5F2]">Your wishlist is empty</p>
                <p className="mt-1 text-xs text-[#83998B]">
                  Tap the heart icon on any ELYAN X product to save it for later.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-emerald-500/10">
                {wishlistedProducts.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        onClick={() => onSelectProduct(item)}
                        className="h-20 w-24 shrink-0 cursor-pointer rounded-lg border border-emerald-500/15 object-cover"
                      />
                      <div>
                        <p className="text-xs text-[#83998B]">{item.categoryLabel}</p>
                        <button
                          type="button"
                          onClick={() => onSelectProduct(item)}
                          className="mt-0.5 text-left font-display text-base font-semibold text-[#F1F5F2] hover:text-[#10FF78] cursor-pointer"
                        >
                          {item.name}
                        </button>
                        <p className="mt-1 font-mono text-sm font-semibold text-[#10FF78] tabular-nums">
                          ${item.price.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => onAddToCart(item)}
                        className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#10FF78] px-4 text-xs font-semibold text-[#050706] hover:bg-[#34FF8F] cursor-pointer"
                      >
                        <ShoppingBag className="h-3.5 w-3.5" />
                        <span>Add to Cart</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onToggleWishlist(item.id)}
                        className="h-10 rounded-lg border border-emerald-500/20 px-3 text-xs text-[#9DB0A4] hover:border-red-400/40 hover:text-red-300 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

/* -------------------- ABOUT US VIEW -------------------- */
export const AboutView: React.FC<{ onNavigate: (view: PageView) => void }> = ({ onNavigate }) => {
  return (
    <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-emerald-500/20 bg-[#0A0F0C] p-8 sm:p-12">
        <BrandMark size="lg" />
        <h1 className="mt-6 font-display text-3xl font-bold text-[#F1F5F2] sm:text-4xl">
          Discover Quality. Experience Innovation.
        </h1>
        <p className="mt-4 text-base leading-relaxed text-[#A8BAB0]">
          ELYAN X is a futuristic luxury commerce house built around an uncompromising standard:
          every device, timepiece, acoustic instrument, and technical garment in our catalog must
          combine enduring industrial materials with forward-looking performance.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-6 border-t border-emerald-500/15 pt-8 sm:grid-cols-3">
          <div>
            <ShieldCheck className="h-6 w-6 text-[#10FF78]" />
            <h2 className="mt-3 font-display text-base font-semibold text-[#F1F5F2]">
              Verified Provenance
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-[#8FA396]">
              Every product undergoes serialized inspection prior to dispatch and carries full
              manufacturer & ELYAN X warranty protection.
            </p>
          </div>
          <div>
            <Package className="h-6 w-6 text-[#10FF78]" />
            <h2 className="mt-3 font-display text-base font-semibold text-[#F1F5F2]">
              Armored Fulfillment
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-[#8FA396]">
              Insured express courier delivery with live checkpoint tracking and Cash on Delivery
              package verification.
            </p>
          </div>
          <div>
            <Phone className="h-6 w-6 text-[#10FF78]" />
            <h2 className="mt-3 font-display text-base font-semibold text-[#F1F5F2]">
              Direct Concierge
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-[#8FA396]">
              Reach dedicated specialists directly at +201224595007 by phone or WhatsApp for
              technical guidance and post-purchase care.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => onNavigate('catalog')}
            className="h-11 rounded-lg bg-[#10FF78] px-6 text-sm font-semibold text-[#050706] hover:bg-[#34FF8F] cursor-pointer"
          >
            Explore All Categories
          </button>
          <button
            type="button"
            onClick={() => onNavigate('contact')}
            className="h-11 rounded-lg border border-emerald-500/25 px-6 text-sm font-medium text-[#F1F5F2] hover:border-[#10FF78] cursor-pointer"
          >
            Contact ELYAN X
          </button>
        </div>
      </div>
    </section>
  );
};

/* -------------------- CONTACT US VIEW -------------------- */
export const ContactView: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [ticketId, setTicketId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, subject, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to send message.');
      setTicketId(data.ticketId);
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send message.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h1 className="font-display text-3xl font-bold text-[#F1F5F2]">Contact Us</h1>
          <p className="mt-2 text-sm leading-relaxed text-[#92A699]">
            Our ELYAN X client specialists are available for product consultations, corporate
            procurement, order modifications, and warranty support.
          </p>

          <div className="mt-8 space-y-4">
            <div className="rounded-xl border border-emerald-500/20 bg-[#0A0F0C] p-5">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-[#10FF78]" />
                <div>
                  <p className="text-xs text-[#83998B]">Direct Customer Support Hotline</p>
                  <a
                    href="tel:+201224595007"
                    className="font-mono text-lg font-bold text-[#F1F5F2] hover:text-[#10FF78]"
                  >
                    +201224595007
                  </a>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-emerald-500/20 bg-[#0A0F0C] p-5">
              <div className="flex items-center gap-3">
                <MessageCircle className="h-5 w-5 text-[#10FF78]" />
                <div>
                  <p className="text-xs text-[#83998B]">Instant Messaging</p>
                  <p className="text-sm font-semibold text-[#F1F5F2]">
                    WhatsApp Concierge Support
                  </p>
                </div>
              </div>
              <a
                href="https://wa.me/201224595007"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#10FF78] px-4 text-xs font-semibold text-[#050706] hover:bg-[#34FF8F] transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Chat on WhatsApp (+201224595007)</span>
              </a>
            </div>

            <div className="rounded-xl border border-emerald-500/15 bg-[#0A0F0C] p-5 space-y-2.5 text-xs text-[#9DB0A4]">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#10FF78]" />
                <span>Daily Support Hours: 09:00 AM – 11:00 PM EET</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#10FF78]" />
                <span>ELYAN X Flagship Dispatch Hub · Cairo, Egypt</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-emerald-500/20 bg-[#0A0F0C] p-7 sm:p-8">
            <h2 className="font-display text-xl font-bold text-[#F1F5F2]">Send an Inquiry</h2>
            {ticketId ? (
              <div className="mt-6 rounded-xl border border-emerald-400/35 bg-[#10FF78]/10 p-6">
                <div className="flex items-center gap-2.5 text-[#10FF78]">
                  <Check className="h-5 w-5" />
                  <span className="font-display text-base font-semibold">
                    Message Received · Ticket #{ticketId}
                  </span>
                </div>
                <p className="mt-2 text-sm text-[#C8D6CD]">
                  Thank you for contacting ELYAN X. For immediate assistance, call or message us on
                  WhatsApp at <strong className="font-mono text-[#F1F5F2]">+201224595007</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => setTicketId('')}
                  className="mt-4 text-xs font-semibold text-[#10FF78] hover:underline cursor-pointer"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-[#9DB0A4]">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1.5 h-11 w-full rounded-lg border border-emerald-500/20 bg-[#0F1612] px-3.5 text-sm text-[#F1F5F2] focus:border-[#10FF78] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#9DB0A4]">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1.5 h-11 w-full rounded-lg border border-emerald-500/20 bg-[#0F1612] px-3.5 text-sm text-[#F1F5F2] focus:border-[#10FF78] focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-[#9DB0A4]">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-1.5 h-11 w-full rounded-lg border border-emerald-500/20 bg-[#0F1612] px-3.5 text-sm text-[#F1F5F2] focus:border-[#10FF78] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#9DB0A4]">Subject</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Order, specification, or warranty inquiry"
                      className="mt-1.5 h-11 w-full rounded-lg border border-emerald-500/20 bg-[#0F1612] px-3.5 text-sm text-[#F1F5F2] focus:border-[#10FF78] focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#9DB0A4]">Message *</label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-emerald-500/20 bg-[#0F1612] p-3.5 text-sm text-[#F1F5F2] focus:border-[#10FF78] focus:outline-none"
                  />
                </div>
                {error && <p className="text-xs text-red-400">{error}</p>}
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-12 w-full rounded-lg bg-[#10FF78] px-5 text-sm font-semibold text-[#050706] hover:bg-[#34FF8F] transition-colors cursor-pointer"
                >
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

/* -------------------- LEGAL PAGES -------------------- */
export const LegalView: React.FC<{ type: 'privacy' | 'terms' }> = ({ type }) => {
  const isPrivacy = type === 'privacy';
  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-emerald-500/20 bg-[#0A0F0C] p-8 sm:p-10">
        <h1 className="font-display text-3xl font-bold text-[#F1F5F2]">
          {isPrivacy ? 'Privacy Policy' : 'Terms & Conditions'}
        </h1>
        <p className="mt-2 text-xs text-[#7A8F82]">Effective Date: November 2026 · ELYAN X</p>

        <div className="mt-6 space-y-5 text-sm leading-relaxed text-[#A5B8AC]">
          {isPrivacy ? (
            <>
              <p>
                ELYAN X collects only the customer information strictly necessary to verify identity,
                process authorized orders, coordinate insured courier dispatch, and deliver order
                tracking updates.
              </p>
              <p>
                Account passwords are protected using salted cryptographic hashing. Payment gateway
                credentials and card details are never stored on ELYAN X application servers and are
                processed strictly through configured, PCI-compliant payment providers.
              </p>
              <p>
                To request account data review, updates, or removal, contact ELYAN X Support
                directly at +201224595007.
              </p>
            </>
          ) : (
            <>
              <p>
                By placing an order with ELYAN X, you confirm that all recipient, delivery address,
                and contact verification details are accurate. Orders are subject to stock
                availability and payment method verification.
              </p>
              <p>
                Online payment methods (Visa, Mastercard, Meeza, Mobile Wallets, InstaPay, and Bank
                Transfer) are enabled strictly after corresponding payment provider credentials are
                configured. Cash on Delivery orders include physical package inspection at handoff.
              </p>
              <p>
                Unopened hardware and unworn apparel may be returned within 14 days of delivery.
                For warranty claims or support, call +201224595007.
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
};
