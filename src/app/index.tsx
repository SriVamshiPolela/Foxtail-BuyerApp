import { ScrollView, View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RangoliBorder, TrustBadge, ShippabilityBadge } from '@/components/buyer-ui';

const categories = [
  { name: 'Fresh Produce', icon: '🥬', count: 234 },
  { name: 'Dairy & Milk', icon: '🥛', count: 89 },
  { name: 'Handloom', icon: '🧣', count: 156 },
  { name: 'Spices', icon: '🌶️', count: 312 },
  { name: 'Pottery', icon: '🏺', count: 78 },
  { name: 'Pickles', icon: '🫙', count: 145 },
];

const featuredProducts = [
  {
    name: 'Organic Turmeric Powder',
    vendor: 'Lakshmi Farms',
    location: 'Erode, Tamil Nadu',
    price: 249,
    originalPrice: 320,
    image: '🫚',
    rating: 4.8,
    reviews: 234,
    badges: ['verified', 'organic'] as const,
    shippability: 'national' as const,
  },
  {
    name: 'Handwoven Ikat Saree',
    vendor: 'Pochampally Weavers',
    location: 'Nalgonda, Telangana',
    price: 3499,
    originalPrice: 4500,
    image: '👗',
    rating: 4.9,
    reviews: 89,
    badges: ['verified', 'handmade'] as const,
    shippability: 'national' as const,
  },
  {
    name: 'Fresh Buffalo Milk',
    vendor: 'Gokul Dairy',
    location: 'Your Mandal',
    price: 72,
    originalPrice: 80,
    image: '🥛',
    rating: 4.7,
    reviews: 1203,
    badges: ['verified', 'local'] as const,
    shippability: 'mandal' as const,
  },
];

const localVendors = [
  { name: 'Ramesh Organic Farm', type: 'Vegetables', distance: '2.3 km', rating: 4.9, image: '👨‍🌾' },
  { name: 'Lakshmi Handlooms', type: 'Textiles', distance: '5.1 km', rating: 4.8, image: '👩‍🎨' },
  { name: 'Balaji Dairy', type: 'Milk & Dairy', distance: '1.2 km', rating: 4.7, image: '🐄' },
];

