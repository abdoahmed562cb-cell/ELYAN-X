import React, { useState } from 'react';
import { Heart, ShoppingBag, Star, Zap } from 'lucide-react';
import type { Product } from '../types.ts';

interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product, variant?: string) => void;
  onBuyNow: (product: Product, variant?: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onBuyNow,
  onSelectProduct,
}) => {
  const [imgError, setImgError] = useState(false);

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl bg-[#0B100D] elyan-glow-border hover:-translate-y-0.5">
      {/* Studio Image Area */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#070A08]">
        {!imgError ? (
          <button
            type="button"
            onClick={() => onSelectProduct(product)}
            className="block h-full w-full cursor-pointer focus-visible:outline-2 focus-visible:outline-[#10FF78]"
            aria-label={`View details for ${product.name}`}
          >
            <img
              src={product.image}
              alt={product.name}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="h-full w-full object-cover transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
            />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onSelectProduct(product)}
            className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#0A140E] to-[#050706] p-6 text-center cursor-pointer"
          >
            <span className="font-display text-sm font-semibold text-[#10FF78]">ELYAN X</span>
            <span className="mt-1 text-xs text-[#8FA396]">{product.name}</span>
          </button>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0B100D] via-[#0B100D]/30 to-transparent" />

        <button
          type="button"
          onClick={() => onToggleWishlist(product.id)}
          aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg border backdrop-blur-sm transition-colors cursor-pointer ${
            isWishlisted
              ? 'border-[#10FF78] bg-[#10FF78]/20 text-[#10FF78]'
              : 'border-white/15 bg-[#050706]/70 text-[#D2DDD5] hover:border-[#10FF78]/50 hover:text-[#10FF78]'
          }`}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-[#10FF78]' : ''}`} />
        </button>
      </div>

      {/* Product Info */}
      <div className="flex flex-1 flex-col p-5">
        {/* Unboxed Metadata Line (Zero-Pill Discipline) */}
        <div className="flex items-center gap-2 text-xs text-[#83998B]">
          <span className="truncate">{product.categoryLabel}</span>
          <span aria-hidden="true">·</span>
          <span className={product.availability === 'Limited Stock' ? 'text-amber-300' : 'text-[#10FF78]'}>
            {product.availability}
          </span>
          {discountPercent > 0 && (
            <>
              <span aria-hidden="true">·</span>
              <span className="font-mono font-medium text-[#10FF78]">Save {discountPercent}%</span>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => onSelectProduct(product)}
          className="mt-2 text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-[#10FF78]"
        >
          <h3 className="font-display text-base font-semibold leading-snug text-[#F1F5F2] group-hover:text-[#10FF78] transition-colors">
            {product.name}
          </h3>
        </button>

        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-[#92A699]">
          {product.shortDescription}
        </p>

        {/* Rating & Price Row */}
        <div className="mt-auto pt-4">
          <div className="flex items-baseline justify-between gap-3 border-t border-emerald-500/10 pt-3.5">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-lg font-semibold text-[#F1F5F2] tabular-nums">
                ${product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="font-mono text-xs text-[#6B7F73] line-through tabular-nums">
                  ${product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-[#9DB0A4] tabular-nums">
              <Star className="h-3.5 w-3.5 fill-[#10FF78] text-[#10FF78]" />
              <span className="font-medium text-[#E2ECE5]">{product.rating.toFixed(1)}</span>
              <span>({product.reviewCount})</span>
            </div>
          </div>

          {/* Primary Actions */}
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => onAddToCart(product)}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-emerald-500/25 bg-[#0F1712] px-3 text-xs font-semibold text-[#E6F0E9] hover:border-[#10FF78] hover:text-[#10FF78] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Add to Cart</span>
            </button>
            <button
              type="button"
              onClick={() => onBuyNow(product)}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-[#10FF78] px-3 text-xs font-semibold text-[#050706] hover:bg-[#34FF8F] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>Buy Now</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
