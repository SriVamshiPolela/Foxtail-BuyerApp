import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'hc_auth_session';

export interface AuthState {
  token: string | null;
  userId: string | null;
  userType: 'buyer' | 'seller' | null;
  sessionId: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  // phone held temporarily during the OTP step
  pendingPhone: string | null;
}

interface AuthActions {
  login(token: string, userId: string, userType: 'buyer' | 'seller', sessionId: string): Promise<void>;
  logout(): Promise<void>;
  setPendingPhone(phone: string): void;
  hydrate(): Promise<void>;
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  token:        null,
  userId:       null,
  userType:     null,
  sessionId:    null,
  isLoggedIn:   false,
  isLoading:    true,
  pendingPhone: null,

  login: async (token, userId, userType, sessionId) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ token, userId, userType, sessionId }));
    set({ token, userId, userType, sessionId, isLoggedIn: true });
  },

  logout: async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    set({ token: null, userId: null, userType: null, sessionId: null, isLoggedIn: false });
  },

  setPendingPhone: (phone) => set({ pendingPhone: phone }),

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const { token, userId, userType, sessionId } = JSON.parse(raw) as AuthState;
        if (token && userId) {
          set({ token, userId, userType, sessionId, isLoggedIn: true });
        }
      }
    } catch {
      // corrupted storage — start fresh
    } finally {
      set({ isLoading: false });
    }
  },
}));
