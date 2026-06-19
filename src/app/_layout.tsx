import { useEffect } from 'react';
import { Stack, DarkTheme, DefaultTheme, ThemeProvider, useRouter, useSegments } from 'expo-router';
import { useColorScheme, View, ActivityIndicator } from 'react-native';
import { ThemePreferenceProvider, useThemePreference } from '@/context/theme-context';
import { LanguageProvider } from '@/context/language-context';
import * as Location from 'expo-location';

// AnimatedSplashOverlay disabled on dev build — re-enable for production
// import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { useAuthStore } from '@/store/auth';
import { useUserStore } from '@/store/user';
import { fetchUserProfile, fetchAddresses, fetchWallet } from '@/services/user';
import { fetchPaymentMethods } from '@/services/payment';
import { usePaymentStore } from '@/store/payment';
import { detectLocation } from '@/services/location';
import { fetchWishlist } from '@/services/wishlist';
import { fetchCart } from '@/services/cart';
import { useWishlistStore } from '@/store/wishlist';
import { useCartStore } from '@/store/cart';

function AuthGuard() {
  const router   = useRouter();
  const segments = useSegments();
  const { isLoggedIn, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = segments[0] === 'auth';
    if (!isLoggedIn && !inAuthGroup) {
      router.replace('/auth/login');
    } else if (isLoggedIn && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isLoggedIn, isLoading, segments]);

  return null;
}

export default function RootLayout() {
  return (
    <ThemePreferenceProvider>
      <LanguageProvider>
        <RootLayoutInner />
      </LanguageProvider>
    </ThemePreferenceProvider>
  );
}

function RootLayoutInner() {
  const colorScheme  = useColorScheme();
  const hydrate      = useAuthStore((s) => s.hydrate);
  const isLoading    = useAuthStore((s) => s.isLoading);
  const isLoggedIn   = useAuthStore((s) => s.isLoggedIn);
  const userId       = useAuthStore((s) => s.userId);
  const setProfile          = useUserStore((s) => s.setProfile);
  const setWalletBalance    = useUserStore((s) => s.setWalletBalance);
  const setLocation         = useUserStore((s) => s.setLocation);
  const hydrateAddresses    = useUserStore((s) => s.hydrateAddresses);
  const hydrateWishlist     = useWishlistStore((s) => s.hydrate);
  const hydrateCart         = useCartStore((s) => s.hydrate);
  const hydratePaymentStore = usePaymentStore((s) => s.hydrate);
  const clearPaymentStore   = usePaymentStore((s) => s.clear);
  const token           = useAuthStore((s) => s.token);

  useEffect(() => { hydrate(); }, []);

  useEffect(() => {
    if (!isLoggedIn || !userId) return;
    fetchUserProfile(userId).then(setProfile).catch(() => {});
    fetchAddresses(userId).then(hydrateAddresses).catch(() => {});
    fetchWallet(userId).then((w) => setWalletBalance(w.balance)).catch(() => {});
    fetchPaymentMethods(userId)
      .then(({ upiIds, cards }) => hydratePaymentStore(upiIds, cards))
      .catch(() => {});
  }, [isLoggedIn, userId]);

  useEffect(() => {
    if (!isLoggedIn) clearPaymentStore();
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn || !userId || !token) return;
    fetchWishlist(userId, token).then(hydrateWishlist).catch(() => {});
    fetchCart(userId, token).then(hydrateCart).catch(() => {});
  }, [isLoggedIn, userId, token]);

  useEffect(() => {
    if (!isLoggedIn) return;
    (async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status === 'denied') return;
        const result = await detectLocation();
        setLocation(result.locality, result.district);
      } catch {
        // silent — user can manually detect from Profile
      }
    })();
  }, [isLoggedIn]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#c75a28" />
      </View>
    );
  }

  const { scheme } = useThemePreference();

  return (
    <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthGuard />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth/login"    options={{ animation: 'fade' }} />
        <Stack.Screen name="auth/register" options={{ animation: 'fade' }} />
        <Stack.Screen name="auth/otp"      options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="search" />
        <Stack.Screen name="checkout" />
        <Stack.Screen name="order-confirmed" />
        <Stack.Screen name="product/[id]" />
        <Stack.Screen name="category/[id]" />
        <Stack.Screen name="order/[id]" />
        <Stack.Screen name="address-book" />
        <Stack.Screen name="address-form" />
        <Stack.Screen name="vendor/[id]" />
        <Stack.Screen name="vendors" />
        <Stack.Screen name="favorites" />
        <Stack.Screen name="location-picker" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="payments" />
        <Stack.Screen name="wallet" />
        <Stack.Screen name="referral" />
      </Stack>
    </ThemeProvider>
  );
}
