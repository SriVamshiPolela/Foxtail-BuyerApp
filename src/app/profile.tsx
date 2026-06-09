import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/pressable-scale';
import { useUserStore } from '@/store/user';
import { useCartStore, cartItemCount } from '@/store/cart';

const menuItems = [
  { icon: '📦', label: 'My Orders',        desc: 'Track your purchases',       badgeKey: 'orders' as const },
  { icon: '🤍', label: 'Wishlist',          desc: 'Your saved items',           badgeKey: 'wishlist' as const },
  { icon: '📍', label: 'Saved Addresses',   desc: 'Manage delivery locations' },
  { icon: '💳', label: 'Payment Methods',   desc: 'Cards & UPI' },
  { icon: '👛', label: 'Harvest Wallet',    desc: 'Your balance',               badgeKey: 'wallet' as const, highlight: true },
  { icon: '🎁', label: 'Refer & Earn',      desc: 'Get ₹100 per referral' },
  { icon: '🏪', label: 'Become a Seller',   desc: 'Start your local business' },
  { icon: '⚙️', label: 'Settings',          desc: 'App preferences' },
  { icon: '❓', label: 'Help & Support',    desc: 'FAQs and contact' },
];

export default function ProfileScreen() {
  const user = useUserStore();
  const cartCount = useCartStore(cartItemCount);

  const getBadge = (key?: string) => {
    if (key === 'orders') return `${user.orderCount} total`;
    if (key === 'wishlist') return `${user.wishlistCount} items`;
    if (key === 'wallet') return `₹${user.walletBalance}`;
    return undefined;
  };

  return (
    <ScrollView style={s.screen} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={s.header}>
        <SafeAreaView edges={['top']}>
          <View style={s.avatarRow}>
            <View style={s.avatarWrap}>
              <View style={s.avatar}>
                <Text style={s.avatarText}>{user.initials}</Text>
              </View>
              <Pressable
                style={({ pressed }) => [s.cameraBtn, pressed && { opacity: 0.7, transform: [{ scale: 0.9 }] }]}
                hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
              >
                <Text style={{ fontSize: 13 }}>📷</Text>
              </Pressable>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.name}>{user.name}</Text>
              <Text style={s.phone}>{user.phone}</Text>
              <Text style={s.since}>Member since {user.memberSince}</Text>
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
              <Text style={s.statVal}>{user.wishlistCount}</Text>
              <Text style={s.statLbl}>Wishlist</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.stat}>
              <Text style={s.statVal}>₹{user.walletBalance}</Text>
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
        <PressableScale style={s.locCard} scale={0.98}>
          <View style={s.locIcon}><Text style={{ fontSize: 20 }}>📍</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={s.locTitle}>Your Location</Text>
            <Text style={s.locSub}>{user.location}, {user.district}</Text>
          </View>
          <Text style={s.chevronRight}>›</Text>
        </PressableScale>
      </View>

      {/* Menu Items */}
      <View style={s.menuSection}>
        {menuItems.map((item, i) => {
          const badge = getBadge(item.badgeKey);
          return (
            <PressableScale key={i} style={[s.menuItem, item.highlight && s.menuItemHL]} scale={0.985}>
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
        <PressableScale style={s.logoutBtn} scale={0.98}>
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
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1, borderColor: '#f0f0f3',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 5,
  },
  locIcon: { width: 42, height: 42, backgroundColor: '#fff7f5', borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  locTitle: { fontSize: 13, fontWeight: '700', color: '#111827' },
  locSub: { fontSize: 11, color: '#6b7280', marginTop: 2 },
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
