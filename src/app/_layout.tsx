import { Stack, DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
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
      </Stack>
    </ThemeProvider>
  );
}
