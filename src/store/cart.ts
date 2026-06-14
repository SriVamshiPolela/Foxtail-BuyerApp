import { create } from 'zustand';

import { products, initialCartProductIds } from '@/data/mock';
import type { CartItem, Product } from '@/types';

type CartStore = {
  items: CartItem[];
  addItem: (product: Product, qty?: number) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, delta: number) => void;
  clearCart: () => void;
};

const seedItems: CartItem[] = initialCartProductIds
  .map((id) => products.find((p) => p.id === id))
  .filter(Boolean)
  .map((p, i) => ({ product: p as Product, quantity: i === 1 ? 3 : i === 0 ? 2 : 1 }));

export const useCartStore = create<CartStore>((set) => ({
  items: seedItems,

  addItem: (product, qty = 1) =>
    set((state) => {
      const existing = state.items.find((i) => i.product.id === product.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.product.id === product.id ? { ...i, quantity: i.quantity + qty } : i,
          ),
        };
      }
      return { items: [...state.items, { product, quantity: qty }] };
    }),

  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((i) => i.product.id !== productId),
    })),

  updateQty: (productId, delta) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.product.id === productId
          ? { ...i, quantity: Math.max(1, i.quantity + delta) }
          : i,
      ),
    })),

  clearCart: () => set({ items: [] }),
}));

export const cartItemCount = (state: CartStore) =>
  state.items.reduce((sum, i) => sum + i.quantity, 0);

export const cartSubtotal = (state: CartStore) =>
  state.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
