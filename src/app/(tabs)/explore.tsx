import { useState, useEffect } from 'react';
import { ScrollView, View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';

const SCREEN_W = Dimensions.get('window').width;
const H_PAD = 16;      // paddingHorizontal on the section
const COL_GAP = 12;    // gap between the two columns
const CARD_W = (SCREEN_W - H_PAD * 2 - COL_GAP) / 2;
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { RangoliBorder, ShippabilityBadge, TrustBadge } from '@/components/buyer-ui';
import { CartButton } from '@/components/cart-button';
import { WishlistButton } from '@/components/wishlist-button';
import { PressableScale } from '@/components/pressable-scale';
import { getProducts } from '@/services/products';
import { products as mockProducts } from '@/data/mock';
import type { Product } from '@/types';

type RegionId = 'mandal' | 'district' | 'state' | 'national';

const REGIONS: { id: RegionId; label: string; icon: string; sublabel: string }[] = [
  { id: 'mandal',   label: 'Armoor',    icon: '🏘️', sublabel: 'Hyperlocal' },
  { id: 'district', label: 'Nizamabad', icon: '🏙️', sublabel: 'District'   },
  { id: 'state',    label: 'Telangana', icon: '🗺️', sublabel: 'State'      },
  { id: 'national', label: 'All India', icon: '🇮🇳', sublabel: 'Nationwide' },
];

export default function ExploreScreen() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<RegionId>('mandal');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all products once — filter client-side on region change (instant, no re-fetch)
    getProducts()
      .then(setAllProducts)
      .catch(() => setAllProducts(mockProducts))
      .finally(() => setLoading(false));
  }, []);

  const filtered = allProducts.filter((p) => p.shippability === selectedRegion);
  const countFor = (regionId: string) =>
    allProducts.filter((p) => p.shippability === regionId).length;

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
            {REGIONS.map((r) => {
              const count = loading ? null : countFor(r.id);
              const active = r.id === selectedRegion;
              return (
                <Pressable
                  key={r.id}
                  onPress={() => setSelectedRegion(r.id)}
                  style={({ pressed }) => [
                    s.regionCard,
                    active && s.regionCardActive,
                    pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] },
                  ]}
                >
                  <Text style={{ fontSize: 22 }}>{r.icon}</Text>
                  <Text style={[s.regionName, active && s.regionNameActive]}>
                    {r.label}
                  </Text>
                  <Text style={[s.regionSublabel, active && { color: '#c75a28' }]}>
                    {r.sublabel}
                  </Text>
                  <Text style={[s.regionCount, active && s.regionCountActive]}>
                    {count === null ? '—' : `${count} items`}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={{ paddingVertical: 18 }}><RangoliBorder /></View>

        {/* Product Grid */}
        <View style={s.section}>
          <View style={s.gridHeader}>
            <Text style={s.gridInfo}>
              {loading ? 'Loading…' : (
                <>
                  <Text style={{ color: '#111827', fontWeight: '700' }}>{filtered.length}</Text>
                  {' products in '}
                  <Text style={{ color: '#111827', fontWeight: '700' }}>
                    {REGIONS.find((r) => r.id === selectedRegion)?.label}
                  </Text>
                </>
              )}
            </Text>
            <Pressable style={({ pressed }) => [s.sortBtnWrap, pressed && { opacity: 0.7 }]}>
              <Text style={s.sortBtn}>Sort by ▾</Text>
            </Pressable>
          </View>

          {loading && (
            <View style={s.centerMsg}>
              <ActivityIndicator size="large" color="#c75a28" />
              <Text style={s.msgText}>Loading products…</Text>
            </View>
          )}

          {!loading && filtered.length === 0 && (
            <View style={s.centerMsg}>
              <Text style={{ fontSize: 48 }}>🌿</Text>
              <Text style={s.emptyTitle}>
                No products in {REGIONS.find((r) => r.id === selectedRegion)?.label} yet
              </Text>
              <Text style={s.emptySubtitle}>
                Vendors are joining — check another region or come back soon!
              </Text>
            </View>
          )}

          {!loading && filtered.length > 0 && (
            <View style={s.grid}>
              {filtered.map((p) => (
                <PressableScale
                  key={p.id}
                  onPress={() => router.push(`/product/${p.id}`)}
                  style={s.prodCard}
                  scale={0.97}
                >
                  <View style={s.prodImg}>
                    <Text style={{ fontSize: 38 }}>{p.image}</Text>
                    <WishlistButton productId={p.id} style={s.wishBtn} size={13} />
                  </View>

                  <View style={s.prodBody}>
                    <View style={s.badgeRow}>
                      {p.badges.map((b) => <TrustBadge key={b} type={b} small />)}
                      <ShippabilityBadge level={p.shippability} />
                    </View>

                    <Text style={s.prodName} numberOfLines={2}>{p.name}</Text>
                    <Text style={s.prodVendor} numberOfLines={1}>{p.vendor}</Text>
                    <Text style={s.prodLocation} numberOfLines={1}>📍 {p.location}</Text>
                    <Text style={s.prodRating}>★ {p.rating.toFixed(1)}  ({p.reviews})</Text>

                    <View style={s.prodPriceRow}>
                      <Text style={s.prodPrice}>₹{p.price}</Text>
                      {p.originalPrice > p.price && (
                        <Text style={s.prodOrigPrice}>₹{p.originalPrice}</Text>
                      )}
                    </View>

                    <CartButton product={p} variant="grid" />
                  </View>
                </PressableScale>
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

  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 10 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '800', color: '#111827' },
  filterBtn: {
    width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: '#e5e7eb',
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 14, paddingHorizontal: 14, height: 46,
    borderWidth: 1, borderColor: '#e5e7eb',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  searchInput: { flex: 1, fontSize: 13, color: '#111827' },

  section: { paddingHorizontal: 16, paddingBottom: 8 },

  regionLabel: {
    fontSize: 12, color: '#6b7280', fontWeight: '700',
    marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  regionGrid: { flexDirection: 'row', gap: 8 },
  regionCard: {
    flex: 1, paddingVertical: 12, paddingHorizontal: 6, borderRadius: 14,
    borderWidth: 1.5, borderColor: '#e5e7eb', backgroundColor: '#fff',
    alignItems: 'center', gap: 2,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  regionCardActive: {
    borderColor: '#c75a28', backgroundColor: '#fff7f5',
    shadowColor: '#c75a28', shadowOpacity: 0.15, shadowRadius: 6, elevation: 3,
  },
  regionName: { fontSize: 9, fontWeight: '800', color: '#374151', textAlign: 'center' },
  regionNameActive: { color: '#c75a28' },
  regionSublabel: { fontSize: 8, color: '#9ca3af', textAlign: 'center' },
  regionCount: { fontSize: 10, fontWeight: '700', color: '#6b7280', marginTop: 2 },
  regionCountActive: { color: '#c75a28' },

  gridHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  gridInfo: { fontSize: 12, color: '#6b7280' },
  sortBtnWrap: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  sortBtn: { fontSize: 12, color: '#374151', fontWeight: '600' },

  centerMsg: { alignItems: 'center', paddingVertical: 40, gap: 10, paddingHorizontal: 24 },
  msgText: { fontSize: 13, color: '#6b7280' },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: '#111827', textAlign: 'center' },
  emptySubtitle: { fontSize: 12, color: '#9ca3af', textAlign: 'center', lineHeight: 18 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: COL_GAP },
  prodCard: {
    width: CARD_W, backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden',
    borderWidth: 1, borderColor: '#f0f0f3',
    shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 3,
  },
  prodImg: {
    height: 118, backgroundColor: '#fff7f5',
    alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  wishBtn: {
    position: 'absolute', top: 8, right: 8, width: 28, height: 28,
    backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 3, elevation: 2,
  },
  prodBody: { padding: 10, gap: 3 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 3, marginBottom: 2 },
  prodName: { fontSize: 12, fontWeight: '700', color: '#111827', lineHeight: 16 },
  prodVendor: { fontSize: 10, color: '#6b7280' },
  prodLocation: { fontSize: 9, color: '#9ca3af' },
  prodRating: { fontSize: 10, color: '#f59e0b', fontWeight: '600' },
  prodPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  prodPrice: { fontSize: 15, fontWeight: '800', color: '#c75a28' },
  prodOrigPrice: { fontSize: 10, color: '#9ca3af', textDecorationLine: 'line-through' },
});