export default function HomeScreen() {
  return (
    <ScrollView style={s.screen} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={s.header}>
        <SafeAreaView edges={['top']}>
          <View style={s.headerRow}>
            <View style={s.brand}>
              <View style={s.brandIcon}>
                <Text style={{ fontSize: 20 }}>🪔</Text>
              </View>
              <View>
                <Text style={s.brandName}>Harvest Connect</Text>
                <Text style={s.brandSub}>Local Treasures, Delivered</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Pressable
                style={({ pressed }) => [s.hBtn, pressed && { opacity: 0.65, transform: [{ scale: 0.9 }] }]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text>🔔</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [s.hBtn, pressed && { opacity: 0.65, transform: [{ scale: 0.9 }] }]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text>🤍</Text>
              </Pressable>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [s.locRow, pressed && { opacity: 0.75 }]}
          >
            <Text style={s.locText}>
              📍 Delivering to{' '}
              <Text style={s.locCity}>Kukatpally, Hyderabad ▾</Text>
            </Text>
          </Pressable>

          <View style={s.searchRow}>
            <Text style={s.searchIcon}>🔍</Text>
            <TextInput
              style={s.searchInput}
              placeholder="Search vegetables, handlooms, spices..."
              placeholderTextColor="#9ca3af"
            />
            <Pressable
              style={({ pressed }) => [s.filterBtn, pressed && { opacity: 0.7, backgroundColor: '#e5e7eb' }]}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Text style={{ fontSize: 13 }}>⚙️</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>

      {/* Trust Banner */}
      <View style={s.section}>
        <View style={s.trustBanner}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
            <Text style={{ fontSize: 20 }}>🛡️</Text>
            <View>
              <Text style={s.trustTitle}>Verified Local Vendors</Text>
              <Text style={s.trustSub}>Government ID & Quality Checked</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {['👨‍🌾', '👩‍🍳', '👨‍🎨'].map((e, i) => (
              <View key={i} style={[s.miniAvatar, { marginLeft: i > 0 ? -6 : 0 }]}>
                <Text style={{ fontSize: 10 }}>{e}</Text>
              </View>
            ))}
            <Text style={s.trustCount}>2,340+</Text>
          </View>
        </View>
      </View>

      {/* Categories */}
      <View style={s.section}>
        <View style={s.sectionHead}>
          <Text style={s.sectionTitle}>Shop by Category</Text>
          <Pressable style={({ pressed }) => pressed && { opacity: 0.6 }}>
            <Text style={s.seeAll}>View All ›</Text>
          </Pressable>
        </View>
        <View style={s.catGrid}>
          {categories.map((c) => (
            <Pressable
              key={c.name}
              style={({ pressed }) => [s.catCard, pressed && { opacity: 0.82, transform: [{ scale: 0.95 }] }]}
            >
              <View style={s.catIcon}>
                <Text style={{ fontSize: 24 }}>{c.icon}</Text>
              </View>
              <Text style={s.catName}>{c.name}</Text>
              <Text style={s.catCount}>{c.count} items</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={{ paddingVertical: 20 }}>
        <RangoliBorder />
      </View>

      {/* Local Vendors Near You */}
      <View style={s.section}>
        <View style={s.sectionHead}>
          <View>
            <Text style={s.sectionTitle}>Near Your Mandal</Text>
            <Text style={s.sectionSub}>Kukatpally, Medchal District</Text>
          </View>
          <Pressable style={({ pressed }) => pressed && { opacity: 0.6 }}>
            <Text style={s.seeAll}>See All ›</Text>
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: 12, paddingBottom: 4 }}>
            {localVendors.map((v) => (
              <Pressable
                key={v.name}
                style={({ pressed }) => [s.vendorCard, pressed && { opacity: 0.88, transform: [{ scale: 0.97 }] }]}
              >
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={s.vendorImg}>
                    <Text style={{ fontSize: 26 }}>{v.image}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.vendorName} numberOfLines={1}>{v.name}</Text>
                    <Text style={s.vendorType}>{v.type}</Text>
                    <Text style={s.vendorMeta}>★ {v.rating} · {v.distance}</Text>
                  </View>
                </View>
                <View style={s.visitBtn}>
                  <Text style={s.visitTxt}>Visit Shop →</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Featured Products */}
      <View style={s.section}>
        <View style={s.sectionHead}>
          <Text style={s.sectionTitle}>Featured Products</Text>
          <Pressable style={({ pressed }) => pressed && { opacity: 0.6 }}>
            <Text style={s.seeAll}>View All ›</Text>
          </Pressable>
        </View>
        <View style={{ gap: 12 }}>
          {featuredProducts.map((p) => (
            <Pressable
              key={p.name}
              style={({ pressed }) => [s.prodCard, pressed && { opacity: 0.9, transform: [{ scale: 0.985 }] }]}
            >
              <View style={s.prodImg}>
                <Text style={{ fontSize: 44 }}>{p.image}</Text>
              </View>
              <View style={s.prodInfo}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1, marginRight: 6 }}>
                    <Text style={s.prodName} numberOfLines={1}>{p.name}</Text>
                    <Text style={s.prodVendor}>{p.vendor}</Text>
                    <Text style={s.prodLoc}>📍 {p.location}</Text>
                  </View>
                  <Pressable
                    style={({ pressed }) => [s.wishBtn, pressed && { opacity: 0.6, transform: [{ scale: 0.85 }] }]}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Text style={{ fontSize: 14 }}>🤍</Text>
                  </Pressable>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                  {p.badges.map((b) => <TrustBadge key={b} type={b} small />)}
                  <ShippabilityBadge level={p.shippability} />
                </View>
                <View style={s.prodBottom}>
                  <View>
                    <Text style={s.prodPrice}>₹{p.price}</Text>
                    <Text style={s.prodOrig}>₹{p.originalPrice}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 2 }}>
                    <Text style={s.prodRating}>★ {p.rating} ({p.reviews})</Text>
                    <Pressable
                      style={({ pressed }) => [s.addCartBtn, pressed && { opacity: 0.82, transform: [{ scale: 0.95 }] }]}
                    >
                      <Text style={s.addCartTxt}>+ Add</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Regional Banner */}
      <View style={[s.section, { paddingBottom: 32 }]}>
        <View style={s.banner}>
          <View style={s.bannerBadge}>
            <Text style={s.bannerBadgeText}>Telangana Special</Text>
          </View>
          <Text style={s.bannerTitle}>Discover Authentic{'\n'}Telangana Crafts</Text>
          <Text style={s.bannerSub}>Bidri work, Nirmal paintings & more</Text>
          <Pressable
            style={({ pressed }) => [s.bannerBtn, pressed && { opacity: 0.85, transform: [{ scale: 0.96 }] }]}
          >
            <Text style={s.bannerBtnText}>Explore Now →</Text>
          </Pressable>
          <Text style={s.bannerDeco}>🏺</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f5f7' },

  header: {
    backgroundColor: '#c75a28',
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#c75a28',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandIcon: {
    width: 42,
    height: 42,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  brandName: { color: '#fff', fontWeight: '800', fontSize: 18, letterSpacing: 0.2 },
  brandSub: { color: 'rgba(255,255,255,0.8)', fontSize: 11 },
  hBtn: {
    width: 38,
    height: 38,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  locRow: { flexDirection: 'row', marginBottom: 12 },
  locText: { color: 'rgba(255,255,255,0.85)', fontSize: 12 },
  locCity: { color: '#fff', fontWeight: '700' },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  searchIcon: { marginRight: 8, fontSize: 14 },
  searchInput: { flex: 1, fontSize: 13, color: '#111827' },
  filterBtn: {
    width: 32,
    height: 32,
    backgroundColor: '#f3f4f6',
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  section: { paddingHorizontal: 16, paddingTop: 16 },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  sectionSub: { fontSize: 10, color: '#6b7280', marginTop: 2 },
  seeAll: { fontSize: 12, color: '#c75a28', fontWeight: '700' },

  trustBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  trustTitle: { fontSize: 12, fontWeight: '700', color: '#111827' },
  trustSub: { fontSize: 10, color: '#6b7280' },
  miniAvatar: {
    width: 24,
    height: 24,
    backgroundColor: '#d1fae5',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  trustCount: { fontSize: 10, color: '#166534', marginLeft: 6, fontWeight: '600' },

  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  catCard: {
    width: '31%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: '#f0f0f3',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  catIcon: {
    width: 46,
    height: 46,
    backgroundColor: '#fff7f5',
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catName: { fontSize: 11, fontWeight: '700', color: '#111827', textAlign: 'center' },
  catCount: { fontSize: 9, color: '#9ca3af', fontWeight: '500' },

  vendorCard: {
    width: 210,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#f0f0f3',
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  vendorImg: {
    width: 48,
    height: 48,
    backgroundColor: '#fff7f5',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vendorName: { fontSize: 13, fontWeight: '700', color: '#111827' },
  vendorType: { fontSize: 10, color: '#6b7280', marginTop: 1 },
  vendorMeta: { fontSize: 11, color: '#c75a28', fontWeight: '700', marginTop: 3 },
  visitBtn: {
    backgroundColor: '#c75a28',
    borderRadius: 10,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#c75a28',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  visitTxt: { fontSize: 12, color: '#fff', fontWeight: '700' },

  prodCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f3',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  prodImg: {
    width: 112,
    backgroundColor: '#fff7f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  prodInfo: { flex: 1, padding: 12 },
  prodName: { fontSize: 13, fontWeight: '700', color: '#111827' },
  prodVendor: { fontSize: 10, color: '#6b7280', marginTop: 1 },
  prodLoc: { fontSize: 10, color: '#9ca3af' },
  wishBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#f0f0f3',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  prodBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  prodRating: { fontSize: 10, color: '#6b7280' },
  prodPrice: { fontSize: 15, fontWeight: '800', color: '#c75a28' },
  prodOrig: { fontSize: 10, color: '#9ca3af', textDecorationLine: 'line-through', marginTop: 1 },
  addCartBtn: {
    backgroundColor: '#c75a28',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    shadowColor: '#c75a28',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  addCartTxt: { color: '#fff', fontSize: 11, fontWeight: '700' },

  banner: {
    backgroundColor: '#c75a28',
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
    shadowColor: '#c75a28',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  bannerBadge: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  bannerBadgeText: { color: '#fff', fontSize: 10, fontWeight: '600' },
  bannerTitle: { color: '#fff', fontWeight: '800', fontSize: 22, lineHeight: 28 },
  bannerSub: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 4 },
  bannerBtn: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
    alignSelf: 'flex-start',
    marginTop: 14,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  bannerBtnText: { color: '#c75a28', fontWeight: '800', fontSize: 13 },
  bannerDeco: { position: 'absolute', right: 16, top: 12, fontSize: 60, opacity: 0.18 },
});
