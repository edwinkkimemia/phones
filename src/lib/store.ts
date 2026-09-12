"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types";

interface CartState {
  items: CartItem[];
  promoCode?: string;
  discount: number;
  add: (item: CartItem) => void;
  remove: (productId: string, variantLabel?: string) => void;
  setQty: (productId: string, qty: number, variantLabel?: string) => void;
  clear: () => void;
  setPromo: (code: string | undefined, discount: number) => void;
  subtotal: () => number;
  count: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      discount: 0,
      add: (item) =>
        set((s) => {
          const key = (i: CartItem) =>
            `${i.productId}::${i.variantLabel ?? ""}`;
          const existing = s.items.find((i) => key(i) === key(item));
          if (existing) {
            return {
              items: s.items.map((i) =>
                key(i) === key(item) ? { ...i, qty: i.qty + item.qty } : i
              ),
            };
          }
          return { items: [...s.items, item] };
        }),
      remove: (productId, variantLabel) =>
        set((s) => ({
          items: s.items.filter(
            (i) =>
              !(
                i.productId === productId &&
                (i.variantLabel ?? "") === (variantLabel ?? "")
              )
          ),
        })),
      setQty: (productId, qty, variantLabel) =>
        set((s) => ({
          items:
            qty <= 0
              ? s.items.filter(
                  (i) =>
                    !(
                      i.productId === productId &&
                      (i.variantLabel ?? "") === (variantLabel ?? "")
                    )
                  )
              : s.items.map((i) =>
                  i.productId === productId &&
                  (i.variantLabel ?? "") === (variantLabel ?? "")
                    ? { ...i, qty }
                    : i
                ),
        })),
      clear: () => set({ items: [], discount: 0, promoCode: undefined }),
      setPromo: (promoCode, discount) => set({ promoCode, discount }),
      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
      count: () => get().items.reduce((sum, i) => sum + i.qty, 0),
    }),
    { name: "pl-cart-v1" }
  )
);

interface WishlistState {
  ids: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) =>
        set((s) => ({
          ids: s.ids.includes(id)
            ? s.ids.filter((x) => x !== id)
            : [...s.ids, id],
        })),
      has: (id) => get().ids.includes(id),
    }),
    { name: "pl-wishlist-v1" }
  )
);

interface CompareState {
  ids: string[];
  toggle: (id: string) => void;
  clear: () => void;
}

export const useCompare = create<CompareState>()(
  persist(
    (set) => ({
      ids: [],
      toggle: (id) =>
        set((s) => ({
          ids: s.ids.includes(id)
            ? s.ids.filter((x) => x !== id)
            : s.ids.length >= 4
              ? s.ids
              : [...s.ids, id],
        })),
      clear: () => set({ ids: [] }),
    }),
    { name: "pl-compare-v1" }
  )
);
