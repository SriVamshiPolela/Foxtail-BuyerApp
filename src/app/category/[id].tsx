import { useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';

import { TrustBadge, ShippabilityBadge } from '@/components/buyer-ui';
import { PressableScale } from '@/components/pressable-scale';
import { CartButton } from '@/components/cart-button';
import { WishlistButton } from '@/components/wishlist-button';
import { getProductsByCategory, getCategories } from '@/services/products';
import { products as mockProducts } from '@/data/mock';
import type { Product, Category } from '@/types';

// Keyword fallback when catalog API is offline
const FALLBACK_KEYWORDS: Record<string, string[]> = {
  farm_products:   ['farm', 'organic', 'fresh', 'milk', 'dairy', 'rice', 'tomato', 'turmeric'],
  processed_foods: ['pickle', 'ghee', 'bilona', 'processed'],
  foods:           ['milk', 'rice', 'tomato', 'ghee'],
  arts_handmade:   ['saree', 'pottery', 'woven', 'handmade', 'ikat', 'clay'],
  services:        [],
};

function mockFallback(categoryId: string): Product[] {
  const kws = FALLBACK_KEYWORDS[categoryId] ?? [];
  if (!kws.length) return mockProducts;
  return mockProducts.filter((p) =>
    kws.some((kw) =>
      p.name.toLowerCase().includes(kw) ||
      p.category.toLowerCase().includes(kw) ||
      p.description.toLowerCase().includes(kw),
    ),
  );
}

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    getCategories().then((cats) =>
      setCategory(cats.find((c) => c.id === id) ?? null),
    );

    getProductsByCategory(id)
      .then((prods) => setProducts(prods.length ? prods : mockFallback(id)))
      .catch(() => setProducts(mockFallback(id)))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <View style={s.screen}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={s.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [s.backBtn, pressed && { opacity: 0.6 }]}
          hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
        >
          <Text style={s.backText}>← Back</Text>
        </Pressable>
        <View style={s.headerMid}>
          {category && <Text style={s.headerIcon}>{category.icon}</Text>}
          <Text style={s.headerTitle} numberOfLines={1}>
            {category?.name ?? 'Category'}
          </Text>
          {!loading && (
            <Text style={s.headerSub}>{products.length} products</Text>
          )}
        </View>
        <View style={{ width: 64 }} />
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.listContent}>
        {loading && (
          <View style={s.center}>
            <ActivityIndicator size="large" color="#c75a28" />
            <Text style={s.loadingText}>Loading products…</Text>
          </View>
        )}

        {!loading && products.length === 0 && (
          <View style={s.center}>
            <Text style={{ fontSize: 52 }}>🌿</Text>
            <Text style={s.emptyTitle}>No products yet</Text>
            <Text style={s.emptySub}>Vendors are adding products — check back soon!</Text>
          </View>
        )}

        {!loading && products.map((p) => (
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
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
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
                  <Text style={s.prodOrig}>₹{p.originalPrice}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 2 }}>
                  <Text style={s.prodRating}>★ {p.rating} ({p.reviews})</Text>
                  <CartButton product={p} />
                </View>
              </View>
            </View>
          </PressableScale>
        ))}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f5f7' },

  header: {
    backgroundColor: '#c75a28',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    shadowColor: '#c75a28',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  backBtn: { width: 64 },
  backText: { fontSize: 14, color: '#fff', fontWeight: '700' },
  headerMid: { flex: 1, alignItems: 'center', gap: 2 },
  headerIcon: { fontSize: 26 },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#fff', textAlign: 'center' },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: '600' },

  listContent: { paddingHorizontal: 16, paddingTop: 16, gap: 12 },

  center: { paddingTop: 64, alignItems: 'center', gap: 10, paddingHorizontal: 32 },
  loadingText: { fontSize: 13, color: '#9ca3af' },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#111827', textAlign: 'center' },
  emptySub: { fontSize: 13, color: '#6b7280', textAlign: 'center', lineHeight: 18 },

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
    width: 30, height: 30, borderRadius: 15,
    borderWidth: 1, borderColor: '#f0f0f3',
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff',
  },
  prodBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  prodPrice: { fontSize: 15, fontWeight: '800', color: '#c75a28' },
  prodOrig: { fontSize: 10, color: '#9ca3af', textDecorationLine: 'line-through', marginTop: 1 },
  prodRating: { fontSize: 10, color: '#6b7280' },
});
