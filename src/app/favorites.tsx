import { useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TrustBadge, ShippabilityBadge } from '@/components/buyer-ui';
import { CartButton } from '@/components/cart-button';
import { WishlistButton } from '@/components/wishlist-button';
import { PressableScale } from '@/components/pressable-scale';
import { getProducts } from '@/services/products';
import { useWishlistStore } from '@/store/wishlist';
import { products as mockProducts } from '@/data/mock';
import { useLanguage } from '@/context/language-context';
import type { Product } from '@/types';

export default function FavoritesScreen() {
  const { t } = useLanguage();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const favoriteIds = useWishlistStore((s) => s.favoriteIds);

  useEffect(() => {
    getProducts()
      .then(setAllProducts)
      .catch(() => setAllProducts(mockProducts))
      .finally(() => setLoading(false));
  }, []);

  const favoriteProducts = allProducts.filter((p) => favoriteIds.includes(p.id));

  return (
    <View style={s.screen}>
      {/* Header */}
      <View style={s.header}>
        <SafeAreaView edges={['top']}>
          <View style={s.headerRow}>
            <Pressable
              onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/explore')}
              style={({ pressed }) => [s.backBtn, pressed && { opacity: 0.6 }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={s.backText}>← Back</Text>
            </Pressable>
            <View style={s.headerMid}>
              <Text style={s.headerTitle}>{t('favorites_title')}</Text>
              {!loading && (
                <Text style={s.headerCount}>
                  {favoriteProducts.length} {favoriteProducts.length === 1 ? t('favorites_item') : t('favorites_items')}
                </Text>
              )}
            </View>
            <View style={{ width: 64 }} />
          </View>
        </SafeAreaView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
        {loading && (
          <View style={s.center}>
            <ActivityIndicator size="large" color="#c75a28" />
            <Text style={s.loadingText}>{t('favorites_loading')}</Text>
          </View>
        )}

        {!loading && favoriteProducts.length === 0 && (
          <View style={s.emptyState}>
            <Text style={{ fontSize: 64 }}>🤍</Text>
            <Text style={s.emptyTitle}>{t('favorites_empty_title')}</Text>
            <Text style={s.emptySub}>{t('favorites_empty_sub')}</Text>
            <PressableScale
              style={s.exploreBtn}
              scale={0.97}
              onPress={() => router.push('/(tabs)/explore')}
            >
              <Text style={s.exploreBtnText}>{t('favorites_explore')}</Text>
            </PressableScale>
          </View>
        )}

        {!loading && favoriteProducts.length > 0 && (
          <View style={s.list}>
            {favoriteProducts.map((p) => (
              <PressableScale
                key={p.id}
                style={s.prodCard}
                scale={0.985}
                onPress={() => router.push(`/product/${p.id}`)}
              >
                <View style={s.prodImg}>
                  <Text style={{ fontSize: 44 }}>{p.image}</Text>
                </View>
                <View style={s.prodInfo}>
                  <View style={s.prodTopRow}>
                    <View style={{ flex: 1, marginRight: 6 }}>
                      <Text style={s.prodName} numberOfLines={1}>{p.name}</Text>
                      <Text style={s.prodVendor}>{p.vendor}</Text>
                      <Text style={s.prodLoc}>📍 {p.location}</Text>
                    </View>
                    <WishlistButton productId={p.id} style={s.wishBtn} size={14} />
                  </View>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                    {p.badges.map((b) => <TrustBadge key={b} type={b} small />)}
                    <ShippabilityBadge level={p.shippability} />
                  </View>
                  <View style={s.prodBottom}>
                    <View>
                      <Text style={s.prodPrice}>₹{p.price}</Text>
                      {p.originalPrice > p.price && (
                        <Text style={s.prodOrig}>₹{p.originalPrice}</Text>
                      )}
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 2 }}>
                      <Text style={s.prodRating}>★ {p.rating} ({p.reviews})</Text>
                      <CartButton product={p} />
                    </View>
                  </View>
                </View>
              </PressableScale>
            ))}
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f5f7' },

  header: {
    backgroundColor: '#c75a28',
    paddingHorizontal: 16,
    paddingBottom: 16,
    shadowColor: '#c75a28',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { width: 64 },
  backText: { fontSize: 14, color: '#fff', fontWeight: '700' },
  headerMid: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#fff' },
  headerCount: { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 },

  content: { paddingHorizontal: 16, paddingTop: 16 },

  center: { paddingTop: 64, alignItems: 'center', gap: 10 },
  loadingText: { fontSize: 13, color: '#9ca3af' },

  emptyState: {
    paddingTop: 80, alignItems: 'center', gap: 12, paddingHorizontal: 32,
  },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#111827', textAlign: 'center' },
  emptySub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', lineHeight: 20 },
  exploreBtn: {
    marginTop: 8, backgroundColor: '#c75a28', borderRadius: 14,
    paddingHorizontal: 24, paddingVertical: 14,
    shadowColor: '#c75a28', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 4,
  },
  exploreBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },

  list: { gap: 12 },
  prodCard: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden',
    borderWidth: 1, borderColor: '#f0f0f3',
    shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 3,
  },
  prodImg: { width: 112, backgroundColor: '#fff7f5', alignItems: 'center', justifyContent: 'center' },
  prodInfo: { flex: 1, padding: 12 },
  prodTopRow: { flexDirection: 'row', justifyContent: 'space-between' },
  prodName: { fontSize: 13, fontWeight: '700', color: '#111827' },
  prodVendor: { fontSize: 10, color: '#6b7280', marginTop: 1 },
  prodLoc: { fontSize: 10, color: '#9ca3af' },
  wishBtn: {
    width: 30, height: 30, borderRadius: 15,
    borderWidth: 1, borderColor: '#f0f0f3', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff',
  },
  prodBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 8 },
  prodPrice: { fontSize: 15, fontWeight: '800', color: '#c75a28' },
  prodOrig: { fontSize: 10, color: '#9ca3af', textDecorationLine: 'line-through', marginTop: 1 },
  prodRating: { fontSize: 10, color: '#6b7280' },
});
