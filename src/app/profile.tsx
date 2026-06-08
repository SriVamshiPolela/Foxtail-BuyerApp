import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const menuItems = [
  { icon: '📦', label: 'My Orders', desc: 'Track your purchases', badge: '2 active' },
  { icon: '🤍', label: 'Wishlist', desc: 'Your saved items', badge: '12 items' },
  { icon: '📍', label: 'Saved Addresses', desc: 'Manage delivery locations' },
  { icon: '💳', label: 'Payment Methods', desc: 'Cards & UPI' },
  { icon: '👛', label: 'Harvest Wallet', desc: '₹250 balance', highlight: true },
  { icon: '🎁', label: 'Refer & Earn', desc: 'Get ₹100 per referral' },
  { icon: '🏪', label: 'Become a Seller', desc: 'Start your local business' },
  { icon: '⚙️', label: 'Settings', desc: 'App preferences' },
  { icon: '❓', label: 'Help & Support', desc: 'FAQs and contact' },
];

export default function ProfileScreen() {
  return (
    <ScrollView style={s.screen} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={s.header}>
        <SafeAreaView edges={['top']}>
          <View style={s.avatarRow}>
            <View style={s.avatarWrap}>
              <View style={s.avatar}>
                <Text style={s.avatarText}>RK</Text>
              </View>
              <Pressable style={s.cameraBtn}>
                <Text style={{ fontSize: 14 }}>📷</Text>
              </Pressable>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.name}>Rajesh Kumar</Text>
              <Text style={s.phone}>+91 98765 43210</Text>
              <Text style={s.since}>Member since Oct 2023</Text>
            </View>
            <Pressable style={s.editBtn}>
              <Text style={{ fontSize: 16 }}>✏️</Text>
            </Pressable>
          </View>

          {/* Stats */}
          <View style={s.statsRow}>
            <View style={s.stat}>
              <Text style={s.statVal}>23</Text>
              <Text style={s.statLbl}>Orders</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.stat}>
              <Text style={s.statVal}>12</Text>
              <Text style={s.statLbl}>Wishlist</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.stat}>
              <Text style={s.statVal}>₹250</Text>
              <Text style={s.statLbl}>Wallet</Text>
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* Location Card */}
      <View style={s.locCardWrap}>
        <View style={s.locCard}>
          <View style={s.locIcon}>
            <Text style={{ fontSize: 20 }}>📍</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.locTitle}>Your Location</Text>
            <Text style={s.locSub}>Kukatpally, Medchal District, Telangana</Text>
          </View>
          <Text style={{ color: '#9ca3af', fontSize: 18 }}>›</Text>
        </View>
      </View>

      {/* Menu Items */}
      <View style={s.menuSection}>
        {menuItems.map((item, i) => (
          <Pressable key={i} style={[s.menuItem, item.highlight && s.menuItemHL]}>
            <View style={[s.menuIcon, item.highlight && s.menuIconHL]}>
              <Text style={{ fontSize: 18 }}>{item.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.menuLabel}>{item.label}</Text>
              <Text style={s.menuDesc}>{item.desc}</Text>
            </View>
            {item.badge && (
              <View style={s.badge}>
                <Text style={s.badgeText}>{item.badge}</Text>
              </View>
            )}
            <Text style={s.chevron}>›</Text>
          </Pressable>
        ))}
      </View>

      {/* Logout */}
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 }}>
        <Pressable style={s.logoutBtn}>
          <Text style={s.logoutText}>🚪  Logout</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f9fafb' },

  header: {
    backgroundColor: '#c75a28',
    paddingHorizontal: 16,
    paddingBottom: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
    marginTop: 8,
  },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: { fontSize: 26, fontWeight: '700', color: '#fff' },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    backgroundColor: '#fff',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: 20, fontWeight: '700', color: '#fff' },
  phone: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 1 },
  since: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 1 },
  editBtn: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-around',
  },
  stat: { alignItems: 'center', flex: 1 },
  statVal: { fontSize: 22, fontWeight: '700', color: '#fff' },
  statLbl: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },

  locCardWrap: {
    paddingHorizontal: 16,
    marginTop: -16,
    zIndex: 1,
  },
  locCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  locIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#fff7f5',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locTitle: { fontSize: 13, fontWeight: '600', color: '#111827' },
  locSub: { fontSize: 11, color: '#6b7280', marginTop: 1 },

  menuSection: { paddingHorizontal: 16, marginTop: 16, gap: 2 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
  },
  menuItemHL: { backgroundColor: '#fff7f5' },
  menuIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconHL: { backgroundColor: '#fce7d9' },
  menuLabel: { fontSize: 14, fontWeight: '600', color: '#111827' },
  menuDesc: { fontSize: 11, color: '#6b7280', marginTop: 1 },
  badge: {
    backgroundColor: '#f3f4f6',
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: { fontSize: 10, color: '#374151', fontWeight: '600' },
  chevron: { fontSize: 18, color: '#9ca3af' },

  logoutBtn: {
    borderWidth: 1,
    borderColor: '#fca5a5',
    borderRadius: 12,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: { fontSize: 14, fontWeight: '600', color: '#ef4444' },
});
