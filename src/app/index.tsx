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
              <Pressable style={s.hBtn}><Text>🔔</Text></Pressable>
              <Pressable style={s.hBtn}><Text>🤍</Text></Pressable>
            </View>
          </View>
          <Pressable style={s.locRow}>
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
            <Pressable style={s.filterBtn}>
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
          <Text style={s.seeAll}>View All ›</Text>
        </View>
        <View style={s.catGrid}>
          {categories.map((c) => (
            <Pressable key={c.name} style={s.catCard}>
              <View style={s.catIcon}>
                <Text style={{ fontSize: 22 }}>{c.icon}</Text>
              </View>
              <Text style={s.catName}>{c.name}</Text>
              <Text style={s.catCount}>{c.count} items</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={{ paddingVertical: 16 }}>
        <RangoliBorder />
      </View>

      {/* Local Vendors Near You */}
      <View style={s.section}>
        <View style={s.sectionHead}>
          <View>
            <Text style={s.sectionTitle}>Near Your Mandal</Text>
            <Text style={s.sectionSub}>Kukatpally, Medchal District</Text>
          </View>
          <Text style={s.seeAll}>See All ›</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: 12, paddingBottom: 4 }}>
            {localVendors.map((v) => (
              <View key={v.name} style={s.vendorCard}>
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
                <Pressable style={s.visitBtn}>
                  <Text style={s.visitTxt}>Visit Shop</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Featured Products */}
      <View style={s.section}>
        <View style={s.sectionHead}>
          <Text style={s.sectionTitle}>Featured Products</Text>
          <Text style={s.seeAll}>View All ›</Text>
        </View>
        <View style={{ gap: 12 }}>
          {featuredProducts.map((p) => (
            <View key={p.name} style={s.prodCard}>
              <View style={s.prodImg}>
                <Text style={{ fontSize: 42 }}>{p.image}</Text>
              </View>
              <View style={s.prodInfo}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1, marginRight: 6 }}>
                    <Text style={s.prodName} numberOfLines={1}>{p.name}</Text>
                    <Text style={s.prodVendor}>{p.vendor}</Text>
                    <Text style={s.prodLoc}>📍 {p.location}</Text>
                  </View>
                  <Pressable style={s.wishBtn}>
                    <Text style={{ fontSize: 13 }}>🤍</Text>
                  </Pressable>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                  {p.badges.map((b) => <TrustBadge key={b} type={b} small />)}
                  <ShippabilityBadge level={p.shippability} />
                </View>
                <View style={s.prodBottom}>
                  <Text style={s.prodRating}>★ {p.rating} ({p.reviews})</Text>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={s.prodPrice}>₹{p.price}</Text>
                    <Text style={s.prodOrig}>₹{p.originalPrice}</Text>
                  </View>
                </View>
              </View>
            </View>
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
          <Pressable style={s.bannerBtn}>
            <Text style={s.bannerBtnText}>Explore Now</Text>
          </Pressable>
          <Text style={s.bannerDeco}>🏺</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f9fafb' },

  header: {
    backgroundColor: '#c75a28',
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
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
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: { color: '#fff', fontWeight: '700', fontSize: 18 },
  brandSub: { color: 'rgba(255,255,255,0.8)', fontSize: 11 },
  hBtn: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locRow: { flexDirection: 'row', marginBottom: 12 },
  locText: { color: 'rgba(255,255,255,0.85)', fontSize: 12 },
  locCity: { color: '#fff', fontWeight: '700' },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 13, color: '#111827' },
  filterBtn: {
    width: 28,
    height: 28,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  section: { paddingHorizontal: 16, paddingTop: 16 },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  sectionSub: { fontSize: 10, color: '#6b7280', marginTop: 2 },
  seeAll: { fontSize: 12, color: '#c75a28', fontWeight: '600' },

  trustBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    borderRadius: 12,
    padding: 12,
  },
  trustTitle: { fontSize: 12, fontWeight: '700', color: '#111827' },
  trustSub: { fontSize: 10, color: '#6b7280' },
  miniAvatar: {
    width: 22,
    height: 22,
    backgroundColor: '#d1fae5',
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  trustCount: { fontSize: 10, color: '#6b7280', marginLeft: 6 },

  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catCard: {
    width: '31%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  catIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catName: { fontSize: 11, fontWeight: '600', color: '#111827', textAlign: 'center' },
  catCount: { fontSize: 9, color: '#6b7280' },

  vendorCard: {
    width: 200,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 10,
  },
  vendorImg: {
    width: 46,
    height: 46,
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vendorName: { fontSize: 13, fontWeight: '600', color: '#111827' },
  vendorType: { fontSize: 10, color: '#6b7280' },
  vendorMeta: { fontSize: 10, color: '#c75a28', fontWeight: '600', marginTop: 3 },
  visitBtn: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visitTxt: { fontSize: 12, color: '#374151', fontWeight: '600' },

  prodCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  prodImg: {
    width: 108,
    height: 108,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  prodInfo: { flex: 1, padding: 10 },
  prodName: { fontSize: 13, fontWeight: '600', color: '#111827' },
  prodVendor: { fontSize: 10, color: '#6b7280', marginTop: 1 },
  prodLoc: { fontSize: 10, color: '#6b7280' },
  wishBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  prodBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  prodRating: { fontSize: 11, color: '#6b7280' },
  prodPrice: { fontSize: 14, fontWeight: '700', color: '#c75a28' },
  prodOrig: { fontSize: 10, color: '#9ca3af', textDecorationLine: 'line-through' },

  banner: {
    backgroundColor: '#c75a28',
    borderRadius: 20,
    padding: 16,
    overflow: 'hidden',
  },
  bannerBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  bannerBadgeText: { color: '#fff', fontSize: 10 },
  bannerTitle: { color: '#fff', fontWeight: '700', fontSize: 20, lineHeight: 26 },
  bannerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 4 },
  bannerBtn: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  bannerBtnText: { color: '#c75a28', fontWeight: '700', fontSize: 12 },
  bannerDeco: { position: 'absolute', right: 16, top: 12, fontSize: 52, opacity: 0.2 },
});
