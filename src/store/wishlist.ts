import { create } from 'zustand';

type WishlistStore = {
  favoriteIds: string[];
  toggleFavorite: (id: string) => void;
};

export const useWishlistStore = create<WishlistStore>((set) => ({
  favoriteIds: [],
  toggleFavorite: (id) =>
    set((s) => ({
      favoriteIds: s.favoriteIds.includes(id)
        ? s.favoriteIds.filter((fid) => fid !== id)
        : [...s.favoriteIds, id],
    })),
}));
