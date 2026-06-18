import { create } from 'zustand';
import { upsertCartItem, removeCartItem, clearCart as apiClearCart } from '@/services/cart';
import { useAuthStore } from '@/store/auth';
import type { CartItem, Product } from '@/types';

type CartStore = {
  items:    CartItem[];
  hydrated: boolean;
  hydrate:    (items: CartItem[]) => void;
  addItem:    (product: Product, qty?: number) => void;
  removeItem: (productId: string) => void;
  updateQty:  (productId: string, delta: number) => void;
  clearCart:  () => void;
};

export const useCartStore = create<CartStore>((set, get) => ({
  items:    [],
  hydrated: false,

  hydrate: (items) => set({ items, hydrated: true }),

  addItem: (product, qty = 1) => {
    set((s) => {
      const existing = s.items.find((i) => i.product.id === product.id);
      return existing
        ? { items: s.items.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + qty } : i) }
        : { items: [...s.items, { product, quantity: qty }] };
    });
    const { userId, token } = useAuthStore.getState();
    if (!userId || !token) return;
    const item = get().items.find((i) => i.product.id === product.id);
    if (item) upsertCartItem(userId, item, token).catch(() => {});
  },

  removeItem: (productId) => {
    set((s) => ({ items: s.items.filter((i) => i.product.id !== productId) }));
    const { userId, token } = useAuthStore.getState();
    if (userId && token) removeCartItem(userId, productId, token).catch(() => {});
  },

  updateQty: (productId, delta) => {
    set((s) => ({
      items: s.items.map((i) =>
        i.product.id === productId ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i,
      ),
    }));
    const { userId, token } = useAuthStore.getState();
    if (!userId || !token) return;
    const item = get().items.find((i) => i.product.id === productId);
    if (item) upsertCartItem(userId, item, token).catch(() => {});
  },

  clearCart: () => {
    set({ items: [] });
    const { userId, token } = useAuthStore.getState();
    if (userId && token) apiClearCart(userId, token).catch(() => {});
  },
}));

export const cartItemCount = (s: CartStore) => s.items.reduce((n, i) => n + i.quantity, 0);
export const cartSubtotal  = (s: CartStore) => s.items.reduce((n, i) => n + i.product.price * i.quantity, 0);
