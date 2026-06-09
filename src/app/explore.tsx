import { useState } from 'react';
import { ScrollView, View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RangoliBorder, ShippabilityBadge } from '@/components/buyer-ui';

type ShipLevel = 'mandal' | 'district' | 'state' | 'national';

const regions = [
  { id: 'mandal', label: 'Armoor', icon: '🏘️', count: 45 },
  { id: 'district', label: 'Nizamabad', icon: '🏙️', count: 234 },
  { id: 'state', label: 'Telangana', icon: '🗺️', count: 1203 },
  { id: 'national', label: 'All India', icon: '🇮🇳', count: 5670 },
];

const products: { name: string; vendor: string; price: number; image: string; rating: number; shippability: ShipLevel }[] = [
  { name: 'Farm Fresh Tomatoes', vendor: 'Local Farm', price: 45, image: '🍅', rating: 4.8, shippability: 'mandal' },
  { name: 'Organic Rice (5kg)', vendor: 'Krishna Farms', price: 320, image: '🍚', rating: 4.7, shippability: 'district' },
  { name: 'Handmade Pickles', vendor: 'Amma Kitchen', price: 180, image: '🫙', rating: 4.9, shippability: 'state' },
  { name: 'Pochampally Saree', vendor: 'Weavers Coop', price: 2800, image: '👗', rating: 5.0, shippability: 'national' },
  { name: 'Pure Ghee (500ml)', vendor: 'Desi Dairy', price: 450, image: '🧈', rating: 4.8, shippability: 'state' },
  { name: 'Clay Pottery Set', vendor: 'Kulal Artisans', price: 650, image: '🏺', rating: 4.6, shippability: 'district' },
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
            <Pressable style={s.filterBtn}>
              <Text style={{ fontSize: 14 }}>⚙️</Text>
            </Pressable>
          </View>
          <View style={s.searchRow}>
            <Text style={{ marginRight: 8 }}>🔍</Text>
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
                style={[s.regionCard, r.id === selectedRegion && s.regionCardActive]}
              >
                <Text style={{ fontSize: 20 }}>{r.icon}</Text>
                <Text style={[s.regionName, r.id === selectedRegion && s.regionNameActive]}>
                  {r.label}
                </Text>
                <Text style={s.regionCount}>{r.count} items</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={{ paddingVertical: 16 }}>
          <RangoliBorder />
        </View>

        {/* Product Grid */}
        <View style={s.section}>
          <View style={s.gridHeader}>
            <Text style={s.gridInfo}>
              Showing{' '}
              <Text style={{ color: '#111827', fontWeight: '700' }}>{current.count}</Text>
              {' '}products
            </Text>
            <Text style={s.sortBtn}>Sort by ▾</Text>
          </View>
          <View style={s.grid}>
            {products.map((p, i) => (
              <View key={i} style={s.prodCard}>
                <View style={s.prodImg}>
                  <Text style={{ fontSize: 38 }}>{p.image}</Text>
                  <Pressable style={s.wishBtn}>
                    <Text style={{ fontSize: 13 }}>🤍</Text>
                  </Pressable>
                </View>
                <View style={s.prodBody}>
                  <ShippabilityBadge level={p.shippability} />
                  <Text style={s.prodName} numberOfLines={1}>{p.name}</Text>
                  <Text style={s.prodVendor}>{p.vendor}</Text>
                  <View style={s.prodBottom}>
                    <Text style={s.prodPrice}>₹{p.price}</Text>
                    <Text style={s.prodRating}>★ {p.rating}</Text>
                  </View>
                  <Pressable style={s.addBtn}>
                    <Text style={s.addBtnText}>Add to Cart</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 32 }} />
      </SafeAreaView>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f9fafb' },

  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: { fontSize: 20, fontWeight: '700', color: '#111827' },
  filterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: { flex: 1, fontSize: 13, color: '#111827' },

  section: { paddingHorizontal: 16, paddingBottom: 8 },
  regionLabel: { fontSize: 12, color: '#6b7280', marginBottom: 8 },
  regionGrid: { flexDirection: 'row', gap: 8 },
  regionCard: {
    flex: 1,
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    alignItems: 'center',
    gap: 2,
  },
  regionCardActive: { borderColor: '#c75a28', backgroundColor: '#fff7f5' },
  regionName: { fontSize: 9, fontWeight: '600', color: '#374151', textAlign: 'center' },
  regionNameActive: { color: '#c75a28' },
  regionCount: { fontSize: 8, color: '#6b7280' },

  gridHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  gridInfo: { fontSize: 12, color: '#6b7280' },
  sortBtn: { fontSize: 12, color: '#374151' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  prodCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  prodImg: {
    height: 110,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  wishBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prodBody: { padding: 8, gap: 3 },
  prodName: { fontSize: 12, fontWeight: '600', color: '#111827' },
  prodVendor: { fontSize: 10, color: '#6b7280' },
  prodBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  prodPrice: { fontSize: 14, fontWeight: '700', color: '#c75a28' },
  prodRating: { fontSize: 10, fontWeight: '600', color: '#374151' },
  addBtn: {
    backgroundColor: '#c75a28',
    borderRadius: 8,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  addBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },
});
