export type CategorySlug =
  | "laptops"
  | "desktops"
  | "iphones"
  | "phones"
  | "tablets"
  | "wearables"
  | "storage"
  | "laptop-bags"
  | "laptop-parts"
  | "phone-parts"
  | "accessories"
  | "gaming";

export type Condition = "NEW" | "PRE_OWNED" | "REFURBISHED";
export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "PREORDER";

export interface ProductImageT {
  url: string;
  alt: string;
}

export interface Spec {
  group: string;
  key: string;
  value: string;
}

export interface ProductT {
  id: string;
  slug: string;
  name: string;
  brand: string;
  brandSlug: string;
  category: CategorySlug;
  categoryLabel: string;
  tagline: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  condition: Condition;
  stockQty: number;
  stockStatus: StockStatus;
  rating: number;
  reviewCount: number;
  soldCount: number;
  isFeatured?: boolean;
  isDeal?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  images: ProductImageT[];
  specs: Spec[];
  variants?: { name: string; options: { value: string; priceDelta?: number }[] }[];
  seoTitle: string;
  seoDescription: string;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  brand: string;
  image: string;
  price: number;
  compareAtPrice?: number;
  qty: number;
  variantLabel?: string;
}

export interface CategoryT {
  slug: CategorySlug;
  name: string;
  tagline: string;
  description: string;
  image: string;
  count: number;
}

export interface OrderSummary {
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
}

export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "DISPATCHED"
  | "DELIVERED"
  | "CANCELLED";
