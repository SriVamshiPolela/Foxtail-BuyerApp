import { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useUserStore } from '@/store/user';
import { detectLocation } from '@/services/location';

const BRAND = '#c75a28';

const QUICK_LOCATIONS = [
  { area: 'Kukatpally',     district: 'Medchal District, Telangana' },
  { area: 'Kondapur',       district: 'Rangareddy District, Telangana' },
  { area: 'Ameerpet',       district: 'Hyderabad District, Telangana' },
  { area: 'Dilsukhnagar',   district: 'Hyderabad District, Telangana' },
  { area: 'Secunderabad',   district: 'Hyderabad District, Telangana' },
  { area: 'Warangal',       district: 'Hanamkonda District, Telangana' },
];

export default function LocationPickerScreen() {
  const location  = useUserStore((s) => s.location);
  const district  = useUserStore((s) => s.district);
  const addresses = useUserStore((s) => s.addresses);
  const setLocation = useUserStore((s) => s.setLocation);

  const [detecting, setDetecting]   = useState(false);
  const [detectErr, setDetectErr]   = useState<string | null>(null);
  const [query,     setQuery]       = useState('');

  async function handleDetect() {
    setDetecting(true);
    setDetectErr(null);
    try {
      const result = await detectLocation();
      setLocation(result.locality, result.district);
      router.back();
    } catch (err) {
      setDetectErr(err instanceof Error ? err.message : 'Could not detect location');
      setDetecting(false);
    }
  }

  function handlePick(area: string, dist: string) {
    setLocation(area, dist);
    router.back();
  }

  function handleManualSave() {
    const q = query.trim();
    if (!q) return;
    setLocation(q, district);
    router.back();
  }

  const filtered = QUICK_LOCATIONS.filter((l) =>
    !query || l.area.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={s.screen}>
        {/* Header */}
        <View style={s.header}>
          <SafeAreaView edges={['top']}>
            <View style={s.headerRow}>
              <Pressable
                onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')}
                style={({ pressed }) => [s.backBtn, pressed && { opacity: 0.6 }]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={s.backTxt}>← Back</Text>
              </Pressable>
              <Text style={s.headerTitle}>Delivery Location</Text>
              <View style={{ width: 60 }} />
            </View>
          </SafeAreaView>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={s.content}
        >
          {/* Search bar */}
          <View style={s.searchBox}>
            <Text style={s.searchIcon}>🔍</Text>
            <TextInput
              style={s.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="Search area or type manually…"
              placeholderTextColor="#9ca3af"
              returnKeyType="done"
              onSubmitEditing={handleManualSave}
              autoCorrect={false}
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery('')} hitSlop={8}>
                <Text style={s.clearX}>✕</Text>
              </Pressable>
            )}
          </View>

          {/* Current location */}
          <View style={s.currentBox}>
            <Text style={s.currentLabel}>CURRENT LOCATION</Text>
            <View style={s.currentRow}>
              <Text style={{ fontSize: 18 }}>📍</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.currentArea}>{location}</Text>
                <Text style={s.currentDist}>{district}</Text>
              </View>
              <View style={s.activeDot} />
            </View>
          </View>

          {/* Detect GPS button */}
          <Pressable
            onPress={handleDetect}
            disabled={detecting}
            style={({ pressed }) => [s.detectBtn, pressed && { opacity: 0.85 }]}
          >
            {detecting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={{ fontSize: 18 }}>🎯</Text>
            )}
            <View style={{ flex: 1 }}>
              <Text style={s.detectTitle}>
                {detecting ? 'Detecting…' : 'Use my current location'}
              </Text>
              <Text style={s.detectSub}>
                {detecting ? 'Getting GPS fix…' : 'Enable GPS for accurate results'}
              </Text>
            </View>
          </Pressable>

          {detectErr && (
            <View style={s.errBox}>
              <Text style={s.errTxt}>{detectErr}</Text>
              {detectErr.includes('Settings') && (
                <Pressable
                  onPress={() => Linking.openSettings()}
                  style={({ pressed }) => [s.settingsLink, pressed && { opacity: 0.7 }]}
                >
                  <Text style={s.settingsLinkTxt}>Open Settings →</Text>
                </Pressable>
              )}
            </View>
          )}

          {/* Saved addresses */}
          {addresses.length > 0 && (
            <View style={s.group}>
              <Text style={s.groupLabel}>SAVED ADDRESSES</Text>
              {addresses.map((addr) => (
                <Pressable
                  key={addr.id}
                  style={({ pressed }) => [s.row, pressed && { backgroundColor: '#fef6f2' }]}
                  onPress={() => handlePick(addr.city || addr.line1, `${addr.district}, ${addr.state}`)}
                >
                  <View style={s.rowIcon}>
                    <Text style={{ fontSize: 16 }}>
                      {addr.label === 'Home' ? '🏠' : addr.label === 'Work' ? '🏢' : '📌'}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.rowTitle}>{addr.label} — {addr.city}</Text>
                    <Text style={s.rowSub} numberOfLines={1}>{addr.line1}, {addr.pincode}</Text>
                  </View>
                  <Text style={s.chevron}>›</Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Popular areas */}
          <View style={s.group}>
            <Text style={s.groupLabel}>POPULAR AREAS</Text>
            {filtered.map((loc) => (
              <Pressable
                key={loc.area}
                style={({ pressed }) => [s.row, pressed && { backgroundColor: '#fef6f2' }]}
                onPress={() => handlePick(loc.area, loc.district)}
              >
                <View style={s.rowIcon}>
                  <Text style={{ fontSize: 16 }}>📍</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.rowTitle}>{loc.area}</Text>
                  <Text style={s.rowSub}>{loc.district}</Text>
                </View>
                <Text style={s.chevron}>›</Text>
              </Pressable>
            ))}
            {filtered.length === 0 && query.length > 0 && (
              <Pressable
                style={({ pressed }) => [s.row, pressed && { backgroundColor: '#fef6f2' }]}
                onPress={handleManualSave}
              >
                <View style={s.rowIcon}><Text style={{ fontSize: 16 }}>✏️</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={s.rowTitle}>Set to "{query}"</Text>
                  <Text style={s.rowSub}>Tap to use this as your area</Text>
                </View>
                <Text style={s.chevron}>›</Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f5f7' },

  header: {
    backgroundColor: BRAND,
    paddingHorizontal: 16,
    paddingBottom: 16,
    shadowColor: BRAND, shadowOpacity: 0.3, shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 }, elevation: 6,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 60, paddingVertical: 8 },
  backTxt: { fontSize: 14, color: '#fff', fontWeight: '700' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#fff' },

  content: { padding: 16, gap: 14, paddingBottom: 40 },

  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#fff', borderRadius: 14,
    paddingHorizontal: 14, height: 48,
    borderWidth: 1, borderColor: '#e5e7eb',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  searchIcon: { fontSize: 14 },
  searchInput: { flex: 1, fontSize: 14, color: '#111827' },
  clearX: { fontSize: 12, color: '#9ca3af', fontWeight: '700' },

  currentBox: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: '#e5e7eb',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  currentLabel: {
    fontSize: 9, fontWeight: '700', color: '#9ca3af',
    letterSpacing: 1, marginBottom: 10,
  },
  currentRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  currentArea: { fontSize: 15, fontWeight: '800', color: '#111827' },
  currentDist: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  activeDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#22c55e',
    shadowColor: '#22c55e', shadowOpacity: 0.5, shadowRadius: 4, elevation: 2,
  },

  detectBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: BRAND, borderRadius: 14, padding: 16,
    shadowColor: BRAND, shadowOpacity: 0.35, shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 }, elevation: 4,
  },
  detectTitle: { fontSize: 14, fontWeight: '800', color: '#fff' },
  detectSub:   { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 },

  errBox: { backgroundColor: '#fef2f2', borderRadius: 10, padding: 12, gap: 8 },
  errTxt: { fontSize: 12, color: '#ef4444', lineHeight: 18 },
  settingsLink: { alignSelf: 'flex-start' },
  settingsLinkTxt: { fontSize: 12, color: '#c75a28', fontWeight: '700', textDecorationLine: 'underline' },

  group: {
    backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden',
    borderWidth: 1, borderColor: '#f0f0f3',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  groupLabel: {
    fontSize: 9, fontWeight: '700', color: '#9ca3af', letterSpacing: 1,
    paddingHorizontal: 14, paddingTop: 12, paddingBottom: 6,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 14, paddingVertical: 13,
    borderTopWidth: 1, borderTopColor: '#f9fafb',
  },
  rowIcon: {
    width: 38, height: 38, backgroundColor: '#fff7f5',
    borderRadius: 19, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#fdc9b0',
  },
  rowTitle: { fontSize: 13, fontWeight: '700', color: '#111827' },
  rowSub:   { fontSize: 11, color: '#6b7280', marginTop: 1 },
  chevron:  { fontSize: 20, color: '#d1d5db' },
});
