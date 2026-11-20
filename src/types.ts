export type CategorySlug =
  | 'electronics'
  | 'mobile-phones'
  | 'computers-laptops'
  | 'gaming-accessories'
  | 'fashion-clothing'
  | 'watches'
  | 'home-lifestyle'
  | 'special-offers'
  | 'new-arrivals'
  | 'best-sellers';

export interface CategoryInfo {
  slug: CategorySlug;
  name: string;
  description: string;
  isCollection?: boolean;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: Exclude<CategorySlug, 'special-offers' | 'new-arrivals' | 'best-sellers'>;
  categoryLabel: string;
  collections: Array<'special-offers' | 'new-arrivals' | 'best-sellers'>;
  shortDescription: string;
  description: string;
  price: number;
  originalPrice?: number;
  availability: 'In Stock' | 'Limited Stock' | 'Pre-Order';
  stockCount: number;
  rating: number;
  reviewCount: number;
  image: string;
  variants: string[];
  specs: ProductSpec[];
}

export interface CartItem {
  product: Product;
  variant: string;
  quantity: number;
}

export interface Review {
  id: string;
  productId: string;
  authorName: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
}

export type PaymentMethodId =
  | 'cod'
  | 'visa'
  | 'mastercard'
  | 'meeza'
  | 'vodafone_cash'
  | 'orange_cash'
  | 'etisalat_cash'
  | 'we_pay'
  | 'instapay'
  | 'bank_transfer';

export interface PaymentProviderInfo {
  id: PaymentMethodId;
  name: string;
  category: 'Card' | 'Mobile Wallet' | 'Instant Transfer' | 'Cash';
  active: boolean;
  providerName: string;
  instructions: string;
  configurationHint: string;
}

export interface TrackingStep {
  title: string;
  detail: string;
  completed: boolean;
  timestamp?: string;
}

export interface OrderRecord {
  orderNumber: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  postalCode: string;
  items: Array<{
    productId: string;
    name: string;
    variant: string;
    quantity: number;
    unitPrice: number;
    image: string;
  }>;
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: PaymentMethodId;
  paymentMethodLabel: string;
  paymentStatus: 'Pending Collection' | 'Authorized' | 'Awaiting Verification';
  orderStatus: 'Confirmed' | 'Preparing Shipment' | 'In Transit' | 'Delivered';
  trackingSteps: TrackingStep[];
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
}

export type PageView =
  | 'home'
  | 'catalog'
  | 'product'
  | 'checkout'
  | 'track-order'
  | 'account'
  | 'about'
  | 'contact'
  | 'privacy'
  | 'terms';
