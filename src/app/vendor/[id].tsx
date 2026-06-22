import { useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TrustBadge, ShippabilityBadge } from '@/components/buyer-ui';
import { CartButton } from '@/components/cart-button';
import { WishlistButton } from '@/components/wishlist-button';
import { PressableScale } from '@/components/pressable-scale';
import { getVendorById, getProducts } from '@/services/products';
import { products as mockProducts } from '@/data/mock';
import { useLanguage } from '@/context/language-context';
import type { Product, Vendor } from '@/types';

const SCREEN_W = Dimensions.get('window').width;
const H_PAD = 16;
const COL_GAP = 12;
const CARD_W = (SCREEN_W - H_PAD * 2 - COL_GAP) / 2;

export default function VendorStoreScreen() {
  const { t } = useLanguage();
  const params = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getVendorById(id),
      getProducts().catch(() => mockProducts),
    ]).then(([v, allProds]) => {
      setVendor(v);
      setProducts(allProds.filter((p) => p.vendorId === id));
      setLoading(false);
    });
  }, [id]);

  return (
    <View style={s.screen}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={s.banner}>
          <SafeAreaView edges={['top']}>
            <Pressable
              onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/explore')}
              style={({ pressed }) => [s.backBtn, pressed && { opacity: 0.6 }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={s.backText}>{t('vendor_back')}</Text>
            </Pressable>
          </SafeAreaView>

          <View style={s.avatarWrap}>
            <View style={s.avatar}>
              <Text style={s.avatarEmoji}>{vendor?.image ?? '🏪'}</Text>
            </View>
          </View>

          <Text style={s.vendorName}>{vendor?.name ?? 'Store'}</Text>

          <View style={s.vendorMeta}>
            {vendor?.type && (
              <View style={s.metaTag}>
                <Text style={s.metaTagText}>{vendor.type}</Text>
              </View>
            )}
            <Text style={s.metaDot}>·</Text>
            <Text style={s.metaRating}>★ {vendor?.rating?.toFixed(1) ?? '—'}</Text>
            <Text style={s.metaDot}>·</Text>
            <Text style={s.metaDist}>{vendor?.distance ?? '—'}</Text>
          </View>
        </View>

        {/* Info Card */}
        <View style={s.infoCard}>
          {vendor?.description && (
            <Text style={s.description}>{vendor.description}</Text>
          )}
          <View style={s.statsRow}>
            <View style={s.stat}>
              <Text style={s.statVal}>{loading ? '—' : products.length}</Text>
              <Text style={s.statLbl}>{t('vendor_products')}</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.stat}>
              <Text style={s.statVal}>★ {vendor?.rating?.toFixed(1) ?? '—'}</Text>
              <Text style={s.statLbl}>{t('vendor_rating')}</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.stat}>
              <Text style={s.statVal}>{vendor?.distance ?? '—'}</Text>
              <Text style={s.statLbl}>{t('vendor_distance')}</Text>
            </View>
          </View>
        </View>

        {/* Product Grid */}
        <View style={s.gridSection}>
          <Text style={s.gridTitle}>
            {t('vendor_items')} · {vendor?.name ?? ''}
          </Text>

          {loading && (
            <View style={s.center}>
              <ActivityIndicator size="large" color="#c75a28" />
            </View>
          )}

          {!loading && products.length === 0 && (
            <View style={s.center}>
              <Text style={{ fontSize: 48 }}>🌿</Text>
              <Text style={s.emptyTitle}>{t('vendor_empty')}</Text>
              <Text style={s.emptySub}>{t('vendor_empty')}</Text>
            </View>
          )}

          {!loading && products.length > 0 && (
            <View style={s.grid}>
              {products.map((p) => (
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
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f5f7' },

  banner: {
    backgroundColor: '#c75a28',
    paddingBottom: 28,
    paddingHorizontal: 16,
    alignItems: 'center',
    shadowColor: '#c75a28',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  backBtn: { alignSelf: 'flex-start', paddingVertical: 8 },
  backText: { fontSize: 14, color: '#fff', fontWeight: '700' },

  avatarWrap: { marginTop: 8, marginBottom: 12 },
  avatar: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.45)',
  },
  avatarEmoji: { fontSize: 44 },

  vendorName: { fontSize: 24, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 8 },

  vendorMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaTag: {
    backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: 6,
    paddingHorizontal: 10, paddingVertical: 3,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  metaTagText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  metaDot: { color: 'rgba(255,255,255,0.6)', fontSize: 14 },
  metaRating: { color: '#fff', fontSize: 12, fontWeight: '700' },
  metaDist: { color: 'rgba(255,255,255,0.85)', fontSize: 12 },

  infoCard: {
    marginHorizontal: 16, marginTop: -16, backgroundColor: '#fff',
    borderRadius: 18, padding: 18,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 5,
  },
  description: { fontSize: 13, color: '#6b7280', lineHeight: 20, marginBottom: 16 },

  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center', flex: 1 },
  statVal: { fontSize: 18, fontWeight: '800', color: '#111827' },
  statLbl: { fontSize: 10, color: '#9ca3af', marginTop: 3 },
  statDivider: { width: 1, backgroundColor: '#f0f0f3' },

  gridSection: { paddingHorizontal: 16, marginTop: 22 },
  gridTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 14 },

  center: { paddingVertical: 48, alignItems: 'center', gap: 10 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  emptySub: { fontSize: 12, color: '#9ca3af' },

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
  prodRating: { fontSize: 10, color: '#f59e0b', fontWeight: '600' },
  prodPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  prodPrice: { fontSize: 15, fontWeight: '800', color: '#c75a28' },
  prodOrigPrice: { fontSize: 10, color: '#9ca3af', textDecorationLine: 'line-through' },
});
