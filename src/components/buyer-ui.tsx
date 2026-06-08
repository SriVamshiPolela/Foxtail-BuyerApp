import { View, Text, StyleSheet } from 'react-native';

export function RangoliBorder() {
  const colors = ['#c75a28', '#d4a017', '#4a3a7a'];
  return (
    <View style={s.row}>
      {Array.from({ length: 12 }).map((_, i) => (
        <View key={i} style={[s.dot, { backgroundColor: colors[i % 3] }]} />
      ))}
    </View>
  );
}

type TrustType = 'verified' | 'local' | 'organic' | 'handmade';

export function TrustBadge({ type, small = false }: { type: TrustType; small?: boolean }) {
  const config: Record<TrustType, { label: string; bg: string; icon: string }> = {
    verified: { label: 'Verified', bg: '#2d8a4e', icon: '✓' },
    local: { label: 'Local', bg: '#c75a28', icon: '📍' },
    organic: { label: 'Organic', bg: '#2d8a4e', icon: '🌿' },
    handmade: { label: 'Handmade', bg: '#d97706', icon: '♥' },
  };
  const c = config[type];
  return (
    <View style={[s.trustBadge, { backgroundColor: c.bg, paddingHorizontal: small ? 4 : 8, paddingVertical: small ? 1 : 3 }]}>
      <Text style={[s.trustText, { fontSize: small ? 9 : 11 }]}>{c.icon} {c.label}</Text>
    </View>
  );
}

type ShipLevel = 'mandal' | 'district' | 'state' | 'national';

export function ShippabilityBadge({ level }: { level: ShipLevel }) {
  const config: Record<ShipLevel, { label: string; bg: string; text: string; icon: string }> = {
    mandal: { label: 'Mandal Only', bg: '#f3f4f6', text: '#374151', icon: '🏘️' },
    district: { label: 'Within District', bg: '#f3f4f6', text: '#374151', icon: '🏙️' },
    state: { label: 'Within State', bg: '#fef3c7', text: '#92400e', icon: '🗺️' },
    national: { label: 'All India', bg: '#dcfce7', text: '#166534', icon: '🇮🇳' },
  };
  const c = config[level];
  return (
    <View style={[s.shipBadge, { backgroundColor: c.bg }]}>
      <Text style={[s.shipText, { color: c.text }]}>{c.icon} {c.label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', gap: 4, justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  trustBadge: { borderRadius: 4, alignSelf: 'flex-start' },
  trustText: { color: '#fff', fontWeight: '600' },
  shipBadge: { borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start' },
  shipText: { fontSize: 9, fontWeight: '600' },
});
