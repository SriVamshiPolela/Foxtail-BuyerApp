import { create } from 'zustand';

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
  setLocation: (location: string, district: string) => void;
  addToWallet: (amount: number) => void;
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

  setLocation: (location, district) => set({ location, district }),
  addToWallet: (amount) => set((s) => ({ walletBalance: s.walletBalance + amount })),
}));
