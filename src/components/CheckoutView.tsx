import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  ShieldAlert,
  Truck,
} from 'lucide-react';
import { PaymentLogo } from './BrandMark.tsx';
import type {
  CartItem,
  OrderRecord,
  PaymentMethodId,
  PaymentProviderInfo,
  UserProfile,
} from '../types.ts';

interface CheckoutViewProps {
  items: CartItem[];
  providers: PaymentProviderInfo[];
  user: UserProfile | null;
  authToken: string | null;
  onBackToShop: () => void;
  onOrderComplete: (order: OrderRecord) => void;
  onTrackOrder: (orderNumber: string) => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  items,
  providers,
  user,
  authToken,
  onBackToShop,
  onOrderComplete,
  onTrackOrder,
}) => {
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Cairo');
  const [postalCode, setPostalCode] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodId>('cod');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<OrderRecord | null>(null);

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal >= 250 || subtotal === 0 ? 0 : 18;
  const total = subtotal + shipping;

  const activeProvider = providers.find((p) => p.id === selectedMethod);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!activeProvider?.active) {
      setError('Please select an active, configured payment method.');
      return;
    }

    setSubmitting(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone,
          address,
          city,
          postalCode,
          paymentMethod: selectedMethod,
          items: items.map((i) => ({
            productId: i.product.id,
            variant: i.variant,
            quantity: i.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Checkout failed.');
      }
      setConfirmedOrder(data.order);
      onOrderComplete(data.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to place order.');
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmedOrder) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <div className="rounded-2xl border border-emerald-400/35 bg-[#0A110D] p-8 shadow-[0_0_40px_rgba(16,255,120,0.08)]">
          <div className="flex items-center gap-3 text-[#10FF78]">
            <CheckCircle2 className="h-7 w-7 shrink-0" />
            <div>
              <h1 className="font-display text-2xl font-bold text-[#F1F5F2]">
                Order #{confirmedOrder.orderNumber} Confirmed
              </h1>
              <p className="text-sm text-[#9DB0A4]">
                {confirmedOrder.orderStatus} — Preparing Shipment
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 border-y border-emerald-500/15 py-5 text-sm sm:grid-cols-3">
            <div>
              <span className="block text-xs text-[#7A8F82]">Recipient</span>
              <span className="mt-1 block font-medium text-[#F1F5F2]">
                {confirmedOrder.customerName}
              </span>
              <span className="block text-xs text-[#9DB0A4]">{confirmedOrder.customerPhone}</span>
            </div>
            <div>
              <span className="block text-xs text-[#7A8F82]">Delivery Destination</span>
              <span className="mt-1 block font-medium text-[#F1F5F2]">
                {confirmedOrder.address}
              </span>
              <span className="block text-xs text-[#9DB0A4]">
                {confirmedOrder.city}, {confirmedOrder.postalCode}
              </span>
            </div>
            <div>
              <span className="block text-xs text-[#7A8F82]">Payment & Total</span>
              <span className="mt-1 block font-medium text-[#F1F5F2]">
                {confirmedOrder.paymentMethodLabel}
              </span>
              <span className="block font-mono text-sm font-bold text-[#10FF78] tabular-nums">
                ${confirmedOrder.total.toLocaleString()} ({confirmedOrder.paymentStatus})
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {confirmedOrder.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span className="text-[#D2DDD5]">
                  {item.quantity} × {item.name} ({item.variant})
                </span>
                <span className="font-mono text-[#F1F5F2] tabular-nums">
                  ${(item.unitPrice * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onTrackOrder(confirmedOrder.orderNumber)}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-[#10FF78] px-6 text-sm font-semibold text-[#050706] hover:bg-[#34FF8F] cursor-pointer"
            >
              Track This Order
            </button>
            <button
              type="button"
              onClick={onBackToShop}
              className="inline-flex h-11 items-center justify-center rounded-lg border border-emerald-500/25 px-6 text-sm font-medium text-[#E2ECE5] hover:border-[#10FF78] cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <h1 className="font-display text-2xl font-bold text-[#F1F5F2]">Your Checkout Bag is Empty</h1>
        <p className="mt-2 text-sm text-[#92A699]">
          Add products from the ELYAN X storefront before proceeding to checkout.
        </p>
        <button
          type="button"
          onClick={onBackToShop}
          className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-[#10FF78] px-6 text-sm font-semibold text-[#050706] hover:bg-[#34FF8F] cursor-pointer"
        >
          Browse Collection
        </button>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onBackToShop}
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#9DB0A4] hover:text-[#10FF78] cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Return to Storefront</span>
      </button>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#F1F5F2]">Secure Checkout</h1>
          <p className="mt-1 text-sm text-[#92A699]">
            Encrypted order verification · Support hotline +201224595007
          </p>
        </div>
        <div className="inline-flex items-center gap-2 text-xs text-[#10FF78]">
          <Lock className="h-4 w-4" />
          <span>Server-verified pricing & provider status</span>
        </div>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-8">
          {/* Customer & Shipping Verification */}
          <div className="rounded-2xl border border-emerald-500/20 bg-[#0A0F0C] p-6 sm:p-7">
            <h2 className="font-display text-lg font-semibold text-[#F1F5F2]">
              1. Recipient & Delivery Verification
            </h2>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-[#9DB0A4]">Full Name *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Full legal name"
                  className="mt-1.5 h-11 w-full rounded-lg border border-emerald-500/20 bg-[#0F1612] px-3.5 text-sm text-[#F1F5F2] placeholder-[#687B6F] focus:border-[#10FF78] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#9DB0A4]">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+20 1XX XXX XXXX"
                  className="mt-1.5 h-11 w-full rounded-lg border border-emerald-500/20 bg-[#0F1612] px-3.5 text-sm text-[#F1F5F2] placeholder-[#687B6F] focus:border-[#10FF78] focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[#9DB0A4]">Email Address *</label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="mt-1.5 h-11 w-full rounded-lg border border-emerald-500/20 bg-[#0F1612] px-3.5 text-sm text-[#F1F5F2] placeholder-[#687B6F] focus:border-[#10FF78] focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[#9DB0A4]">Street Address *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Building, street, apartment or suite"
                  className="mt-1.5 h-11 w-full rounded-lg border border-emerald-500/20 bg-[#0F1612] px-3.5 text-sm text-[#F1F5F2] placeholder-[#687B6F] focus:border-[#10FF78] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#9DB0A4]">City / Governorate *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Cairo"
                  className="mt-1.5 h-11 w-full rounded-lg border border-emerald-500/20 bg-[#0F1612] px-3.5 text-sm text-[#F1F5F2] placeholder-[#687B6F] focus:border-[#10FF78] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#9DB0A4]">Postal Code *</label>
                <input
                  type="text"
                  required
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="11511"
                  className="mt-1.5 h-11 w-full rounded-lg border border-emerald-500/20 bg-[#0F1612] px-3.5 text-sm text-[#F1F5F2] placeholder-[#687B6F] focus:border-[#10FF78] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="rounded-2xl border border-emerald-500/20 bg-[#0A0F0C] p-6 sm:p-7">
            <h2 className="font-display text-lg font-semibold text-[#F1F5F2]">
              2. Payment Method & Provider Readiness
            </h2>
            <p className="mt-1 text-xs text-[#92A699]">
              Payment gateways activate automatically once their merchant credentials are configured in server secrets. Cash on Delivery is active immediately.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {providers.map((provider) => {
                const isSelected = selectedMethod === provider.id;
                return (
                  <button
                    key={provider.id}
                    type="button"
                    disabled={!provider.active}
                    onClick={() => setSelectedMethod(provider.id)}
                    className={`flex flex-col items-start justify-between rounded-xl border p-4 text-left transition-all ${
                      !provider.active
                        ? 'border-emerald-500/10 bg-[#070B08] opacity-65 cursor-not-allowed'
                        : isSelected
                        ? 'border-[#10FF78] bg-[#10FF78]/10 shadow-[0_0_20px_rgba(16,255,120,0.12)] cursor-pointer'
                        : 'border-emerald-500/20 bg-[#0D1410] hover:border-emerald-400/45 cursor-pointer'
                    }`}
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      <PaymentLogo id={provider.id} compact />
                      <span
                        className={`text-[11px] font-medium ${
                          provider.active ? 'text-[#10FF78]' : 'text-[#7A8F82]'
                        }`}
                      >
                        {provider.active ? 'Active' : 'Setup Required'}
                      </span>
                    </div>
                    <p className="mt-2.5 text-xs leading-relaxed text-[#9DB0A4]">
                      {provider.active ? provider.instructions : provider.configurationHint}
                    </p>
                  </button>
                );
              })}
            </div>

            {activeProvider && (
              <div className="mt-5 rounded-xl border border-emerald-500/20 bg-[#0D1410] p-4 text-xs text-[#B5C4BA]">
                <div className="flex items-center gap-2 font-semibold text-[#F1F5F2]">
                  {activeProvider.active ? (
                    <Truck className="h-4 w-4 text-[#10FF78]" />
                  ) : (
                    <ShieldAlert className="h-4 w-4 text-amber-300" />
                  )}
                  <span>{activeProvider.name} Instructions</span>
                </div>
                <p className="mt-1.5 leading-relaxed">{activeProvider.instructions}</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 rounded-2xl border border-emerald-500/20 bg-[#0A0F0C] p-6 sm:p-7">
            <h2 className="font-display text-lg font-semibold text-[#F1F5F2]">Order Summary</h2>
            <ul className="mt-4 divide-y divide-emerald-500/10">
              {items.map((item) => (
                <li
                  key={`${item.product.id}-${item.variant}`}
                  className="flex items-center justify-between gap-3 py-3 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="h-12 w-14 rounded object-cover border border-emerald-500/15"
                    />
                    <div>
                      <p className="font-medium text-[#F1F5F2]">{item.product.name}</p>
                      <p className="text-xs text-[#83998B]">
                        {item.variant} · Qty {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-sm text-[#F1F5F2] tabular-nums">
                    ${(item.product.price * item.quantity).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="mt-4 space-y-2.5 border-t border-emerald-500/15 pt-4 text-sm">
              <div className="flex justify-between text-[#9DB0A4]">
                <dt>Subtotal</dt>
                <dd className="font-mono tabular-nums">${subtotal.toLocaleString()}</dd>
              </div>
              <div className="flex justify-between text-[#9DB0A4]">
                <dt>Express Delivery</dt>
                <dd className="font-mono text-[#10FF78] tabular-nums">
                  {shipping === 0 ? 'Free' : `$${shipping}`}
                </dd>
              </div>
              <div className="flex justify-between border-t border-emerald-500/15 pt-3 text-base font-bold text-[#F1F5F2]">
                <dt>Total</dt>
                <dd className="font-mono text-lg text-[#10FF78] tabular-nums">
                  ${total.toLocaleString()}
                </dd>
              </div>
            </dl>

            {error && (
              <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-lg bg-[#10FF78] px-6 text-sm font-semibold text-[#050706] hover:bg-[#34FF8F] shadow-[0_0_24px_rgba(16,255,120,0.28)] disabled:opacity-60 transition-all cursor-pointer"
            >
              {submitting ? 'Confirming Order...' : `Confirm Order · $${total.toLocaleString()}`}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
};
