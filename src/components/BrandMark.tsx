import React from 'react';
import type { PaymentMethodId } from '../types.ts';

interface BrandMarkProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
}

export const BrandMark: React.FC<BrandMarkProps> = ({ size = 'md', showWordmark = true }) => {
  const iconDim = size === 'lg' ? 44 : size === 'sm' ? 26 : 32;
  const textClass =
    size === 'lg'
      ? 'text-2xl sm:text-3xl tracking-[0.18em]'
      : size === 'sm'
      ? 'text-base tracking-[0.16em]'
      : 'text-xl tracking-[0.18em]';

  return (
    <span className="inline-flex items-center gap-3 whitespace-nowrap shrink-0 select-none">
      <svg
        width={iconDim}
        height={iconDim}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0 drop-shadow-[0_0_12px_rgba(16,255,120,0.38)]"
      >
        <polygon
          points="24,3 43,13.5 43,34.5 24,45 5,34.5 5,13.5"
          stroke="#10FF78"
          strokeWidth="2"
          fill="#06140D"
        />
        <polygon
          points="24,8 38.5,16 38.5,32 24,40 9.5,32 9.5,16"
          stroke="rgba(16,255,120,0.28)"
          strokeWidth="1"
          fill="none"
        />
        <path
          d="M15.5 15.5L24 24M24 24L32.5 15.5M24 24L15.5 32.5M24 24L32.5 32.5"
          stroke="#10FF78"
          strokeWidth="2.6"
          strokeLinecap="square"
        />
        <circle cx="24" cy="24" r="2.2" fill="#F1F5F2" />
      </svg>
      {showWordmark && (
        <span className={`font-display font-bold text-[#F1F5F2] uppercase ${textClass}`}>
          ELYAN <span className="text-[#10FF78]">X</span>
        </span>
      )}
    </span>
  );
};

export const PaymentLogo: React.FC<{ id: PaymentMethodId; compact?: boolean }> = ({
  id,
  compact = false,
}) => {
  const baseBox = compact
    ? 'inline-flex items-center justify-center h-8 px-2.5 rounded border border-emerald-500/20 bg-[#0B120E] text-[11px] font-semibold tracking-wide text-[#E2ECE5]'
    : 'inline-flex items-center justify-center h-9 px-3 rounded-md border border-emerald-500/25 bg-[#0A110D] text-xs font-semibold tracking-wide text-[#F1F5F2]';

  switch (id) {
    case 'visa':
      return (
        <span className={baseBox}>
          <span className="font-display italic font-extrabold tracking-tight text-[#60A5FA]">
            VISA
          </span>
        </span>
      );
    case 'mastercard':
      return (
        <span className={`${baseBox} gap-1.5`}>
          <svg width="20" height="12" viewBox="0 0 24 14" aria-hidden="true">
            <circle cx="8" cy="7" r="6" fill="#EF4444" fillOpacity="0.9" />
            <circle cx="16" cy="7" r="6" fill="#F59E0B" fillOpacity="0.85" />
          </svg>
          <span>Mastercard</span>
        </span>
      );
    case 'meeza':
      return (
        <span className={baseBox}>
          <span className="font-display font-bold tracking-wider text-[#34D399]">MEEZA</span>
        </span>
      );
    case 'vodafone_cash':
      return (
        <span className={`${baseBox} gap-1.5`}>
          <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true">
            <circle cx="8" cy="8" r="7" fill="#EF4444" />
            <path d="M9.5 4.2C7.5 4.5 6 6.2 6 8.3c0 1.8 1.2 3.1 2.9 3.1 1.3 0 2.2-.9 2.2-2.1 0-1.1-.8-1.9-1.9-1.9-.5 0-.9.2-1.2.5.1-1.3.7-2.4 1.8-3.1l-.3-.6z" fill="#fff" />
          </svg>
          <span>Vodafone Cash</span>
        </span>
      );
    case 'orange_cash':
      return (
        <span className={`${baseBox} gap-1.5`}>
          <span className="inline-block w-2.5 h-2.5 bg-[#FB923C] rounded-xs" aria-hidden="true" />
          <span>Orange Cash</span>
        </span>
      );
    case 'etisalat_cash':
      return (
        <span className={`${baseBox} gap-1.5`}>
          <span className="inline-block w-2.5 h-2.5 bg-[#22C55E] rounded-xs" aria-hidden="true" />
          <span>Etisalat Cash</span>
        </span>
      );
    case 'we_pay':
      return (
        <span className={baseBox}>
          <span className="font-display font-bold text-[#C084FC]">WE Pay</span>
        </span>
      );
    case 'instapay':
      return (
        <span className={baseBox}>
          <span className="font-display font-bold tracking-tight text-[#38BDF8]">InstaPay</span>
        </span>
      );
    case 'cod':
      return (
        <span className={`${baseBox} gap-1.5 border-emerald-400/40`}>
          <span className="font-mono text-[#10FF78]">COD</span>
          <span>Cash on Delivery</span>
        </span>
      );
    case 'bank_transfer':
      return (
        <span className={baseBox}>
          <span>Bank Transfer</span>
        </span>
      );
  }
};
