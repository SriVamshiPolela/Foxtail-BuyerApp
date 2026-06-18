import { create } from 'zustand';
import { addToWishlist, removeFromWishlist } from '@/services/wishlist';
import { useAuthStore } from '@/store/auth';

type WishlistStore = {
  favoriteIds: string[];
  hydrated:    boolean;
  hydrate:         (ids: string[]) => void;
  toggleFavorite:  (id: string) => void;
};

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  favoriteIds: [],
  hydrated:    false,

  hydrate: (ids) => set({ favoriteIds: ids, hydrated: true }),

  toggleFavorite: (id) => {
    const isFav = get().favoriteIds.includes(id);
    set((s) => ({
      favoriteIds: isFav
        ? s.favoriteIds.filter((fid) => fid !== id)
        : [...s.favoriteIds, id],
    }));
    const { userId, token } = useAuthStore.getState();
    if (!userId || !token) return;
    if (isFav) {
      removeFromWishlist(userId, id, token).catch(() => {});
    } else {
      addToWishlist(userId, id, token).catch(() => {});
    }
  },
}));
