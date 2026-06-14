import { useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { PressableScale } from '@/components/pressable-scale';
import { getOrders } from '@/services/orders';
import { useOrderStore } from '@/store/orders';
import type { OrderStatus, Order } from '@/types';

type AnyOrder = {
  id: string;
  date: string;
  status: OrderStatus;
  items: { name: string; image: string; qty?: number }[];
  total: number;
  vendor: string;
  expectedDelivery?: string;
};

const STATUS_CFG: Record<OrderStatus, { label: string; bg: string; text: string; border: string; icon: string }> = {
  delivered:    { label: 'Delivered',  bg: '#dcfce7', text: '#166534', border: '#86efac', icon: '✓'  },
  'in-transit': { label: 'In Transit', bg: '#fef3c7', text: '#92400e', border: '#fcd34d', icon: '🚚' },
  processing:   { label: 'Processing', bg: '#f3f4f6', text: '#374151', border: '#d1d5db', icon: '⏳' },
};

const FILTER_TABS = ['All', 'Active', 'Delivered'];

function toAny(o: Order): AnyOrder {
  return { ...o, items: o.items.map((i) => ({ name: i.name, image: i.image, qty: i.qty })) };
}

export default function OrdersScreen() {
  const [activeTab, setActiveTab] = useState('All');
  const [mockOrders, setMockOrders] = useState<AnyOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const placedOrders = useOrderStore((s) => s.orders);

  useEffect(() => {
    getOrders().then((os) => {
      setMockOrders(os.map(toAny));
      setLoading(false);
    });
  }, []);

  const allOrders: AnyOrder[] = [
    ...placedOrders.map((o) => ({
      id: o.id,
      date: o.date,
      status: o.status,
      items: o.items.map((i) => ({ name: i.name, image: i.image, qty: i.qty })),
      total: o.total,
      vendor: o.vendor,
      expectedDelivery: o.expectedDelivery,
    })),
    ...mockOrders,
  ];

  const filtered = allOrders.filter((o) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Active') return o.status !== 'delivered';
    return o.status === 'delivered';
  });

  return (
    <ScrollView style={s.screen} showsVerticalScrollIndicator={false}>
      <SafeAreaView edges={['top']}>
        <View style={s.header}>
          <Text style={s.title}>My Orders</Text>
          <Text style={s.subtitle}>Track your purchases</Text>
        </View>

        {/* Filter Tabs */}
        <View style={s.tabWrap}>
          <View style={s.tabRow}>
            {FILTER_TABS.map((t) => (
              <Pressable
                key={t}
                onPress={() => setActiveTab(t)}
                style={({ pressed }) => [
                  s.tab,
                  t === activeTab && s.tabActive,
                  pressed && { opacity: 0.75 },
                ]}
              >
                <Text style={[s.tabText, t === activeTab && s.tabTextActive]}>{t}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {loading ? (
          <View style={s.loadRow}>
            <ActivityIndicator size="large" color="#c75a28" />
          </View>
        ) : filtered.length === 0 ? (
          <View style={s.emptyWrap}>
            <Text style={{ fontSize: 48 }}>📦</Text>
            <Text style={s.emptyTitle}>No orders here yet</Text>
            <Text style={s.emptySub}>Your {activeTab.toLowerCase()} orders will appear here.</Text>
          </View>
        ) : (
          <View style={[s.section, { gap: 14 }]}>
            {filtered.map((order) => {
              const cfg = STATUS_CFG[order.status];
              return (
                <PressableScale
                  key={order.id}
                  style={s.card}
                  scale={0.99}
                  onPress={() => router.push(`/order/${order.id}`)}
                >
                  {/* Order Header */}
                  <View style={s.cardHead}>
                    <View>
                      <Text style={s.orderId}>#{order.id}</Text>
                      <Text style={s.orderDate}>{order.date}</Text>
                    </View>
                    <View style={[s.statusBadge, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
                      <Text style={[s.statusText, { color: cfg.text }]}>
                        {cfg.icon}  {cfg.label}
                      </Text>
                    </View>
                  </View>

                  {/* Items Row */}
                  <View style={s.itemsRow}>
                    <View style={{ flexDirection: 'row' }}>
                      {order.items.slice(0, 3).map((item, i) => (
                        <View key={i} style={[s.itemThumb, { marginLeft: i > 0 ? -8 : 0 }]}>
                          <Text style={{ fontSize: 18 }}>{item.image}</Text>
                        </View>
                      ))}
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={s.itemNames} numberOfLines={1}>
                        {order.items.map((i) => i.name).join(', ')}
                      </Text>
                      <Text style={s.vendorName}>{order.vendor}</Text>
                    </View>
                  </View>

                  {/* Transit Progress */}
                  {order.status === 'in-transit' && order.expectedDelivery && (
                    <View style={s.transitBox}>
                      <Text style={{ fontSize: 16 }}>🚚</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={s.transitText}>Expected by {order.expectedDelivery}</Text>
                        <View style={s.progressTrack}>
                          <View style={[s.progressFill, { width: '65%' }]} />
                        </View>
                      </View>
                    </View>
                  )}

                  {/* Footer */}
                  <View style={s.cardFoot}>
                    <View>
                      <Text style={s.totalLabel}>Order Total</Text>
                      <Text style={s.total}>₹{order.total}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <Pressable style={({ pressed }) => [s.outlineBtn, pressed && { opacity: 0.7 }]}>
                        <Text style={s.outlineBtnText}>💬 Support</Text>
                      </Pressable>
                      <PressableScale
                        style={s.primaryBtn}
                        scale={0.96}
                        onPress={() => router.push(`/order/${order.id}`)}
                      >
                        <Text style={s.primaryBtnText}>Track →</Text>
                      </PressableScale>
                    </View>
                  </View>
                </PressableScale>
              );
            })}
          </View>
        )}

        <View style={{ height: 32 }} />
      </SafeAreaView>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f5f7' },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 12, color: '#9ca3af', marginTop: 2 },

  loadRow: { height: 180, alignItems: 'center', justifyContent: 'center' },
  emptyWrap: { alignItems: 'center', paddingVertical: 48, gap: 8, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: '#111827' },
  emptySub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', lineHeight: 18 },

  tabWrap: { paddingHorizontal: 16, marginVertical: 14 },
  tabRow: {
    flexDirection: 'row', backgroundColor: '#f0f0f3',
    borderRadius: 12, padding: 4,
  },
  tab: { flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: 'center' },
  tabActive: {
    backgroundColor: '#fff',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 }, elevation: 3,
  },
  tabText: { fontSize: 13, color: '#9ca3af', fontWeight: '600' },
  tabTextActive: { color: '#c75a28', fontWeight: '800' },

  section: { paddingHorizontal: 16 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#f0f0f3', gap: 14,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 }, elevation: 3,
  },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderId: { fontSize: 11, color: '#374151', fontWeight: '700' },
  orderDate: { fontSize: 10, color: '#9ca3af', marginTop: 2 },
  statusBadge: { borderRadius: 99, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1 },
  statusText: { fontSize: 11, fontWeight: '800' },

  itemsRow: { flexDirection: 'row', alignItems: 'center' },
  itemThumb: {
    width: 44, height: 44, backgroundColor: '#fff7f5', borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  itemNames: { fontSize: 13, fontWeight: '700', color: '#111827' },
  vendorName: { fontSize: 10, color: '#9ca3af', marginTop: 2 },

  transitBox: {
    flexDirection: 'row', gap: 12, alignItems: 'center',
    backgroundColor: '#fff7f5', borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: '#fdc9b0',
  },
  transitText: { fontSize: 12, fontWeight: '700', color: '#c75a28' },
  progressTrack: { height: 6, backgroundColor: '#f0f0f3', borderRadius: 3, marginTop: 6, overflow: 'hidden' },
  progressFill: { height: 6, backgroundColor: '#c75a28', borderRadius: 3 },

  cardFoot: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderTopWidth: 1, borderTopColor: '#f5f5f7', paddingTop: 12,
  },
  totalLabel: { fontSize: 10, color: '#9ca3af' },
  total: { fontSize: 16, fontWeight: '800', color: '#111827', marginTop: 1 },
  outlineBtn: {
    borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#fff',
  },
  outlineBtnText: { fontSize: 12, color: '#374151', fontWeight: '600' },
  primaryBtn: {
    backgroundColor: '#c75a28', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 8,
    shadowColor: '#c75a28', shadowOpacity: 0.3, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  primaryBtnText: { fontSize: 12, color: '#fff', fontWeight: '800' },
});
