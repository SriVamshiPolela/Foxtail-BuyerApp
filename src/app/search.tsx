import { useRef, useState, useEffect } from 'react';
import {
  View, Text, TextInput, FlatList, Pressable, ActivityIndicator, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { PressableScale } from '@/components/pressable-scale';
import { TrustBadge, ShippabilityBadge } from '@/components/buyer-ui';
import { CartButton } from '@/components/cart-button';
import { searchProducts } from '@/services/search';
import type { Product } from '@/types';

const MAX_RECENT = 6;

export default function SearchScreen() {
  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);


  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setHasSearched(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      const res = await searchProducts(q);
      setResults(res);
      setLoading(false);
      setHasSearched(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const commitSearch = () => {
    const q = query.trim();
    if (!q) return;
    setRecent((prev) => [q, ...prev.filter((r) => r !== q)].slice(0, MAX_RECENT));
  };

  const showRecent = !query.trim() && recent.length > 0;
  const showEmpty = hasSearched && !loading && results.length === 0;
  const showResults = results.length > 0;

  return (
    <View style={s.screen}>
      <SafeAreaView edges={['top']} style={s.header}>
        <Pressable
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/explore')}
          style={({ pressed }) => [s.backBtn, pressed && { opacity: 0.6 }]}
          hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
        >
          <Text style={s.backArrow}>←</Text>
        </Pressable>
        <View style={s.searchPill}>
          <Text style={s.pillIcon}>🔍</Text>
          <TextInput
            ref={inputRef}
            style={s.pillInput}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={commitSearch}
            placeholder="Search vegetables, handlooms..."
            placeholderTextColor="#9ca3af"
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <Pressable
              onPress={() => { setQuery(''); setResults([]); setHasSearched(false); }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={s.clearX}>✕</Text>
            </Pressable>
          )}
        </View>
      </SafeAreaView>

      <FlatList
        data={showResults ? results : []}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={s.listContent}
        ListHeaderComponent={() => (
          <>
            {showRecent && (
              <View style={s.recentWrap}>
                <View style={s.recentHead}>
                  <Text style={s.recentTitle}>Recent Searches</Text>
                  <Pressable onPress={() => setRecent([])}>
                    <Text style={s.clearAll}>Clear All</Text>
                  </Pressable>
                </View>
                {recent.map((term) => (
                  <Pressable
                    key={term}
                    style={({ pressed }) => [s.recentRow, pressed && { backgroundColor: '#f9fafb' }]}
                    onPress={() => setQuery(term)}
                  >
                    <Text style={s.recentClock}>🕐</Text>
                    <Text style={s.recentTerm}>{term}</Text>
                    <Pressable
                      onPress={() => setRecent((p) => p.filter((r) => r !== term))}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text style={s.recentX}>✕</Text>
                    </Pressable>
                  </Pressable>
                ))}
              </View>
            )}

            {loading && (
              <View style={s.loadRow}>
                <ActivityIndicator color="#c75a28" />
              </View>
            )}

            {showEmpty && (
              <View style={s.emptyWrap}>
                <Text style={{ fontSize: 52 }}>🔍</Text>
                <Text style={s.emptyTitle}>No results for "{query}"</Text>
                <Text style={s.emptySub}>Try a product name, vendor, or category</Text>
              </View>
            )}

            {showResults && (
              <Text style={s.countLabel}>
                {results.length} result{results.length !== 1 ? 's' : ''} for "{query.trim()}"
              </Text>
            )}
          </>
        )}
        renderItem={({ item: p }) => (
          <PressableScale
            style={s.prodCard}
            scale={0.985}
            onPress={() => router.push(`/product/${p.id}`)}
          >
            <View style={s.prodImg}>
              <Text style={{ fontSize: 44 }}>{p.image}</Text>
            </View>
            <View style={s.prodInfo}>
              <Text style={s.prodName} numberOfLines={1}>{p.name}</Text>
              <Text style={s.prodVendor}>{p.vendor}</Text>
              <Text style={s.prodLoc}>📍 {p.location}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                {p.badges.map((b) => <TrustBadge key={b} type={b} small />)}
                <ShippabilityBadge level={p.shippability} />
              </View>
              <View style={s.prodBottom}>
                <View>
                  <Text style={s.prodPrice}>₹{p.price}</Text>
                  <Text style={s.prodOrig}>₹{p.originalPrice}</Text>
                </View>
                <CartButton product={p} />
              </View>
            </View>
          </PressableScale>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />
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
    gap: 10,
    shadowColor: '#c75a28',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  backBtn: { padding: 4 },
  backArrow: { fontSize: 22, color: '#fff', fontWeight: '700' },
  searchPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 46,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  pillIcon: { fontSize: 14 },
  pillInput: { flex: 1, fontSize: 13, color: '#111827' },
  clearX: { fontSize: 12, color: '#9ca3af', fontWeight: '700' },

  listContent: { paddingBottom: 32 },

  recentWrap: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f0f0f3',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  recentHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f3',
  },
  recentTitle: {
    fontSize: 12, fontWeight: '700', color: '#6b7280',
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  clearAll: { fontSize: 12, color: '#c75a28', fontWeight: '700' },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f9fafb',
  },
  recentClock: { fontSize: 14 },
  recentTerm: { flex: 1, fontSize: 13, color: '#374151', fontWeight: '500' },
  recentX: { fontSize: 11, color: '#d1d5db' },

  loadRow: { paddingTop: 48, alignItems: 'center' },

  emptyWrap: {
    paddingTop: 56,
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 32,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#111827', textAlign: 'center' },
  emptySub: { fontSize: 13, color: '#6b7280', textAlign: 'center', lineHeight: 18 },

  countLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },

  prodCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    marginHorizontal: 16,
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
  prodBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  prodPrice: { fontSize: 15, fontWeight: '800', color: '#c75a28' },
  prodOrig: { fontSize: 10, color: '#9ca3af', textDecorationLine: 'line-through', marginTop: 1 },
});
