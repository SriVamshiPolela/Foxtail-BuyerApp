import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UPIApp      = 'GPay' | 'PhonePe' | 'Paytm' | 'BHIM' | 'UPI';
export type CardNetwork = 'visa' | 'mastercard' | 'rupay' | 'amex' | 'unknown';
export type CardType    = 'credit' | 'debit';

export interface SavedUPI {
  id:        string;
  upiId:     string;
  appName:   UPIApp;
  isDefault: boolean;
}

export interface SavedCard {
  id:           string;
  last4:        string;
  expiryMonth:  string;
  expiryYear:   string;
  holderName:   string;
  network:      CardNetwork;
  type:         CardType;
  isDefault:    boolean;
}

type PaymentStore = {
  // Server-backed state — hydrated from payment-svc on login
  upiIds:   SavedUPI[];
  cards:    SavedCard[];
  loading:  boolean;
  error:    string | null;

  // Client-only preference — stored in AsyncStorage only (not sensitive payment data)
  codEnabled: boolean;

  // Hydrate from API response (called after fetch)
  hydrate: (upiIds: SavedUPI[], cards: SavedCard[]) => void;

  // Optimistic local mutations (caller syncs to server separately)
  addUPILocally:    (upi: SavedUPI) => void;
  addCardLocally:   (card: SavedCard) => void;
  removeLocally:    (id: string) => void;
  setDefaultLocally:(id: string, type: 'upi' | 'card') => void;
  setLoading:       (v: boolean) => void;
  setError:         (msg: string | null) => void;
  clear:            () => void;

  toggleCOD: () => void;
};

export function detectUPIApp(upiId: string): UPIApp {
  const handle = upiId.split('@')[1]?.toLowerCase() ?? '';
  if (['okaxis', 'okhdfcbank', 'okicici', 'oksbi'].includes(handle)) return 'GPay';
  if (['ybl', 'ibl', 'axl'].includes(handle)) return 'PhonePe';
  if (['paytm', 'ptaxis', 'pthdfc'].includes(handle)) return 'Paytm';
  if (['upi', 'sbi', 'boi', 'bom'].includes(handle)) return 'BHIM';
  return 'UPI';
}

export function detectCardNetwork(firstDigit: string): CardNetwork {
  if (firstDigit === '4') return 'visa';
  if (firstDigit === '5') return 'mastercard';
  if (firstDigit === '6') return 'rupay';
  if (firstDigit === '3') return 'amex';
  return 'unknown';
}

export const usePaymentStore = create<PaymentStore>()(
  persist(
    (set) => ({
      upiIds:     [],
      cards:      [],
      loading:    false,
      error:      null,
      codEnabled: true,

      hydrate: (upiIds, cards) => set({ upiIds, cards, loading: false, error: null }),

      addUPILocally: (upi) =>
        set((s) => ({
          upiIds: upi.isDefault
            ? [...s.upiIds.map((u) => ({ ...u, isDefault: false })), upi]
            : [...s.upiIds, upi],
        })),

      addCardLocally: (card) =>
        set((s) => ({
          cards: card.isDefault
            ? [...s.cards.map((c) => ({ ...c, isDefault: false })), card]
            : [...s.cards, card],
        })),

      removeLocally: (id) =>
        set((s) => {
          const upiIds = s.upiIds.filter((u) => u.id !== id);
          const cards  = s.cards.filter((c) => c.id !== id);
          // Auto-promote next item to default if removed was default
          if (!upiIds.some((u) => u.isDefault) && upiIds.length > 0) {
            upiIds[0] = { ...upiIds[0]!, isDefault: true };
          }
          if (!cards.some((c) => c.isDefault) && cards.length > 0) {
            cards[0] = { ...cards[0]!, isDefault: true };
          }
          return { upiIds, cards };
        }),

      setDefaultLocally: (id, type) =>
        set((s) => ({
          upiIds: type === 'upi'
            ? s.upiIds.map((u) => ({ ...u, isDefault: u.id === id }))
            : s.upiIds,
          cards: type === 'card'
            ? s.cards.map((c) => ({ ...c, isDefault: c.id === id }))
            : s.cards,
        })),

      setLoading: (v) => set({ loading: v }),
      setError:   (msg) => set({ error: msg }),
      clear:      () => set({ upiIds: [], cards: [], loading: false, error: null }),

      toggleCOD: () => set((s) => ({ codEnabled: !s.codEnabled })),
    }),
    {
      name:    'hc-payment-prefs',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist client-side preference — payment methods come from the server
      partialize: (s) => ({ codEnabled: s.codEnabled }),
    }
  )
);
