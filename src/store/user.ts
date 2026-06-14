import { create } from 'zustand';

export interface Address {
  id: string;
  label: 'Home' | 'Work' | 'Other';
  name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

type UserStore = {
  name: string;
  initials: string;
  phone: string;
  location: string;
  district: string;
  walletBalance: number;
  memberSince: string;
  orderCount: number;
  wishlistCount: number;
  addresses: Address[];
  selectedAddressId: string;
  setLocation: (location: string, district: string) => void;
  addToWallet: (amount: number) => void;
  addAddress: (addr: Omit<Address, 'id'>) => string;
  updateAddress: (id: string, patch: Partial<Omit<Address, 'id'>>) => void;
  deleteAddress: (id: string) => void;
  setSelectedAddress: (id: string) => void;
};

export const useUserStore = create<UserStore>((set) => ({
  name: 'Rajesh Kumar',
  initials: 'RK',
  phone: '+91 98765 43210',
  location: 'Kukatpally',
  district: 'Medchal District, Telangana',
  walletBalance: 250,
  memberSince: 'Oct 2023',
  orderCount: 23,
  wishlistCount: 12,

  addresses: [
    {
      id: 'addr-1',
      label: 'Home',
      name: 'Rajesh Kumar',
      phone: '+91 98765 43210',
      line1: 'Plot 123, KPHB Colony',
      line2: 'Near Phase 7, Kukatpally',
      city: 'Hyderabad',
      district: 'Medchal District',
      state: 'Telangana',
      pincode: '500072',
      isDefault: true,
    },
  ],
  selectedAddressId: 'addr-1',

  setLocation: (location, district) => set({ location, district }),
  addToWallet: (amount) => set((s) => ({ walletBalance: s.walletBalance + amount })),

  addAddress: (addr) => {
    const id = `addr-${Date.now()}`;
    set((s) => {
      const existing = addr.isDefault
        ? s.addresses.map((a) => ({ ...a, isDefault: false }))
        : s.addresses;
      return {
        addresses: [...existing, { ...addr, id }],
        selectedAddressId: addr.isDefault ? id : s.selectedAddressId,
      };
    });
    return id;
  },

  updateAddress: (id, patch) =>
    set((s) => ({
      addresses: patch.isDefault
        ? s.addresses.map((a) =>
            a.id === id ? { ...a, ...patch } : { ...a, isDefault: false }
          )
        : s.addresses.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    })),

  deleteAddress: (id) =>
    set((s) => {
      const remaining = s.addresses.filter((a) => a.id !== id);
      const newSelected =
        s.selectedAddressId === id
          ? (remaining.find((a) => a.isDefault)?.id ?? remaining[0]?.id ?? '')
          : s.selectedAddressId;
      return { addresses: remaining, selectedAddressId: newSelected };
    }),

  setSelectedAddress: (id) => set({ selectedAddressId: id }),
}));
