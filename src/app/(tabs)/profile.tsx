import { useState, useCallback } from 'react';
import { ScrollView, View, Text, Pressable, TextInput, StyleSheet, Alert, ActivityIndicator, Platform, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';

import { PressableScale } from '@/components/pressable-scale';
import { AppSettingsModal } from '@/components/app-settings-modal';
import { useUserStore } from '@/store/user';
import { useCartStore, cartItemCount } from '@/store/cart';
import { useWishlistStore } from '@/store/wishlist';
import { useAuthStore } from '@/store/auth';
import { authService } from '@/services/auth';
import { detectLocation } from '@/services/location';
import { fetchOrders } from '@/services/orders';

const menuItems = [
  { icon: '📦', label: 'My Orders',        desc: 'Track your purchases',       badgeKey: 'orders' as const,   route: '/(tabs)/orders' as const },
  { icon: '🤍', label: 'Wishlist',          desc: 'Your saved items',           badgeKey: 'wishlist' as const, route: '/favorites' as const },
  { icon: '📍', label: 'Saved Addresses',   desc: 'Manage delivery locations',  route: '/address-book' as const },
  { icon: '💳', label: 'Payment Methods',   desc: 'Cards & UPI',               route: '/payments' as const },
  { icon: '👛', label: 'Harvest Wallet',    desc: 'Your balance',               badgeKey: 'wallet' as const, highlight: true, route: '/wallet' as const },
  { icon: '🎁', label: 'Refer & Earn',      desc: 'Get ₹100 per referral',        route: '/referral' as const },
  { icon: '🏪', label: 'Become a Seller',   desc: 'Start your local business' },
  { icon: '⚙️', label: 'Settings',          desc: 'App preferences' },
  { icon: '❓', label: 'Help & Support',    desc: 'FAQs and contact' },
];

export default function ProfileScreen() {
  const user          = useUserStore();
  const cartCount     = useCartStore(cartItemCount);
  const wishlistCount = useWishlistStore((s) => s.favoriteIds.length);
  const { logout: authLogout, sessionId, userId, token } = useAuthStore();
  const clearProfile  = useUserStore((s) => s.clearProfile);
  const setLocation   = useUserStore((s) => s.setLocation);
  const setOrderCount = useUserStore((s) => s.setOrderCount);

  useFocusEffect(
    useCallback(() => {
      if (!userId || !token) return;
      fetchOrders(userId, token)
        .then((orders) => setOrderCount(orders.length))
        .catch(() => {});
    }, [userId, token])
  );

  const [settingsVisible, setSettingsVisible] = useState(false);
  const [locLoading,   setLocLoading]   = useState(false);
  const [locError,     setLocError]     = useState<string | null>(null);
  const [manualMode,   setManualMode]   = useState(false);
  const [manualArea,   setManualArea]   = useState('');

  async function handleDetectLocation() {
    setLocLoading(true);
    setLocError(null);
    setManualMode(false);
    try {
      const result = await detectLocation();
      setLocation(result.locality, result.district);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not detect location';
      setLocError(msg);
      setManualMode(true);
    } finally {
      setLocLoading(false);
    }
  }

  function handleManualSave() {
    const area = manualArea.trim();
    if (!area) return;
    setLocation(area, user.district);
    setManualMode(false);
    setLocError(null);
    setManualArea('');
  }

  const getBadge = (key?: string) => {
    if (key === 'orders')   return `${user.orderCount} total`;
    if (key === 'wishlist') return `${wishlistCount} items`;
    if (key === 'wallet')   return `₹${user.walletBalance.toLocaleString('en-IN')}`;
    return undefined;
  };

  async function handleLogout() {
    if (Platform.OS === 'web') {
      if (!window.confirm('Are you sure you want to sign out?')) return;
      await doLogout();
    } else {
      Alert.alert('Sign out', 'Are you sure you want to sign out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign out', style: 'destructive', onPress: doLogout },
      ]);
    }
  }

  async function doLogout() {
    if (token && sessionId) {
      await authService.logout(sessionId, token).catch(() => {});
    }
    await authLogout();
    clearProfile();
    router.replace('/auth/login');
  }

  return (
    <ScrollView style={s.screen} showsVerticalScrollIndicator={false}>
      <AppSettingsModal visible={settingsVisible} onClose={() => setSettingsVisible(false)} />
      {/* Header */}
      <View style={s.header}>
        <SafeAreaView edges={['top']}>
          <View style={s.avatarRow}>
            <View style={s.avatarWrap}>
              <View style={s.avatar}>
                {user.profileLoaded
                  ? <Text style={s.avatarText}>{user.initials}</Text>
                  : <ActivityIndicator color="rgba(255,255,255,0.7)" />
                }
              </View>
            </View>
            <View style={{ flex: 1 }}>
              {user.profileLoaded ? (
                <>
                  <Text style={s.name}>{user.name}</Text>
                  <Text style={s.phone}>{user.phone}</Text>
                  {user.memberSince ? (
                    <Text style={s.since}>Member since {user.memberSince}</Text>
                  ) : null}
                </>
              ) : (
                <Text style={s.phone}>Loading profile…</Text>
              )}
            </View>
            <Pressable
              style={({ pressed }) => [s.editBtn, pressed && { opacity: 0.7, transform: [{ scale: 0.9 }] }]}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Text style={{ fontSize: 16 }}>✏️</Text>
            </Pressable>
          </View>

          {/* Stats */}
          <View style={s.statsRow}>
            <View style={s.stat}>
              <Text style={s.statVal}>{user.orderCount}</Text>
              <Text style={s.statLbl}>Orders</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.stat}>
              <Text style={s.statVal}>{wishlistCount}</Text>
              <Text style={s.statLbl}>Wishlist</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.stat}>
              <Text style={s.statVal}>₹{user.walletBalance.toLocaleString('en-IN')}</Text>
              <Text style={s.statLbl}>Wallet</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.stat}>
              <Text style={s.statVal}>{cartCount}</Text>
              <Text style={s.statLbl}>In Cart</Text>
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* Location Card */}
      <View style={s.locCardWrap}>
        <View style={s.locCard}>
          <View style={s.locRow}>
            <View style={s.locIcon}>
              {locLoading
                ? <ActivityIndicator size="small" color="#c75a28" />
                : <Text style={{ fontSize: 20 }}>📍</Text>
              }
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.locTitle}>Your Location</Text>
              <Text style={s.locSub} numberOfLines={1}>{user.location}, {user.district}</Text>
            </View>
            <Pressable
              onPress={handleDetectLocation}
              disabled={locLoading}
              style={({ pressed }) => [s.detectBtn, pressed && { opacity: 0.7 }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={s.detectBtnTxt}>{locLoading ? '…' : '⟳ Detect'}</Text>
            </Pressable>
          </View>

          {locError && (
            <View style={s.locErrBox}>
              <Text style={s.locErrTxt}>{locError}</Text>
              {locError.includes('Settings') && (
                <Pressable
                  onPress={() => Linking.openSettings()}
                  style={({ pressed }) => [s.settingsLink, pressed && { opacity: 0.7 }]}
                >
                  <Text style={s.settingsLinkTxt}>Open Settings →</Text>
                </Pressable>
              )}
            </View>
          )}

          {manualMode && (
            <View style={s.manualRow}>
              <TextInput
                style={s.manualInput}
                value={manualArea}
                onChangeText={setManualArea}
                placeholder="Type your area or city…"
                placeholderTextColor="#9ca3af"
                returnKeyType="done"
                onSubmitEditing={handleManualSave}
                autoFocus
              />
              <Pressable
                onPress={handleManualSave}
                style={({ pressed }) => [s.manualSaveBtn, pressed && { opacity: 0.7 }]}
              >
                <Text style={s.manualSaveTxt}>Save</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>

      {/* Menu Items */}
      <View style={s.menuSection}>
        {menuItems.map((item, i) => {
          const badge = getBadge(item.badgeKey);
          return (
            <PressableScale key={i} style={[s.menuItem, item.highlight && s.menuItemHL]} scale={0.985} onPress={item.label === 'Settings' ? () => setSettingsVisible(true) : item.route ? () => router.push(item.route!) : undefined}>
              <View style={[s.menuIcon, item.highlight && s.menuIconHL]}>
                <Text style={{ fontSize: 18 }}>{item.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.menuLabel, item.highlight && { color: '#c75a28' }]}>{item.label}</Text>
                <Text style={s.menuDesc}>{item.desc}</Text>
              </View>
              {badge && (
                <View style={[s.badge, item.highlight && s.badgeHL]}>
                  <Text style={[s.badgeText, item.highlight && { color: '#9a3412' }]}>{badge}</Text>
                </View>
              )}
              <Text style={s.chevron}>›</Text>
            </PressableScale>
          );
        })}
      </View>

      {/* Logout */}
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 36 }}>
        <PressableScale style={s.logoutBtn} scale={0.98} onPress={handleLogout}>
          <Text style={s.logoutText}>🚪  Sign Out</Text>
        </PressableScale>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f5f7' },

  header: {
    backgroundColor: '#c75a28', paddingHorizontal: 16, paddingBottom: 36,
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
    shadowColor: '#c75a28', shadowOpacity: 0.35, shadowRadius: 14, shadowOffset: { width: 0, height: 5 }, elevation: 8,
  },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20, marginTop: 8 },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarText: { fontSize: 28, fontWeight: '800', color: '#fff' },
  cameraBtn: {
    position: 'absolute', bottom: 0, right: 0, width: 30, height: 30,
    backgroundColor: '#fff', borderRadius: 15, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 3, elevation: 3,
  },
  name: { fontSize: 20, fontWeight: '800', color: '#fff' },
  phone: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  since: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  editBtn: {
    width: 38, height: 38, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)',
  },

  statsRow: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 18, padding: 16, justifyContent: 'space-around',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  stat: { alignItems: 'center', flex: 1 },
  statVal: { fontSize: 20, fontWeight: '800', color: '#fff' },
  statLbl: { fontSize: 9, color: 'rgba(255,255,255,0.75)', marginTop: 3, fontWeight: '500' },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },

  locCardWrap: { paddingHorizontal: 16, marginTop: -18, zIndex: 1 },
  locCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: '#f0f0f3', gap: 10,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 5,
  },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  locIcon: { width: 42, height: 42, backgroundColor: '#fff7f5', borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  locTitle: { fontSize: 13, fontWeight: '700', color: '#111827' },
  locSub: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  locErrBox: { backgroundColor: '#fef2f2', borderRadius: 8, padding: 8, gap: 6 },
  locErrTxt: { fontSize: 11, color: '#ef4444', lineHeight: 16 },
  settingsLink: { alignSelf: 'flex-start' },
  settingsLinkTxt: { fontSize: 11, color: '#c75a28', fontWeight: '700', textDecorationLine: 'underline' },
  detectBtn: {
    backgroundColor: '#c75a28', borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  detectBtnTxt: { fontSize: 11, color: '#fff', fontWeight: '700' },
  manualRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  manualInput: {
    flex: 1, height: 38, borderWidth: 1, borderColor: '#e5e7eb',
    borderRadius: 10, paddingHorizontal: 10, fontSize: 13, color: '#111827',
    backgroundColor: '#f9fafb',
  },
  manualSaveBtn: {
    backgroundColor: '#c75a28', borderRadius: 10,
    paddingHorizontal: 14, height: 38, alignItems: 'center', justifyContent: 'center',
  },
  manualSaveTxt: { fontSize: 12, color: '#fff', fontWeight: '700' },
  chevronRight: { color: '#9ca3af', fontSize: 20, fontWeight: '300' },

  menuSection: { paddingHorizontal: 16, marginTop: 18, gap: 4 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 13, paddingHorizontal: 14, borderRadius: 14,
    backgroundColor: '#fff', marginBottom: 2,
    borderWidth: 1, borderColor: '#f5f5f7',
    shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  menuItemHL: { backgroundColor: '#fff7f5', borderColor: '#fdc9b0' },
  menuIcon: { width: 42, height: 42, backgroundColor: '#f5f5f7', borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  menuIconHL: { backgroundColor: '#fce7d9' },
  menuLabel: { fontSize: 14, fontWeight: '700', color: '#111827' },
  menuDesc: { fontSize: 11, color: '#9ca3af', marginTop: 1 },
  badge: { backgroundColor: '#f3f4f6', borderRadius: 99, paddingHorizontal: 9, paddingVertical: 3 },
  badgeHL: { backgroundColor: '#fce7d9' },
  badgeText: { fontSize: 10, color: '#374151', fontWeight: '700' },
  chevron: { fontSize: 20, color: '#d1d5db', fontWeight: '300' },

  logoutBtn: {
    borderWidth: 1.5, borderColor: '#fca5a5', borderRadius: 14, height: 50,
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff',
  },
  logoutText: { fontSize: 14, fontWeight: '700', color: '#ef4444' },
});
