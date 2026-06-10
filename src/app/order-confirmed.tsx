import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';

import { PressableScale } from '@/components/pressable-scale';
import { useOrderStore } from '@/store/orders';

export default function OrderConfirmedScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const order = useOrderStore((s) => s.getById(orderId));

  if (!order) {
    return (
      <View style={s.center}>
        <Text style={{ fontSize: 48 }}>😕</Text>
        <Text style={s.errorText}>Order not found.</Text>
        <Pressable style={s.goHomeBtn} onPress={() => router.replace('/')}>
          <Text style={s.goHomeBtnText}>Go Home</Text>
        </Pressable>
      </View>
    );
  }

  const itemCount = order.items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <View style={s.screen}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Success Header */}
        <View style={s.successHeader}>
          <SafeAreaView edges={['top']}>
            <View style={s.checkCircle}>
              <Text style={s.checkMark}>✓</Text>
            </View>
            <Text style={s.successTitle}>Order Placed!</Text>
            <Text style={s.orderId}>#{order.id}</Text>
            <Text style={s.successSub}>
              We've received your order and it's being processed.
            </Text>
          </SafeAreaView>
        </View>

        {/* Delivery ETA */}
        <View style={s.section}>
          <View style={s.card}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={s.infoIcon}><Text style={{ fontSize: 22 }}>🚚</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.infoLabel}>Estimated Delivery</Text>
                <Text style={s.infoValue}>{order.deliverySlot}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Payment */}
        <View style={s.section}>
          <View style={s.card}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={s.infoIcon}><Text style={{ fontSize: 22 }}>💳</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.infoLabel}>Payment Method</Text>
                <Text style={s.infoValue}>{order.paymentMethod}</Text>
              </View>
              <View style={s.confirmedBadge}>
                <Text style={s.confirmedText}>Confirmed</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Items Summary */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Order Summary  ·  {itemCount} items</Text>
          <View style={s.card}>
            {order.items.map((item, i) => (
              <View key={item.productId}>
                <View style={s.itemRow}>
                  <View style={s.itemEmoji}>
                    <Text style={{ fontSize: 28 }}>{item.image}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.itemName} numberOfLines={1}>{item.name}</Text>
                    <Text style={s.itemQty}>Qty: {item.qty}</Text>
                  </View>
                  <Text style={s.itemPrice}>₹{item.price * item.qty}</Text>
                </View>
                {i < order.items.length - 1 && <View style={s.divider} />}
              </View>
            ))}
            <View style={[s.divider, { marginTop: 4 }]} />
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Total Paid</Text>
              <Text style={s.totalValue}>₹{order.total}</Text>
            </View>
          </View>
        </View>

        {/* Delivery Address */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Delivering To</Text>
          <View style={s.card}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={s.infoIcon}><Text style={{ fontSize: 18 }}>📍</Text></View>
              <Text style={s.addrText}>{order.address}</Text>
            </View>
          </View>
        </View>

        {/* CTAs */}
        <View style={[s.section, { paddingBottom: 48 }]}>
          <PressableScale style={s.primaryBtn} scale={0.97} onPress={() => router.replace('/orders')}>
            <Text style={s.primaryBtnText}>Track My Order →</Text>
          </PressableScale>
          <PressableScale style={s.outlineBtn} scale={0.97} onPress={() => router.replace('/')}>
            <Text style={s.outlineBtnText}>Continue Shopping</Text>
          </PressableScale>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f5f7' },
  center: {
    flex: 1, backgroundColor: '#f5f5f7',
    alignItems: 'center', justifyContent: 'center', gap: 12,
  },
  errorText: { fontSize: 15, color: '#6b7280' },
  goHomeBtn: {
    backgroundColor: '#c75a28', borderRadius: 12,
    paddingHorizontal: 20, paddingVertical: 10,
  },
  goHomeBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  successHeader: {
    backgroundColor: '#c75a28',
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: '#c75a28',
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },
  checkCircle: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center', justifyContent: 'center',
    marginTop: 20, marginBottom: 16, alignSelf: 'center',
  },
  checkMark: { fontSize: 38, color: '#fff', fontWeight: '800' },
  successTitle: { fontSize: 28, fontWeight: '800', color: '#fff', textAlign: 'center' },
  orderId: {
    fontSize: 13, color: 'rgba(255,255,255,0.8)',
    marginTop: 4, textAlign: 'center', fontWeight: '600',
  },
  successSub: {
    fontSize: 12, color: 'rgba(255,255,255,0.75)',
    marginTop: 8, textAlign: 'center', lineHeight: 18,
  },

  section: { paddingHorizontal: 16, paddingTop: 16 },
  sectionTitle: {
    fontSize: 12, fontWeight: '700', color: '#6b7280',
    textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10,
  },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#f0f0f3',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },

  infoIcon: {
    width: 48, height: 48, backgroundColor: '#fff7f5',
    borderRadius: 24, alignItems: 'center', justifyContent: 'center',
  },
  infoLabel: { fontSize: 11, color: '#9ca3af', fontWeight: '600' },
  infoValue: { fontSize: 14, fontWeight: '700', color: '#111827', marginTop: 2 },
  confirmedBadge: {
    backgroundColor: '#dcfce7', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: '#86efac',
  },
  confirmedText: { fontSize: 11, color: '#166534', fontWeight: '700' },

  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  itemEmoji: {
    width: 52, height: 52, backgroundColor: '#fff7f5',
    borderRadius: 12, alignItems: 'center', justifyContent: 'center',
  },
  itemName: { fontSize: 13, fontWeight: '700', color: '#111827' },
  itemQty: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  itemPrice: { fontSize: 14, fontWeight: '800', color: '#c75a28' },
  divider: { height: 1, backgroundColor: '#f0f0f3' },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingTop: 12,
  },
  totalLabel: { fontSize: 14, fontWeight: '700', color: '#111827' },
  totalValue: { fontSize: 17, fontWeight: '800', color: '#c75a28' },

  addrText: { fontSize: 13, color: '#374151', flex: 1, lineHeight: 18 },

  primaryBtn: {
    backgroundColor: '#c75a28', borderRadius: 16, height: 56,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#c75a28', shadowOpacity: 0.4, shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 }, elevation: 6,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.2 },
  outlineBtn: {
    borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 16, height: 52,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 12, backgroundColor: '#fff',
  },
  outlineBtnText: { color: '#374151', fontSize: 15, fontWeight: '700' },
});
