import { useState, useEffect } from 'react';
import { ScrollView, View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RangoliBorder, ShippabilityBadge, TrustBadge } from '@/components/buyer-ui';

type ShipLevel = 'mandal' | 'district' | 'state' | 'national';

// 10.0.2.2 is the Android emulator's alias for the host machine (your PC)
const CATALOG_API = 'http://10.0.2.2:3003';

const CATEGORY_EMOJI: Record<string, string> = {
  farm_products:   '🌾',
  processed_foods: '🫙',
  foods:           '🍱',
  arts_handmade:   '🎨',
  services:        '🔧',
};

interface ApiProduct {
  id: string;
  name: string;
  category: string;
  subCategory: string;
  price: number;
  originalPrice?: number;
  unit: string;
  sellerId: string;
  sellerName: string;
  location: string;
  inStock: boolean;
  isVerified: boolean;
  isHandmade: boolean;
  shipsTo: ShipLevel;
  rating: number;
  reviewCount: number;
  createdAt: string;
}

const regions = [
  { id: 'mandal',   label: 'Armoor',    icon: '🏘️' },
  { id: 'district', label: 'Nizamabad', icon: '🏙️' },
  { id: 'state',    label: 'Telangana', icon: '🗺️' },
  { id: 'national', label: 'All India', icon: '🇮🇳' },
];

export default function ExploreScreen() {
  const [selectedRegion, setSelectedRegion] = useState('mandal');
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${CATALOG_API}/v1/products`)
      .then((res) => res.json())
      .then((body) => setProducts(body.data))
      .catch(() => setError('Could not load products. Is catalog-svc running?'))
      .finally(() => setLoading(false));
  }, []);

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
                  {products.length} items
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
              Showing{' '}
              <Text style={{ color: '#111827', fontWeight: '700' }}>{products.length}</Text>
              {' '}products
            </Text>
            <Pressable
              style={({ pressed }) => [s.sortBtnWrap, pressed && { opacity: 0.7 }]}
            >
              <Text style={s.sortBtn}>Sort by ▾</Text>
            </Pressable>
          </View>

          {loading && (
            <View style={s.centerMsg}>
              <ActivityIndicator size="large" color="#c75a28" />
              <Text style={s.msgText}>Loading products...</Text>
            </View>
          )}

          {error && (
            <View style={s.centerMsg}>
              <Text style={s.errorText}>{error}</Text>
            </View>
          )}

          {!loading && !error && (
            <View style={s.grid}>
              {products.map((p) => (
                <Pressable
                  key={p.id}
                  style={({ pressed }) => [s.prodCard, pressed && { opacity: 0.88, transform: [{ scale: 0.97 }] }]}
                >
                  <View style={s.prodImg}>
                    <Text style={{ fontSize: 36 }}>{CATEGORY_EMOJI[p.category] ?? '📦'}</Text>
                    <Pressable
                      style={({ pressed }) => [s.wishBtn, pressed && { opacity: 0.6, transform: [{ scale: 0.85 }] }]}
                      hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                    >
                      <Text style={{ fontSize: 13 }}>🤍</Text>
                    </Pressable>
                  </View>

                  <View style={s.prodBody}>
                    <View style={s.badgeRow}>
                      {p.isVerified && <TrustBadge type="verified" small />}
                      {p.isHandmade && <TrustBadge type="handmade" small />}
                      <ShippabilityBadge level={p.shipsTo} />
                    </View>

                    <Text style={s.prodName} numberOfLines={2}>{p.name}</Text>
                    <Text style={s.prodVendor} numberOfLines={1}>{p.sellerName}</Text>
                    <Text style={s.prodLocation} numberOfLines={1}>📍 {p.location}</Text>
                    <Text style={s.prodRating}>★ {p.rating.toFixed(1)}  ({p.reviewCount})</Text>

                    <View style={s.prodBottom}>
                      <View>
                        <Text style={s.prodPrice}>₹{(p.price / 100).toFixed(0)}</Text>
                        {p.originalPrice && (
                          <Text style={s.prodOriginalPrice}>₹{(p.originalPrice / 100).toFixed(0)}</Text>
                        )}
                      </View>
                      <Text style={s.prodUnit}>/{p.unit}</Text>
                    </View>

                    <Pressable
                      style={({ pressed }) => [
                        s.addBtn,
                        !p.inStock && s.addBtnDisabled,
                        pressed && p.inStock && { opacity: 0.82, transform: [{ scale: 0.97 }] },
                      ]}
                      disabled={!p.inStock}
                    >
                      <Text style={s.addBtnText}>{p.inStock ? '+ Add to Cart' : 'Out of Stock'}</Text>
                    </Pressable>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
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
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 2 },
  prodName: { fontSize: 12, fontWeight: '700', color: '#111827', lineHeight: 16 },
  prodVendor: { fontSize: 10, color: '#6b7280' },
  prodLocation: { fontSize: 9, color: '#9ca3af' },
  prodBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 2,
  },
  prodPrice: { fontSize: 15, fontWeight: '800', color: '#c75a28' },
  prodOriginalPrice: { fontSize: 10, color: '#9ca3af', textDecorationLine: 'line-through' },
  prodUnit: { fontSize: 10, color: '#6b7280', marginBottom: 1 },
  prodRating: { fontSize: 10, color: '#f59e0b', fontWeight: '600' },
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
  addBtnDisabled: { backgroundColor: '#9ca3af', shadowOpacity: 0 },
  addBtnText: { color: '#fff', fontSize: 11, fontWeight: '800' },

  centerMsg: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  msgText: { fontSize: 13, color: '#6b7280' },
  errorText: { fontSize: 13, color: '#dc2626', textAlign: 'center' },
});
