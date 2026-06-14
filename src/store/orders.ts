import { create } from 'zustand';

import type { PlacedOrder, OrderStatus } from '@/types';

type OrdersStore = {
  orders: PlacedOrder[];
  placeOrder: (data: Omit<PlacedOrder, 'id' | 'date' | 'status'>) => string;
  getById: (id: string) => PlacedOrder | undefined;
};

export const useOrderStore = create<OrdersStore>((set, get) => ({
  orders: [],

  placeOrder: (data) => {
    const id = 'GS' + Date.now().toString().slice(-10);
    const order: PlacedOrder = {
      ...data,
      id,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      status: 'processing' as OrderStatus,
    };
    set((state) => ({ orders: [order, ...state.orders] }));
    return id;
  },

  getById: (id) => get().orders.find((o) => o.id === id),
}));
