import React, { useState } from 'react';
import {
  ArrowLeft,
  Check,
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  Zap,
} from 'lucide-react';
import type { Product, Review, UserProfile } from '../types.ts';

interface ProductDetailViewProps {
  product: Product;
  reviews: Review[];
  isWishlisted: boolean;
  user: UserProfile | null;
  onBack: () => void;
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product, variant: string, quantity: number) => void;
  onBuyNow: (product: Product, variant: string, quantity: number) => void;
  onSubmitReview: (
    productId: string,
    payload: { authorName: string; rating: number; title: string; comment: string }
  ) => Promise<void>;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  reviews,
  isWishlisted,
  user,
  onBack,
  onToggleWishlist,
  onAddToCart,
  onBuyNow,
  onSubmitReview,
}) => {
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0] || 'Standard');
  const [quantity, setQuantity] = useState(1);
  const [authorName, setAuthorName] = useState(user?.name || '');
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : product.rating;

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess(false);
    setSubmitting(true);
    try {
      await onSubmitReview(product.id, {
        authorName: authorName.trim() || user?.name || 'ELYAN X Customer',
        rating,
        title,
        comment,
      });
      setTitle('');
      setComment('');
      setReviewSuccess(true);
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : 'Unable to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onBack}
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#9DB0A4] hover:text-[#10FF78] transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Storefront</span>
      </button>

      {/* Main Split: Sticky Gallery Left + Contiguous Purchase Module Right */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-7 lg:sticky lg:top-24">
          <div className="overflow-hidden rounded-2xl border border-emerald-500/20 bg-[#0A0F0C]">
            <img
              src={product.image}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="rounded-2xl border border-emerald-500/20 bg-[#0A0F0C] p-6 sm:p-8">
            {/* Unboxed Metadata */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#83998B]">
              <span>{product.categoryLabel}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">{product.sku}</span>
              <span aria-hidden="true">·</span>
              <span className={product.availability === 'Limited Stock' ? 'text-amber-300' : 'text-[#10FF78]'}>
                {product.availability} ({product.stockCount} units)
              </span>
            </div>

            <h1 className="mt-3 font-display text-2xl font-bold leading-tight text-[#F1F5F2] sm:text-3xl">
              {product.name}
            </h1>

            <div className="mt-3 flex items-center gap-3 text-sm text-[#A5B8AC]">
              <div className="flex items-center gap-1 text-[#10FF78]">
                <Star className="h-4 w-4 fill-[#10FF78]" />
                <span className="font-mono font-semibold tabular-nums">{avgRating.toFixed(1)}</span>
              </div>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">
                {reviews.length || product.reviewCount} verified reviews
              </span>
            </div>

            <div className="mt-6 flex items-baseline gap-3 border-y border-emerald-500/15 py-4">
              <span className="font-mono text-3xl font-bold text-[#F1F5F2] tabular-nums">
                ${product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <>
                  <span className="font-mono text-base text-[#6B7F73] line-through tabular-nums">
                    ${product.originalPrice.toLocaleString()}
                  </span>
                  <span className="font-mono text-xs font-semibold text-[#10FF78]">
                    Save {discountPercent}%
                  </span>
                </>
              )}
            </div>

            <p className="mt-5 text-sm leading-relaxed text-[#B2C2B8]">{product.description}</p>

            {/* Variant Selector */}
            <div className="mt-6">
              <span className="block text-xs font-medium text-[#8FA396]">Configuration</span>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {product.variants.map((variant) => {
                  const selected = selectedVariant === variant;
                  return (
                    <button
                      key={variant}
                      type="button"
                      onClick={() => setSelectedVariant(variant)}
                      className={`h-10 rounded-lg border px-4 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        selected
                          ? 'border-[#10FF78] bg-[#10FF78]/15 text-[#10FF78]'
                          : 'border-emerald-500/20 bg-[#0F1612] text-[#C8D6CD] hover:border-emerald-400/40'
                      }`}
                    >
                      {variant}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Stepper */}
            <div className="mt-6 flex items-center justify-between">
              <span className="text-xs font-medium text-[#8FA396]">Quantity</span>
              <div className="inline-flex items-center rounded-lg border border-emerald-500/20 bg-[#0F1612]">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-10 w-10 items-center justify-center text-[#C8D6CD] hover:text-[#10FF78] cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center font-mono text-sm font-semibold text-[#F1F5F2] tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stockCount, q + 1))}
                  className="flex h-10 w-10 items-center justify-center text-[#C8D6CD] hover:text-[#10FF78] cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Primary Purchase Actions */}
            <div className="mt-6 flex flex-col gap-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => onAddToCart(product, selectedVariant, quantity)}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-emerald-500/30 bg-[#0F1712] px-5 text-sm font-semibold text-[#F1F5F2] hover:border-[#10FF78] hover:text-[#10FF78] transition-colors cursor-pointer"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Add to Cart</span>
                </button>
                <button
                  type="button"
                  onClick={() => onBuyNow(product, selectedVariant, quantity)}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#10FF78] px-5 text-sm font-semibold text-[#050706] hover:bg-[#34FF8F] shadow-[0_0_24px_rgba(16,255,120,0.28)] transition-all cursor-pointer"
                >
                  <Zap className="h-4 w-4" />
                  <span>Buy Now</span>
                </button>
              </div>
              <button
                type="button"
                onClick={() => onToggleWishlist(product.id)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-emerald-500/15 bg-transparent px-4 text-xs font-medium text-[#B5C4BA] hover:border-[#10FF78]/40 hover:text-[#10FF78] transition-colors cursor-pointer"
              >
                <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-[#10FF78] text-[#10FF78]' : ''}`} />
                <span>{isWishlisted ? 'Saved in Wishlist' : 'Save to Wishlist'}</span>
              </button>
            </div>

            {/* Assurance Points */}
            <div className="mt-6 space-y-2.5 border-t border-emerald-500/15 pt-5 text-xs text-[#9DB0A4]">
              <div className="flex items-center gap-2.5">
                <Truck className="h-4 w-4 shrink-0 text-[#10FF78]" />
                <span>Free insured express delivery on orders over $250</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 shrink-0 text-[#10FF78]" />
                <span>2-Year ELYAN X hardware warranty & serial verification</span>
              </div>
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="mt-6 rounded-2xl border border-emerald-500/15 bg-[#0A0F0C] p-6">
            <h2 className="font-display text-base font-semibold text-[#F1F5F2]">
              Technical Specifications
            </h2>
            <dl className="mt-4 divide-y divide-emerald-500/10 text-sm">
              {product.specs.map((spec) => (
                <div key={spec.label} className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-[#8FA396]">{spec.label}</dt>
                  <dd className="text-right font-mono text-xs font-medium text-[#F1F5F2] tabular-nums">
                    {spec.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Customer Reviews & Ratings */}
      <div className="mt-14 border-t border-emerald-500/15 pt-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="font-display text-2xl font-bold text-[#F1F5F2]">
              Customer Reviews & Ratings
            </h2>
            <p className="mt-2 text-sm text-[#92A699]">
              Verified owner feedback and acoustic, thermal, and daily-use ratings.
            </p>

            <form
              onSubmit={handleReviewSubmit}
              className="mt-6 rounded-xl border border-emerald-500/20 bg-[#0A0F0C] p-6 space-y-4"
            >
              <h3 className="font-display text-base font-semibold text-[#F1F5F2]">
                Write a Review
              </h3>

              <div>
                <label className="block text-xs font-medium text-[#9DB0A4]">Your Name</label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Enter your name"
                  className="mt-1.5 h-10 w-full rounded-lg border border-emerald-500/20 bg-[#0F1612] px-3 text-sm text-[#F1F5F2] placeholder-[#687B6F] focus:border-[#10FF78] focus:outline-none"
                />
              </div>

              <div>
                <span className="block text-xs font-medium text-[#9DB0A4]">Rating</span>
                <div className="mt-1.5 flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 cursor-pointer"
                      aria-label={`Rate ${star} stars`}
                    >
                      <Star
                        className={`h-5 w-5 ${
                          star <= rating ? 'fill-[#10FF78] text-[#10FF78]' : 'text-[#44574C]'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9DB0A4]">Headline</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Summarize your experience"
                  className="mt-1.5 h-10 w-full rounded-lg border border-emerald-500/20 bg-[#0F1612] px-3 text-sm text-[#F1F5F2] placeholder-[#687B6F] focus:border-[#10FF78] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9DB0A4]">Review</label>
                <textarea
                  rows={3}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details on build quality, performance, and finish..."
                  className="mt-1.5 w-full rounded-lg border border-emerald-500/20 bg-[#0F1612] p-3 text-sm text-[#F1F5F2] placeholder-[#687B6F] focus:border-[#10FF78] focus:outline-none"
                />
              </div>

              {reviewError && <p className="text-xs text-red-400">{reviewError}</p>}
              {reviewSuccess && (
                <p className="inline-flex items-center gap-1.5 text-xs text-[#10FF78]">
                  <Check className="h-4 w-4" /> Review published successfully.
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#10FF78] px-4 text-sm font-semibold text-[#050706] hover:bg-[#34FF8F] disabled:opacity-60 transition-colors cursor-pointer"
              >
                {submitting ? 'Publishing...' : 'Publish Review'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-4">
            {reviews.length === 0 ? (
              <div className="rounded-xl border border-emerald-500/15 bg-[#0A0F0C] p-8 text-center text-sm text-[#8FA396]">
                No reviews recorded yet for this configuration. Be the first owner to share a review.
              </div>
            ) : (
              reviews.map((rev) => (
                <article
                  key={rev.id}
                  className="rounded-xl border border-emerald-500/15 bg-[#0A0F0C] p-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-[#9DB0A4]">
                      <span className="font-semibold text-[#F1F5F2]">{rev.authorName}</span>
                      {rev.verifiedPurchase && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-[#10FF78]">Verified Owner</span>
                        </>
                      )}
                      <span aria-hidden="true">·</span>
                      <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          className={`h-3.5 w-3.5 ${
                            idx < rev.rating ? 'fill-[#10FF78] text-[#10FF78]' : 'text-[#394A40]'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <h4 className="mt-3 font-display text-base font-semibold text-[#F1F5F2]">
                    {rev.title}
                  </h4>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#A5B8AC]">{rev.comment}</p>
                </article>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
