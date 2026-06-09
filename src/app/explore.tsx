import { useState } from 'react';
import { ScrollView, View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RangoliBorder, ShippabilityBadge } from '@/components/buyer-ui';

type ShipLevel = 'mandal' | 'district' | 'state' | 'national';

const regions = [
  { id: 'mandal', label: 'My Mandal', icon: '🏘️', count: 45 },
  { id: 'district', label: 'My District', icon: '🏙️', count: 234 },
  { id: 'state', label: 'My State', icon: '🗺️', count: 1203 },
  { id: 'national', label: 'All India', icon: '🇮🇳', count: 5670 },
];

const products: { name: string; vendor: string; price: number; originalPrice: number; image: string; rating: number; shippability: ShipLevel }[] = [
  { name: 'Farm Fresh Tomatoes', vendor: 'Local Farm', price: 45, originalPrice: 60, image: '🍅', rating: 4.8, shippability: 'mandal' },
  { name: 'Organic Rice (5kg)', vendor: 'Krishna Farms', price: 320, originalPrice: 400, image: '🍚', rating: 4.7, shippability: 'district' },
  { name: 'Handmade Pickles', vendor: 'Amma Kitchen', price: 180, originalPrice: 220, image: '🫙', rating: 4.9, shippability: 'state' },
  { name: 'Pochampally Saree', vendor: 'Weavers Coop', price: 2800, originalPrice: 3500, image: '👗', rating: 5.0, shippability: 'national' },
  { name: 'Pure Ghee (500ml)', vendor: 'Desi Dairy', price: 450, originalPrice: 550, image: '🧈', rating: 4.8, shippability: 'state' },
  { name: 'Clay Pottery Set', vendor: 'Kulal Artisans', price: 650, originalPrice: 800, image: '🏺', rating: 4.6, shippability: 'district' },
];

export default function ExploreScreen() {
  const [selectedRegion, setSelectedRegion] = useState('mandal');
  const current = regions.find((r) => r.id === selectedRegion)!;

  return (
    <ScrollView style={s.screen} showsVerticalScrollIndicator={false}>
      <SafeAreaView edges={['top']}>
        {/* Header */}
        <View style={s.header}>
          <View style={s.headerRow}>
            <Text style={s.title}>Explore Products</Text>
            <Pressable
              style={({ pressed }) => [s.filterBtn, pressed && { opacity: 0.7, backgroundColor: '#e5e7eb' }]}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Text style={{ fontSize: 14 }}>⚙️</Text>
            </Pressable>
          </View>
          <View style={s.searchRow}>
            <Text style={{ marginRight: 8, fontSize: 14 }}>🔍</Text>
            <TextInput
              style={s.searchInput}
              placeholder="Search products, vendors..."
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        {/* Region Selector */}
        <View style={s.section}>
          <Text style={s.regionLabel}>Shop by Region</Text>
          <View style={s.regionGrid}>
            {regions.map((r) => (
              <Pressable
                key={r.id}
                onPress={() => setSelectedRegion(r.id)}
                style={({ pressed }) => [
                  s.regionCard,
                  r.id === selectedRegion && s.regionCardActive,
                  pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] },
                ]}
              >
                <Text style={{ fontSize: 22 }}>{r.icon}</Text>
                <Text style={[s.regionName, r.id === selectedRegion && s.regionNameActive]}>
                  {r.label}
                </Text>
                <Text style={[s.regionCount, r.id === selectedRegion && { color: '#c75a28' }]}>
                  {r.count}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={{ paddingVertical: 18 }}>
          <RangoliBorder />
        </View>

        {/* Product Grid */}
        <View style={s.section}>
          <View style={s.gridHeader}>
            <Text style={s.gridInfo}>
              <Text style={{ color: '#111827', fontWeight: '700' }}>{current.count}</Text>
              {' '}products found
            </Text>
            <Pressable
              style={({ pressed }) => [s.sortBtnWrap, pressed && { opacity: 0.7 }]}
            >
              <Text style={s.sortBtn}>Sort by ▾</Text>
            </Pressable>
          </View>
          <View style={s.grid}>
            {products.map((p, i) => (
              <Pressable
                key={i}
                style={({ pressed }) => [s.prodCard, pressed && { opacity: 0.88, transform: [{ scale: 0.97 }] }]}
              >
                <View style={s.prodImg}>
                  <Text style={{ fontSize: 40 }}>{p.image}</Text>
                  <Pressable
                    style={({ pressed }) => [s.wishBtn, pressed && { opacity: 0.6, transform: [{ scale: 0.85 }] }]}
                    hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                  >
                    <Text style={{ fontSize: 12 }}>🤍</Text>
                  </Pressable>
                </View>
                <View style={s.prodBody}>
                  <ShippabilityBadge level={p.shippability} />
                  <Text style={s.prodName} numberOfLines={2}>{p.name}</Text>
                  <Text style={s.prodVendor}>{p.vendor}</Text>
                  <View style={s.prodBottom}>
                    <View>
                      <Text style={s.prodPrice}>₹{p.price}</Text>
                      <Text style={s.prodOrigPrice}>₹{p.originalPrice}</Text>
                    </View>
                    <Text style={s.prodRating}>★ {p.rating}</Text>
                  </View>
                  <Pressable
                    style={({ pressed }) => [s.addBtn, pressed && { opacity: 0.82, transform: [{ scale: 0.97 }] }]}
                  >
                    <Text style={s.addBtnText}>+ Add to Cart</Text>
                  </Pressable>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={{ height: 32 }} />
      </SafeAreaView>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f5f7' },

  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    backgroundColor: '#f5f5f7',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: { fontSize: 22, fontWeight: '800', color: '#111827' },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  searchInput: { flex: 1, fontSize: 13, color: '#111827' },

  section: { paddingHorizontal: 16, paddingBottom: 8 },
  regionLabel: { fontSize: 12, color: '#6b7280', fontWeight: '600', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  regionGrid: { flexDirection: 'row', gap: 8 },
  regionCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    alignItems: 'center',
    gap: 3,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  regionCardActive: {
    borderColor: '#c75a28',
    backgroundColor: '#fff7f5',
    shadowColor: '#c75a28',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  regionName: { fontSize: 9, fontWeight: '700', color: '#374151', textAlign: 'center' },
  regionNameActive: { color: '#c75a28' },
  regionCount: { fontSize: 11, fontWeight: '800', color: '#6b7280' },

  gridHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  gridInfo: { fontSize: 12, color: '#6b7280' },
  sortBtnWrap: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sortBtn: { fontSize: 12, color: '#374151', fontWeight: '600' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  prodCard: {
    width: '47%',
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
    height: 118,
    backgroundColor: '#fff7f5',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  wishBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  prodBody: { padding: 10, gap: 4 },
  prodName: { fontSize: 12, fontWeight: '700', color: '#111827', lineHeight: 16 },
  prodVendor: { fontSize: 10, color: '#9ca3af' },
  prodBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 2,
  },
  prodPrice: { fontSize: 15, fontWeight: '800', color: '#c75a28' },
  prodOrigPrice: { fontSize: 10, color: '#9ca3af', textDecorationLine: 'line-through' },
  prodRating: { fontSize: 11, fontWeight: '700', color: '#374151' },
  addBtn: {
    backgroundColor: '#c75a28',
    borderRadius: 10,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    shadowColor: '#c75a28',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  addBtnText: { color: '#fff', fontSize: 11, fontWeight: '800' },
});
