import React from 'react';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import type { CartItem } from '../types.ts';

interface CartDrawerProps {
  open: boolean;
  items: CartItem[];
  onClose: () => void;
  onUpdateQty: (productId: string, variant: string, delta: number) => void;
  onRemoveItem: (productId: string, variant: string) => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  open,
  items,
  onClose,
  onUpdateQty,
  onRemoveItem,
  onCheckout,
}) => {
  if (!open) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const freeShippingThreshold = 250;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Shopping Bag">
      <div className="fixed inset-0 bg-black/75 backdrop-blur-xs" onClick={onClose} />

      <div className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-emerald-500/20 bg-[#080C0A] shadow-2xl">
        <div className="flex items-center justify-between border-b border-emerald-500/15 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="h-5 w-5 text-[#10FF78]" />
            <h2 className="font-display text-lg font-bold text-[#F1F5F2]">Shopping Bag</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-500/20 text-[#A5B8AC] hover:text-[#10FF78] cursor-pointer"
            aria-label="Close shopping bag"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Free Delivery Progress */}
        <div className="border-b border-emerald-500/10 bg-[#0B120E] px-6 py-3">
          <p className="text-xs text-[#A5B8AC]">
            {remainingForFreeShipping === 0 ? (
              <span className="text-[#10FF78] font-medium">
                Complimentary insured express delivery unlocked.
              </span>
            ) : (
              <span>
                Add <strong className="font-mono text-[#F1F5F2]">${remainingForFreeShipping}</strong> more for free express delivery.
              </span>
            )}
          </p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#16221B]">
            <div
              className="h-full bg-[#10FF78] transition-all duration-300"
              style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
            />
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <ShoppingBag className="h-10 w-10 text-[#42574B]" />
              <p className="mt-3 font-display text-base font-semibold text-[#F1F5F2]">
                Your bag is empty
              </p>
              <p className="mt-1 text-sm text-[#83998B]">
                Explore flagship hardware, watches, and technical apparel to begin.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-emerald-500/10">
              {items.map((item) => (
                <li
                  key={`${item.product.id}-${item.variant}`}
                  className="flex gap-4 py-4 first:pt-0"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    referrerPolicy="no-referrer"
                    className="h-20 w-24 shrink-0 rounded-lg border border-emerald-500/15 object-cover"
                  />
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-display text-sm font-semibold text-[#F1F5F2]">
                          {item.product.name}
                        </h3>
                        <p className="mt-0.5 text-xs text-[#83998B]">{item.variant}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.product.id, item.variant)}
                        className="text-[#6F8276] hover:text-red-400 transition-colors cursor-pointer"
                        aria-label={`Remove ${item.product.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="inline-flex items-center rounded-md border border-emerald-500/20 bg-[#0F1712]">
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.product.id, item.variant, -1)}
                          className="flex h-7 w-7 items-center justify-center text-[#C8D6CD] hover:text-[#10FF78] cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-7 text-center font-mono text-xs text-[#F1F5F2] tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.product.id, item.variant, 1)}
                          className="flex h-7 w-7 items-center justify-center text-[#C8D6CD] hover:text-[#10FF78] cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="font-mono text-sm font-semibold text-[#F1F5F2] tabular-nums">
                        ${(item.product.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer Checkout Action */}
        {items.length > 0 && (
          <div className="border-t border-emerald-500/15 bg-[#0A0F0C] p-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#9DB0A4]">Subtotal</span>
              <span className="font-mono text-lg font-bold text-[#F1F5F2] tabular-nums">
                ${subtotal.toLocaleString()}
              </span>
            </div>
            <p className="mt-1 text-xs text-[#7A8F82]">
              Shipping & payment verification calculated at secure checkout.
            </p>
            <button
              type="button"
              onClick={onCheckout}
              className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#10FF78] px-5 text-sm font-semibold text-[#050706] hover:bg-[#34FF8F] shadow-[0_0_24px_rgba(16,255,120,0.25)] transition-all cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
