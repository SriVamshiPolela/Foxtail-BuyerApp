import { useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TrustBadge, ShippabilityBadge } from '@/components/buyer-ui';
import { PressableScale } from '@/components/pressable-scale';
import { WishlistButton } from '@/components/wishlist-button';
import { getProductById } from '@/services/products';
import { useCartStore } from '@/store/cart';
import type { Product } from '@/types';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);
  const alreadyInCart = cartItems.some((i) => i.product.id === id);

  useEffect(() => {
    if (!id) return;
    getProductById(id).then((p) => {
      setProduct(p);
      setLoading(false);
    });
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const discount = product
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#c75a28" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={s.center}>
        <Text style={s.errorText}>Product not found.</Text>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backBtnText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={s.screen}>
      <SafeAreaView edges={['top']} style={s.topBar}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [s.iconBtn, pressed && { opacity: 0.6 }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={s.iconBtnText}>← Back</Text>
        </Pressable>
        <Text style={s.topBarTitle} numberOfLines={1}>{product.name}</Text>
        <WishlistButton productId={id} style={[s.iconBtn, s.wishIconBtn]} size={20} />
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={s.heroImage}>
          <Text style={s.heroEmoji}>{product.image}</Text>
          {discount > 0 && (
            <View style={s.discountBadge}>
              <Text style={s.discountText}>{discount}% OFF</Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View style={s.infoSection}>
          <Text style={s.productName}>{product.name}</Text>

          <View style={s.vendorRow}>
            <View style={s.vendorDot}><Text style={{ fontSize: 12 }}>🏪</Text></View>
            <Text style={s.vendorText}>{product.vendor}</Text>
            <Text style={s.dotSep}>·</Text>
            <Text style={s.locationText}>📍 {product.location}</Text>
          </View>

          {product.vendorId && (
            <Pressable
              onPress={() => router.push(`/vendor/${product.vendorId}`)}
              style={({ pressed }) => [s.visitStoreBtn, pressed && { opacity: 0.7 }]}
            >
              <Text style={s.visitStoreTxt}>🏪  Visit Store →</Text>
            </Pressable>
          )}

          <View style={s.ratingRow}>
            <Text style={s.ratingStars}>★ {product.rating}</Text>
            <Text style={s.ratingCount}>({product.reviews} reviews)</Text>
          </View>

          {/* Badges */}
          <View style={s.badgesRow}>
            {product.badges.map((b) => <TrustBadge key={b} type={b} />)}
            <ShippabilityBadge level={product.shippability} />
          </View>

          {/* Price */}
          <View style={s.priceRow}>
            <Text style={s.price}>₹{product.price}</Text>
            <Text style={s.originalPrice}>₹{product.originalPrice}</Text>
            {discount > 0 && (
              <View style={s.savingsBadge}>
                <Text style={s.savingsText}>Save ₹{product.originalPrice - product.price}</Text>
              </View>
            )}
          </View>

          {/* Description */}
          <View style={s.descSection}>
            <Text style={s.descTitle}>About this product</Text>
            <Text style={s.descText}>{product.description}</Text>
          </View>

          {/* Divider */}
          <View style={s.divider} />

          {/* Quantity Selector */}
          <View style={s.qtySection}>
            <Text style={s.qtyLabel}>Quantity</Text>
            <View style={s.qtyRow}>
              <Pressable
                onPress={() => setQty((q) => Math.max(1, q - 1))}
                style={({ pressed }) => [s.qtyBtn, s.qtyMinus, pressed && { opacity: 0.7 }]}
              >
                <Text style={s.qtyBtnText}>−</Text>
              </Pressable>
              <Text style={s.qtyValue}>{qty}</Text>
              <Pressable
                onPress={() => setQty((q) => q + 1)}
                style={({ pressed }) => [s.qtyBtn, s.qtyPlus, pressed && { opacity: 0.7 }]}
              >
                <Text style={[s.qtyBtnText, { color: '#fff' }]}>+</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Sticky Bottom CTA */}
      <SafeAreaView edges={['bottom']} style={s.bottomBar}>
        <View style={s.totalRow}>
          <Text style={s.totalLabel}>Total</Text>
          <Text style={s.totalValue}>₹{product.price * qty}</Text>
        </View>
        <PressableScale
          onPress={handleAddToCart}
          style={[s.addCartBtn, (added || alreadyInCart) && s.addCartBtnDone]}
          scale={0.96}
        >
          <Text style={s.addCartBtnText}>
            {added ? '✓ Added to Cart!' : alreadyInCart ? '✓ In Cart — Add More' : '🛒  Add to Cart'}
          </Text>
        </PressableScale>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f5f7' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f7', gap: 16 },
  errorText: { fontSize: 15, color: '#6b7280' },
  backBtn: {
    backgroundColor: '#c75a28', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8,
  },
  backBtnText: { color: '#fff', fontWeight: '700' },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    paddingTop: 8,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  topBarTitle: { flex: 1, fontSize: 14, fontWeight: '700', color: '#111827', marginHorizontal: 10 },
  iconBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  iconBtnText: { fontSize: 14, color: '#c75a28', fontWeight: '700' },
  wishIconBtn: { marginLeft: 'auto' },

  heroImage: {
    height: 260,
    backgroundColor: '#fff7f5',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  heroEmoji: { fontSize: 100 },
  discountBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#c75a28',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  discountText: { color: '#fff', fontSize: 12, fontWeight: '800' },

  infoSection: { padding: 20, backgroundColor: '#fff', marginTop: 8, borderRadius: 20 },

  productName: { fontSize: 22, fontWeight: '800', color: '#111827', lineHeight: 28, marginBottom: 10 },

  vendorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  vendorDot: {
    width: 26, height: 26, backgroundColor: '#fff7f5', borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
  },
  vendorText: { fontSize: 13, fontWeight: '700', color: '#374151' },
  dotSep: { color: '#d1d5db', fontSize: 14 },
  locationText: { fontSize: 12, color: '#9ca3af' },

  visitStoreBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff7f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#fdc9b0',
    marginBottom: 12,
  },
  visitStoreTxt: { fontSize: 12, color: '#c75a28', fontWeight: '700' },

  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  ratingStars: { fontSize: 14, fontWeight: '800', color: '#c75a28' },
  ratingCount: { fontSize: 12, color: '#9ca3af' },

  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 },

  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  price: { fontSize: 28, fontWeight: '800', color: '#c75a28' },
  originalPrice: { fontSize: 16, color: '#9ca3af', textDecorationLine: 'line-through', marginTop: 4 },
  savingsBadge: {
    backgroundColor: '#dcfce7', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: '#86efac',
  },
  savingsText: { fontSize: 11, color: '#166534', fontWeight: '700' },

  descSection: { marginBottom: 16 },
  descTitle: { fontSize: 14, fontWeight: '800', color: '#111827', marginBottom: 8 },
  descText: { fontSize: 13, color: '#6b7280', lineHeight: 20 },

  divider: { height: 1, backgroundColor: '#f0f0f3', marginVertical: 16 },

  qtySection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  qtyLabel: { fontSize: 14, fontWeight: '700', color: '#111827' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#e5e7eb' },
  qtyBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  qtyMinus: { backgroundColor: '#f3f4f6' },
  qtyPlus: { backgroundColor: '#c75a28' },
  qtyBtnText: { fontSize: 20, fontWeight: '700', color: '#374151' },
  qtyValue: { width: 40, textAlign: 'center', fontSize: 16, fontWeight: '800', color: '#111827', backgroundColor: '#fff' },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -3 },
    elevation: 10,
    gap: 10,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 12, color: '#9ca3af', fontWeight: '600' },
  totalValue: { fontSize: 20, fontWeight: '800', color: '#111827' },
  addCartBtn: {
    backgroundColor: '#c75a28',
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#c75a28',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  addCartBtnDone: { backgroundColor: '#2d8a4e', shadowColor: '#2d8a4e' },
  addCartBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.2 },
});
