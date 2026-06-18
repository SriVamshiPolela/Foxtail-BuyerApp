import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserProfile, ServerAddress } from '@/services/user';

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

function computeInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

function formatMemberSince(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-IN', { month: 'short', year: 'numeric' }).format(new Date(iso));
  } catch {
    return '';
  }
}

type UserStore = {
  name: string;
  initials: string;
  phone: string;
  email: string;
  location: string;
  district: string;
  walletBalance: number;
  memberSince: string;
  orderCount: number;
  profileLoaded: boolean;
  addresses: Address[];
  selectedAddressId: string;

  setProfile: (profile: UserProfile) => void;
  clearProfile: () => void;
  setLocation: (location: string, district: string) => void;
  setOrderCount: (count: number) => void;
  setWalletBalance: (paise: number) => void;
  addToWallet: (amount: number) => void;
  hydrateAddresses: (serverAddresses: ServerAddress[]) => void;
  addAddress: (addr: Omit<Address, 'id'>, serverId?: string) => string;
  updateAddress: (id: string, patch: Partial<Omit<Address, 'id'>>) => void;
  deleteAddress: (id: string) => void;
  setSelectedAddress: (id: string) => void;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
  name:          '',
  initials:      '',
  phone:         '',
  email:         '',
  location:      'Kukatpally',
  district:      'Medchal District, Telangana',
  walletBalance: 0,
  memberSince:   '',
  orderCount:    0,
  profileLoaded: false,
  addresses:     [],
  selectedAddressId: '',

  setProfile: (profile) =>
    set((s) => ({
      name:          profile.name,
      initials:      computeInitials(profile.name),
      phone:         profile.phone,
      email:         profile.email ?? '',
      memberSince:   formatMemberSince(profile.createdAt),
      profileLoaded: true,
      // backfill name/phone on addresses loaded before profile resolved
      addresses: s.addresses.map((a) => ({
        ...a,
        name:  a.name  || profile.name,
        phone: a.phone || profile.phone,
      })),
    })),

  clearProfile: () =>
    set({
      name:          '',
      initials:      '',
      phone:         '',
      email:         '',
      memberSince:   '',
      orderCount:    0,
      walletBalance: 0,
      profileLoaded: false,
      addresses:     [],
      selectedAddressId: '',
    }),

  setLocation: (location, district) => set({ location, district }),
  setOrderCount: (count) => set({ orderCount: count }),
  setWalletBalance: (rupees) => set({ walletBalance: rupees }),
  addToWallet: (amount) => set((s) => ({ walletBalance: s.walletBalance + amount })),

  hydrateAddresses: (serverAddrs) =>
    set((s) => {
      const mapped: Address[] = serverAddrs.map((a) => ({
        id:        a.id,
        label:     (['Home', 'Work', 'Other'].includes(a.label) ? a.label : 'Other') as Address['label'],
        name:      s.name,
        phone:     s.phone,
        line1:     a.line1,
        line2:     a.line2 ?? '',
        city:      a.city,
        district:  a.district,
        state:     a.state,
        pincode:   a.pincode,
        isDefault: a.isDefault,
      }));
      const defaultId = mapped.find((a) => a.isDefault)?.id ?? mapped[0]?.id ?? '';
      return {
        addresses:        mapped,
        selectedAddressId:
          s.selectedAddressId && mapped.some((a) => a.id === s.selectedAddressId)
            ? s.selectedAddressId
            : defaultId,
      };
    }),

  addAddress: (addr, serverId?) => {
    const id = serverId ?? `addr-${Date.now()}`;
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
    }),
    {
      name: 'hc-user-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        location:          state.location,
        district:          state.district,
        addresses:         state.addresses,
        selectedAddressId: state.selectedAddressId,
      }),
    }
  )
);
