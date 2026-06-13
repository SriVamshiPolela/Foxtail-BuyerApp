import { useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { RangoliBorder, TrustBadge, ShippabilityBadge } from '@/components/buyer-ui';
import { PressableScale } from '@/components/pressable-scale';
import { CartButton } from '@/components/cart-button';
import { WishlistButton } from '@/components/wishlist-button';
import { getFeaturedProducts, getCategories, getVendors } from '@/services/products';
import { useUserStore } from '@/store/user';
import type { Product, Category, Vendor } from '@/types';

export default function HomeScreen() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  const location = useUserStore((s) => s.location);
  const district = useUserStore((s) => s.district);

  useEffect(() => {
    Promise.all([getFeaturedProducts(), getCategories(), getVendors()]).then(
      ([fp, cats, vs]) => {
        setFeatured(fp);
        setCategories(cats);
        setVendors(vs);
        setLoading(false);
      },
    );
  }, []);

  return (
    <ScrollView style={s.screen} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={s.header}>
        <SafeAreaView edges={['top']}>
          <View style={s.headerRow}>
            <View style={s.brand}>
              <View style={s.brandIcon}><Text style={{ fontSize: 20 }}>🪔</Text></View>
              <View>
                <Text style={s.brandName}>Harvest Connect</Text>
                <Text style={s.brandSub}>Local Treasures, Delivered</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Pressable
                style={({ pressed }) => [s.hBtn, pressed && { opacity: 0.65, transform: [{ scale: 0.9 }] }]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text>🔔</Text>
              </Pressable>
              <Pressable
                onPress={() => router.push('/favorites')}
                style={({ pressed }) => [s.hBtn, pressed && { opacity: 0.65, transform: [{ scale: 0.9 }] }]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text>🤍</Text>
              </Pressable>
            </View>
          </View>

          <Pressable style={({ pressed }) => [s.locRow, pressed && { opacity: 0.75 }]}>
            <Text style={s.locText}>
              📍 Delivering to{' '}
              <Text style={s.locCity}>{location}, {district.split(',')[0]} ▾</Text>
            </Text>
          </Pressable>

          <Pressable style={s.searchRow} onPress={() => router.push('/search')}>
            <Text style={s.searchIcon}>🔍</Text>
            <Text style={s.searchPlaceholder}>Search vegetables, handlooms, spices...</Text>
            <View style={s.filterBtn}>
              <Text style={{ fontSize: 13 }}>⚙️</Text>
            </View>
          </Pressable>
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
      {loading ? (
        <View style={s.loadRow}><ActivityIndicator color="#c75a28" /></View>
      ) : (
        <View style={s.catSection}>
          <View style={[s.sectionHead, { paddingHorizontal: 16 }]}>
            <Text style={s.sectionTitle}>Shop by Category</Text>
            <Pressable
              onPress={() => router.navigate('/(tabs)/explore')}
              style={({ pressed }) => pressed && { opacity: 0.6 }}
            >
              <Text style={s.seeAll}>View All ›</Text>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.catScroll}
          >
            {categories.map((c) => (
              <PressableScale key={c.id} style={s.catCard} scale={0.93} onPress={() => router.push(`/category/${c.id}`)}>
                <View style={s.catIcon}>
                  <Text style={{ fontSize: 26 }}>{c.icon}</Text>
                </View>
                <Text style={s.catName} numberOfLines={2}>{c.name}</Text>
                <Text style={s.catCount}>{c.count}</Text>
              </PressableScale>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={{ paddingVertical: 20 }}><RangoliBorder /></View>

      {/* Local Vendors */}
      {!loading && (
        <View style={s.section}>
          <View style={s.sectionHead}>
            <View>
              <Text style={s.sectionTitle}>Near Your Mandal</Text>
              <Text style={s.sectionSub}>{location}, {district}</Text>
            </View>
            <Pressable
              onPress={() => router.push('/vendors')}
              style={({ pressed }) => pressed && { opacity: 0.6 }}
            >
              <Text style={s.seeAll}>See All ›</Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 12, paddingBottom: 4 }}>
              {vendors.map((v) => (
                <PressableScale key={v.id} style={s.vendorCard} scale={0.97} onPress={() => router.push(`/vendor/${v.id}`)}>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={s.vendorImg}><Text style={{ fontSize: 26 }}>{v.image}</Text></View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.vendorName} numberOfLines={1}>{v.name}</Text>
                      <Text style={s.vendorType}>{v.type} · {v.productCount} items</Text>
                      <Text style={s.vendorMeta}>★ {v.rating} · {v.distance}</Text>
                    </View>
                  </View>
                  <View style={s.visitBtn}><Text style={s.visitTxt}>Visit Shop →</Text></View>
                </PressableScale>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Featured Products */}
      {!loading && (
        <View style={s.section}>
          <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>Featured Products</Text>
            <Pressable
              onPress={() => router.navigate('/(tabs)/explore')}
              style={({ pressed }) => pressed && { opacity: 0.6 }}
            >
              <Text style={s.seeAll}>View All ›</Text>
            </Pressable>
          </View>
          <View style={{ gap: 12 }}>
            {featured.map((p) => (
              <PressableScale
                key={p.id}
                style={s.prodCard}
                scale={0.985}
                onPress={() => router.push(`/product/${p.id}`)}
              >
                <View style={s.prodImg}><Text style={{ fontSize: 44 }}>{p.image}</Text></View>
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
          </View>
        </View>
      )}

      {/* Regional Banner */}
      <View style={[s.section, { paddingBottom: 32 }]}>
        <PressableScale style={s.banner} scale={0.98}>
          <View style={s.bannerBadge}><Text style={s.bannerBadgeText}>Telangana Special</Text></View>
          <Text style={s.bannerTitle}>Discover Authentic{'\n'}Telangana Crafts</Text>
          <Text style={s.bannerSub}>Bidri work, Nirmal paintings & more</Text>
          <View style={s.bannerBtn}><Text style={s.bannerBtnText}>Explore Now →</Text></View>
          <Text style={s.bannerDeco}>🏺</Text>
        </PressableScale>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f5f7' },
  loadRow: { height: 80, alignItems: 'center', justifyContent: 'center' },

  header: {
    backgroundColor: '#c75a28',
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#c75a28',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 8 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandIcon: {
    width: 42, height: 42, backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: 21,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.35)',
  },
  brandName: { color: '#fff', fontWeight: '800', fontSize: 18, letterSpacing: 0.2 },
  brandSub: { color: 'rgba(255,255,255,0.8)', fontSize: 11 },
  hBtn: {
    width: 38, height: 38, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 19,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  locRow: { flexDirection: 'row', marginBottom: 12 },
  locText: { color: 'rgba(255,255,255,0.85)', fontSize: 12 },
  locCity: { color: '#fff', fontWeight: '700' },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 14, paddingHorizontal: 14, height: 46,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  searchIcon: { marginRight: 8, fontSize: 14 },
  searchPlaceholder: { flex: 1, fontSize: 13, color: '#9ca3af' },
  filterBtn: {
    width: 32, height: 32, backgroundColor: '#f3f4f6', borderRadius: 9,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e5e7eb',
  },

  section: { paddingHorizontal: 16, paddingTop: 16 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  sectionSub: { fontSize: 10, color: '#6b7280', marginTop: 2 },
  seeAll: { fontSize: 12, color: '#c75a28', fontWeight: '700' },

  trustBanner: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#dcfce7', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: '#bbf7d0',
  },
  trustTitle: { fontSize: 12, fontWeight: '700', color: '#111827' },
  trustSub: { fontSize: 10, color: '#6b7280' },
  miniAvatar: {
    width: 24, height: 24, backgroundColor: '#d1fae5', borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff',
  },
  trustCount: { fontSize: 10, color: '#166534', marginLeft: 6, fontWeight: '600' },

  catSection: { paddingTop: 16 },
  catScroll: { paddingLeft: 16, paddingRight: 16, gap: 10 },
  catCard: {
    width: 76,
    alignItems: 'center',
    gap: 6,
  },
  catIcon: {
    width: 62, height: 62,
    backgroundColor: '#fff7f5',
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#fdc9b0',
    shadowColor: '#c75a28',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  catName: { fontSize: 10, fontWeight: '700', color: '#111827', textAlign: 'center', lineHeight: 13 },
  catCount: { fontSize: 9, color: '#9ca3af', fontWeight: '500' },

  vendorCard: {
    width: 220, backgroundColor: '#fff', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: '#f0f0f3', gap: 12,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 3,
  },
  vendorImg: { width: 48, height: 48, backgroundColor: '#fff7f5', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  vendorName: { fontSize: 13, fontWeight: '700', color: '#111827' },
  vendorType: { fontSize: 10, color: '#6b7280', marginTop: 1 },
  vendorMeta: { fontSize: 11, color: '#c75a28', fontWeight: '700', marginTop: 3 },
  visitBtn: {
    backgroundColor: '#c75a28', borderRadius: 10, height: 34,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#c75a28', shadowOpacity: 0.3, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  visitTxt: { fontSize: 12, color: '#fff', fontWeight: '700' },

  prodCard: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden',
    borderWidth: 1, borderColor: '#f0f0f3',
    shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 3,
  },
  prodImg: { width: 112, backgroundColor: '#fff7f5', alignItems: 'center', justifyContent: 'center' },
  prodInfo: { flex: 1, padding: 12 },
  prodName: { fontSize: 13, fontWeight: '700', color: '#111827' },
  prodVendor: { fontSize: 10, color: '#6b7280', marginTop: 1 },
  prodLoc: { fontSize: 10, color: '#9ca3af' },
  wishBtn: {
    width: 30, height: 30, borderRadius: 15,
    borderWidth: 1, borderColor: '#f0f0f3', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff',
  },
  prodBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 8 },
  prodRating: { fontSize: 10, color: '#6b7280' },
  prodPrice: { fontSize: 15, fontWeight: '800', color: '#c75a28' },
  prodOrig: { fontSize: 10, color: '#9ca3af', textDecorationLine: 'line-through', marginTop: 1 },

  banner: {
    backgroundColor: '#c75a28', borderRadius: 20, padding: 20, overflow: 'hidden',
    shadowColor: '#c75a28', shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  bannerBadge: {
    backgroundColor: 'rgba(255,255,255,0.22)', paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 6, alignSelf: 'flex-start', marginBottom: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  bannerBadgeText: { color: '#fff', fontSize: 10, fontWeight: '600' },
  bannerTitle: { color: '#fff', fontWeight: '800', fontSize: 22, lineHeight: 28 },
  bannerSub: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 4 },
  bannerBtn: {
    backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 18, paddingVertical: 10,
    alignSelf: 'flex-start', marginTop: 14,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  bannerBtnText: { color: '#c75a28', fontWeight: '800', fontSize: 13 },
  bannerDeco: { position: 'absolute', right: 16, top: 12, fontSize: 60, opacity: 0.18 },
});
