import { View, Text, StyleSheet } from 'react-native';

export function RangoliBorder() {
  const pattern = [
    { color: '#c75a28', size: 9 },
    { color: '#d4a017', size: 6 },
    { color: '#4a3a7a', size: 9 },
    { color: '#d4a017', size: 6 },
    { color: '#c75a28', size: 9 },
    { color: '#2d8a4e', size: 6 },
    { color: '#4a3a7a', size: 9 },
    { color: '#d4a017', size: 6 },
    { color: '#c75a28', size: 9 },
    { color: '#2d8a4e', size: 6 },
    { color: '#4a3a7a', size: 9 },
    { color: '#d4a017', size: 6 },
    { color: '#c75a28', size: 9 },
    { color: '#2d8a4e', size: 6 },
    { color: '#4a3a7a', size: 9 },
  ];
  return (
    <View style={s.row}>
      {pattern.map((p, i) => (
        <View
          key={i}
          style={[s.dot, { backgroundColor: p.color, width: p.size, height: p.size, borderRadius: p.size / 2 }]}
        />
      ))}
    </View>
  );
}

type TrustType = 'verified' | 'local' | 'organic' | 'handmade';

const trustConfig: Record<TrustType, { label: string; bg: string; border: string; textColor: string; icon: string }> = {
  verified: { label: 'Verified', bg: '#dcfce7', border: '#86efac', textColor: '#166534', icon: '✓' },
  local:    { label: 'Local',    bg: '#fff3ef', border: '#fdc9b0', textColor: '#9a3412', icon: '📍' },
  organic:  { label: 'Organic',  bg: '#dcfce7', border: '#86efac', textColor: '#166534', icon: '🌿' },
  handmade: { label: 'Handmade', bg: '#fef3c7', border: '#fcd34d', textColor: '#92400e', icon: '♥' },
};

export function TrustBadge({ type, small = false }: { type: TrustType; small?: boolean }) {
  const c = trustConfig[type];
  return (
    <View
      style={[
        s.trustBadge,
        {
          backgroundColor: c.bg,
          borderColor: c.border,
          paddingHorizontal: small ? 5 : 8,
          paddingVertical: small ? 2 : 4,
        },
      ]}
    >
      <Text style={[s.trustText, { fontSize: small ? 9 : 11, color: c.textColor }]}>
        {c.icon} {c.label}
      </Text>
    </View>
  );
}

type ShipLevel = 'mandal' | 'district' | 'state' | 'national';

const shipConfig: Record<ShipLevel, { label: string; bg: string; text: string; border: string; icon: string }> = {
  mandal:   { label: 'Mandal Only',      bg: '#f3f4f6', text: '#374151', border: '#d1d5db', icon: '🏘️' },
  district: { label: 'Within District',  bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe', icon: '🏙️' },
  state:    { label: 'Within State',     bg: '#fef3c7', text: '#92400e', border: '#fcd34d', icon: '🗺️' },
  national: { label: 'All India',        bg: '#dcfce7', text: '#166534', border: '#86efac', icon: '🇮🇳' },
};

export function ShippabilityBadge({ level }: { level: ShipLevel }) {
  const c = shipConfig[level];
  return (
    <View style={[s.shipBadge, { backgroundColor: c.bg, borderColor: c.border }]}>
      <Text style={[s.shipText, { color: c.text }]}>{c.icon} {c.label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', gap: 5, justifyContent: 'center', alignItems: 'center' },
  dot: {},
  trustBadge: { borderRadius: 6, alignSelf: 'flex-start', borderWidth: 1 },
  trustText: { fontWeight: '700' },
  shipBadge: {
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  shipText: { fontSize: 10, fontWeight: '600' },
});
