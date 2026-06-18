import { useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/pressable-scale';
import { getVendors } from '@/services/products';
import type { Vendor } from '@/types';

export default function VendorsScreen() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVendors()
      .then(setVendors)
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={s.screen}>
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
              <Text style={s.headerTitle}>Local Vendors</Text>
              {!loading && (
                <Text style={s.headerCount}>{vendors.length} vendors near you</Text>
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
          </View>
        )}

        {!loading && vendors.map((v) => (
          <PressableScale
            key={v.id}
            style={s.vendorCard}
            scale={0.98}
            onPress={() => router.push(`/vendor/${v.id}`)}
          >
            <View style={s.cardTop}>
              <View style={s.vendorImg}>
                <Text style={{ fontSize: 30 }}>{v.image}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.vendorName}>{v.name}</Text>
                <Text style={s.vendorType}>{v.type}</Text>
                <Text style={s.vendorMeta}>★ {v.rating}  ·  {v.distance}  ·  {v.productCount} products</Text>
              </View>
            </View>
            {v.description && (
              <Text style={s.vendorDesc} numberOfLines={2}>{v.description}</Text>
            )}
            <View style={s.visitBtn}>
              <Text style={s.visitTxt}>Visit Shop →</Text>
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

  content: { paddingHorizontal: 16, paddingTop: 16, gap: 12 },

  center: { paddingTop: 64, alignItems: 'center' },

  vendorCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: '#f0f0f3', gap: 10,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 3,
  },
  cardTop: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  vendorImg: {
    width: 56, height: 56, backgroundColor: '#fff7f5', borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#fdc9b0',
  },
  vendorName: { fontSize: 15, fontWeight: '800', color: '#111827' },
  vendorType: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  vendorMeta: { fontSize: 12, color: '#c75a28', fontWeight: '700', marginTop: 4 },
  vendorDesc: { fontSize: 12, color: '#9ca3af', lineHeight: 18 },
  visitBtn: {
    backgroundColor: '#c75a28', borderRadius: 10, height: 36,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#c75a28', shadowOpacity: 0.25, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  visitTxt: { fontSize: 12, color: '#fff', fontWeight: '700' },
});
