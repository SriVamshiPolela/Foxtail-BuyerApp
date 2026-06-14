import { useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/pressable-scale';
import { getOrderById } from '@/services/orders';
import { useOrderStore } from '@/store/orders';
import type { OrderStatus, PlacedOrder, Order } from '@/types';

type DisplayOrder = {
  id: string;
  date: string;
  status: OrderStatus;
  items: { name: string; image: string; qty: number; price?: number }[];
  total: number;
  vendor: string;
  subtotal?: number;
  deliveryFee?: number;
  discount?: number;
  paymentMethod?: string;
  deliverySlot?: string;
  address?: string;
  expectedDelivery?: string;
};

const STATUS_CFG: Record<OrderStatus, { label: string; bg: string; text: string; border: string; icon: string; step: number }> = {
  processing:   { label: 'Processing',  bg: '#f3f4f6', text: '#374151', border: '#d1d5db', icon: '⏳', step: 1 },
  'in-transit': { label: 'In Transit',  bg: '#fef3c7', text: '#92400e', border: '#fcd34d', icon: '🚚', step: 2 },
  delivered:    { label: 'Delivered',   bg: '#dcfce7', text: '#166534', border: '#86efac', icon: '✓',  step: 3 },
};

const STEPS = [
  { label: 'Order Placed', sub: 'Confirmed by vendor' },
  { label: 'Processing',   sub: 'Being prepared for dispatch' },
  { label: 'Shipped',      sub: 'Out for delivery' },
  { label: 'Delivered',    sub: 'Successfully delivered' },
];

function toDisplay(order: PlacedOrder | Order): DisplayOrder {
  if ('subtotal' in order) {
    return {
      id: order.id,
      date: order.date,
      status: order.status,
      items: order.items.map((i) => ({ name: i.name, image: i.image, qty: i.qty, price: i.price })),
      total: order.total,
      vendor: order.vendor,
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      discount: order.discount,
      paymentMethod: order.paymentMethod,
      deliverySlot: order.deliverySlot,
      address: order.address,
      expectedDelivery: order.expectedDelivery,
    };
  }
  return {
    id: order.id,
    date: order.date,
    status: order.status,
    items: order.items.map((i) => ({ name: i.name, image: i.image, qty: i.qty })),
    total: order.total,
    vendor: order.vendor,
    expectedDelivery: order.expectedDelivery,
  };
}

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const fromStore = useOrderStore((s) => s.getById(id));
  const [order, setOrder] = useState<DisplayOrder | null>(null);
  const [loading, setLoading] = useState(!fromStore);

  useEffect(() => {
    if (fromStore) {
      setOrder(toDisplay(fromStore));
      return;
    }
    getOrderById(id).then((o) => {
      if (o) setOrder(toDisplay(o));
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#c75a28" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={s.center}>
        <Text style={{ fontSize: 40 }}>📦</Text>
        <Text style={s.errorText}>Order not found.</Text>
        <Pressable style={s.backBtnCenter} onPress={() => router.back()}>
          <Text style={s.backBtnCenterText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const cfg = STATUS_CFG[order.status];
  const currentStep = cfg.step;

  return (
    <View style={s.screen}>
      {/* Top Bar */}
      <SafeAreaView edges={['top']} style={s.topBar}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [s.backBtn, pressed && { opacity: 0.6 }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={s.backText}>← Back</Text>
        </Pressable>
        <Text style={s.topTitle} numberOfLines={1}>Order #{order.id.slice(-8)}</Text>
        <View style={{ width: 64 }} />
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Status Banner */}
        <View style={[s.statusBanner, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
          <View style={s.statusLeft}>
            <Text style={{ fontSize: 32 }}>{cfg.icon}</Text>
            <View>
              <Text style={[s.statusLabel, { color: cfg.text }]}>{cfg.label}</Text>
              <Text style={s.statusDate}>{order.date}</Text>
            </View>
          </View>
          <View style={[s.statusBadge, { borderColor: cfg.border }]}>
            <Text style={[s.statusBadgeText, { color: cfg.text }]}>{cfg.label}</Text>
          </View>
        </View>

        {/* Delivery ETA */}
        {order.expectedDelivery && order.status !== 'delivered' && (
          <View style={s.section}>
            <View style={s.etaCard}>
              <Text style={{ fontSize: 16 }}>📅</Text>
              <Text style={s.etaText}>
                Expected by{' '}
                <Text style={{ color: '#c75a28', fontWeight: '800' }}>{order.expectedDelivery}</Text>
              </Text>
            </View>
          </View>
        )}

        {/* Timeline Stepper */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Order Timeline</Text>
          <View style={s.card}>
            {STEPS.map((step, i) => {
              const done = currentStep > i;
              const active = currentStep === i;
              return (
                <View key={i} style={s.stepRow}>
                  <View style={s.stepTrack}>
                    <View style={[
                      s.stepDot,
                      done && s.stepDotDone,
                      active && s.stepDotActive,
                    ]}>
                      <Text style={[s.stepDotText, (done || active) && { color: '#fff' }]}>
                        {done ? '✓' : String(i + 1)}
                      </Text>
                    </View>
                    {i < STEPS.length - 1 && (
                      <View style={[s.stepLine, done && s.stepLineDone]} />
                    )}
                  </View>
                  <View style={[s.stepContent, i < STEPS.length - 1 && { paddingBottom: 22 }]}>
                    <Text style={[s.stepLabel, (done || active) && { color: '#111827', fontWeight: '700' }]}>
                      {step.label}
                    </Text>
                    <Text style={[s.stepSub, active && { color: '#c75a28' }]}>
                      {active ? 'In progress...' : done ? step.sub : 'Pending'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Items */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Items · {order.vendor}</Text>
          <View style={s.card}>
            {order.items.map((item, i) => (
              <View key={i}>
                <View style={s.itemRow}>
                  <View style={s.itemEmoji}>
                    <Text style={{ fontSize: 26 }}>{item.image}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.itemName} numberOfLines={2}>{item.name}</Text>
                    <Text style={s.itemQtyText}>Qty: {item.qty}</Text>
                  </View>
                  {item.price != null && (
                    <Text style={s.itemPrice}>₹{item.price * item.qty}</Text>
                  )}
                </View>
                {i < order.items.length - 1 && <View style={s.divider} />}
              </View>
            ))}
          </View>
        </View>

        {/* Delivery Address */}
        {order.address && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Delivery Address</Text>
            <View style={s.card}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={s.addrIcon}><Text style={{ fontSize: 18 }}>📍</Text></View>
                <Text style={s.addrText}>{order.address}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Price Breakdown (placed orders only) */}
        {order.subtotal != null && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Price Breakdown</Text>
            <View style={[s.card, { gap: 10 }]}>
              <View style={s.priceRow}>
                <Text style={s.priceLabel}>Subtotal</Text>
                <Text style={s.priceValue}>₹{order.subtotal}</Text>
              </View>
              <View style={s.priceRow}>
                <Text style={s.priceLabel}>Delivery Fee</Text>
                <Text style={s.priceValue}>₹{order.deliveryFee}</Text>
              </View>
              {order.discount! > 0 && (
                <View style={s.priceRow}>
                  <Text style={s.priceLabel}>Discount</Text>
                  <Text style={[s.priceValue, { color: '#2d8a4e', fontWeight: '700' }]}>-₹{order.discount}</Text>
                </View>
              )}
              {order.paymentMethod && (
                <View style={s.priceRow}>
                  <Text style={s.priceLabel}>Payment</Text>
                  <Text style={[s.priceValue, { color: '#374151' }]}>{order.paymentMethod}</Text>
                </View>
              )}
              <View style={s.divider} />
              <View style={s.priceRow}>
                <Text style={[s.priceLabel, { color: '#111827', fontWeight: '700', fontSize: 14 }]}>Total Paid</Text>
                <Text style={[s.priceValue, { color: '#c75a28', fontWeight: '800', fontSize: 15 }]}>₹{order.total}</Text>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Action Bar */}
      <SafeAreaView edges={['bottom']} style={s.bottomBar}>
        <Pressable
          style={({ pressed }) => [s.supportBtn, pressed && { opacity: 0.75 }]}
        >
          <Text style={s.supportBtnText}>💬  Support</Text>
        </Pressable>
        <PressableScale style={s.reorderBtn} scale={0.96}>
          <Text style={s.reorderBtnText}>🔄  Reorder</Text>
        </PressableScale>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f5f7' },
  center: { flex: 1, backgroundColor: '#f5f5f7', alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorText: { fontSize: 15, color: '#6b7280' },
  backBtnCenter: { backgroundColor: '#c75a28', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10 },
  backBtnCenterText: { color: '#fff', fontWeight: '700' },

  topBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 12, paddingTop: 8,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e5e7eb',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 }, elevation: 2,
  },
  backBtn: { width: 64, flexDirection: 'row', alignItems: 'center' },
  backText: { fontSize: 14, color: '#c75a28', fontWeight: '700' },
  topTitle: { flex: 1, textAlign: 'center', fontSize: 15, fontWeight: '800', color: '#111827' },

  statusBanner: {
    marginHorizontal: 16, marginTop: 16,
    borderRadius: 16, padding: 16,
    borderWidth: 1,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  statusLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusLabel: { fontSize: 17, fontWeight: '800' },
  statusDate: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  statusBadge: {
    borderRadius: 99, paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.6)',
  },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },

  etaCard: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fff7f5', borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: '#fdc9b0',
  },
  etaText: { fontSize: 13, color: '#374151' },

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

  stepRow: { flexDirection: 'row', gap: 14 },
  stepTrack: { alignItems: 'center', width: 28 },
  stepDot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#f3f4f6', borderWidth: 2, borderColor: '#e5e7eb',
    alignItems: 'center', justifyContent: 'center',
  },
  stepDotDone: { backgroundColor: '#c75a28', borderColor: '#c75a28' },
  stepDotActive: { backgroundColor: '#c75a28', borderColor: '#c75a28' },
  stepDotText: { fontSize: 11, fontWeight: '800', color: '#9ca3af' },
  stepLine: { width: 2, flex: 1, backgroundColor: '#e5e7eb', marginVertical: 3 },
  stepLineDone: { backgroundColor: '#c75a28' },
  stepContent: { flex: 1, paddingTop: 3 },
  stepLabel: { fontSize: 13, fontWeight: '600', color: '#9ca3af' },
  stepSub: { fontSize: 11, color: '#9ca3af', marginTop: 2 },

  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  itemEmoji: {
    width: 50, height: 50, backgroundColor: '#fff7f5',
    borderRadius: 12, alignItems: 'center', justifyContent: 'center',
  },
  itemName: { fontSize: 13, fontWeight: '700', color: '#111827' },
  itemQtyText: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  itemPrice: { fontSize: 14, fontWeight: '800', color: '#c75a28' },
  divider: { height: 1, backgroundColor: '#f0f0f3' },

  addrIcon: { width: 40, height: 40, backgroundColor: '#fff7f5', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  addrText: { fontSize: 13, color: '#374151', flex: 1, lineHeight: 18 },

  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceLabel: { fontSize: 13, color: '#6b7280' },
  priceValue: { fontSize: 13, color: '#111827', fontWeight: '600' },

  bottomBar: {
    flexDirection: 'row', gap: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 16, paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#e5e7eb',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12,
    shadowOffset: { width: 0, height: -3 }, elevation: 10,
  },
  supportBtn: {
    flex: 1, height: 50, borderRadius: 14,
    borderWidth: 1.5, borderColor: '#e5e7eb',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff',
  },
  supportBtnText: { fontSize: 14, color: '#374151', fontWeight: '700' },
  reorderBtn: {
    flex: 1, height: 50, borderRadius: 14,
    backgroundColor: '#c75a28',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#c75a28', shadowOpacity: 0.3, shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 }, elevation: 4,
  },
  reorderBtnText: { fontSize: 14, color: '#fff', fontWeight: '800' },
});
