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
  price: number;          // paise
  originalPrice?: number; // paise — present when discounted
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
  { id: 'mandal',   label: 'Armoor',     icon: '🏘️' },
  { id: 'district', label: 'Nizamabad',  icon: '🏙️' },
  { id: 'state',    label: 'Telangana',  icon: '🗺️' },
  { id: 'national', label: 'All India',  icon: '🇮🇳' },
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
  }, []);;

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
                <Text style={s.regionCount}>{products.length} items</Text>
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
              <Text style={{ color: '#111827', fontWeight: '700' }}>{products.length}</Text>
              {' '}products
            </Text>
            <Text style={s.sortBtn}>Sort by ▾</Text>
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
                <View key={p.id} style={s.prodCard}>
                  {/* Image area */}
                  <View style={s.prodImg}>
                    <Text style={{ fontSize: 36 }}>{CATEGORY_EMOJI[p.category] ?? '📦'}</Text>
                    <Pressable style={s.wishBtn}>
                      <Text style={{ fontSize: 13 }}>🤍</Text>
                    </Pressable>
                  </View>

                  <View style={s.prodBody}>
                    {/* Trust badges row */}
                    <View style={s.badgeRow}>
                      {p.isVerified && <TrustBadge type="verified" small />}
                      {p.isHandmade && <TrustBadge type="handmade" small />}
                      <ShippabilityBadge level={p.shipsTo} />
                    </View>

                    {/* Name */}
                    <Text style={s.prodName} numberOfLines={2}>{p.name}</Text>

                    {/* Seller + Location */}
                    <Text style={s.prodVendor} numberOfLines={1}>{p.sellerName}</Text>
                    <Text style={s.prodLocation} numberOfLines={1}>📍 {p.location}</Text>

                    {/* Rating */}
                    <Text style={s.prodRating}>★ {p.rating.toFixed(1)}  ({p.reviewCount})</Text>

                    {/* Price row */}
                    <View style={s.prodBottom}>
                      <View>
                        <Text style={s.prodPrice}>₹{(p.price / 100).toFixed(0)}</Text>
                        {p.originalPrice && (
                          <Text style={s.prodOriginalPrice}>₹{(p.originalPrice / 100).toFixed(0)}</Text>
                        )}
                      </View>
                      <Text style={s.prodUnit}>/{p.unit}</Text>
                    </View>

                    {/* CTA */}
                    <Pressable style={[s.addBtn, !p.inStock && s.addBtnDisabled]} disabled={!p.inStock}>
                      <Text style={s.addBtnText}>{p.inStock ? 'Add to Cart' : 'Out of Stock'}</Text>
                    </Pressable>
                  </View>
                </View>
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
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 2 },
  prodName: { fontSize: 12, fontWeight: '600', color: '#111827' },
  prodVendor: { fontSize: 10, color: '#6b7280' },
  prodLocation: { fontSize: 9, color: '#9ca3af' },
  prodBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 2 },
  prodPrice: { fontSize: 13, fontWeight: '700', color: '#c75a28' },
  prodOriginalPrice: { fontSize: 10, color: '#9ca3af', textDecorationLine: 'line-through' },
  prodUnit: { fontSize: 10, color: '#6b7280', marginBottom: 1 },
  prodRating: { fontSize: 10, color: '#f59e0b', fontWeight: '600' },
  addBtn: {
    backgroundColor: '#c75a28',
    borderRadius: 8,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  addBtnDisabled: { backgroundColor: '#9ca3af' },
  addBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  centerMsg: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  msgText: { fontSize: 13, color: '#6b7280' },
  errorText: { fontSize: 13, color: '#dc2626', textAlign: 'center' },
});
