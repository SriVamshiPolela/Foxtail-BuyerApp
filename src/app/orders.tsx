import { useState } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type OrderStatus = 'delivered' | 'in-transit' | 'processing';

type Order = {
  id: string;
  date: string;
  status: OrderStatus;
  items: { name: string; qty: number; image: string }[];
  total: number;
  vendor: string;
  expectedDelivery?: string;
};

const orders: Order[] = [
  {
    id: 'GS2024001234',
    date: '25 Oct 2024',
    status: 'delivered',
    items: [
      { name: 'Organic Turmeric Powder', qty: 2, image: '🫚' },
      { name: 'Fresh Buffalo Milk', qty: 3, image: '🥛' },
    ],
    total: 714,
    vendor: 'Multiple Vendors',
  },
  {
    id: 'GS2024001198',
    date: '22 Oct 2024',
    status: 'in-transit',
    items: [{ name: 'Handwoven Ikat Saree', qty: 1, image: '👗' }],
    total: 3499,
    vendor: 'Pochampally Weavers',
    expectedDelivery: '28 Oct 2024',
  },
  {
    id: 'GS2024001156',
    date: '18 Oct 2024',
    status: 'processing',
    items: [{ name: 'Bidri Art Vase', qty: 1, image: '🏺' }],
    total: 2850,
    vendor: 'Bidar Artisans Co-op',
  },
];

const statusCfg: Record<OrderStatus, { label: string; bg: string; text: string; icon: string }> = {
  delivered: { label: 'Delivered', bg: '#dcfce7', text: '#166534', icon: '✓' },
  'in-transit': { label: 'In Transit', bg: '#fef3c7', text: '#92400e', icon: '🚚' },
  processing: { label: 'Processing', bg: '#f3f4f6', text: '#374151', icon: '⏳' },
};

const filterTabs = ['All', 'Active', 'Delivered'];

export default function OrdersScreen() {
  const [activeTab, setActiveTab] = useState('All');

  const filtered = orders.filter((o) => {
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
        <View style={s.tabRow}>
          {filterTabs.map((t) => (
            <Pressable
              key={t}
              onPress={() => setActiveTab(t)}
              style={[s.tab, t === activeTab && s.tabActive]}
            >
              <Text style={[s.tabText, t === activeTab && s.tabTextActive]}>{t}</Text>
            </Pressable>
          ))}
        </View>

        {/* Orders List */}
        <View style={[s.section, { gap: 12 }]}>
          {filtered.map((order) => {
            const cfg = statusCfg[order.status];
            return (
              <View key={order.id} style={s.card}>
                {/* Order Header */}
                <View style={s.cardHead}>
                  <View>
                    <Text style={s.orderId}>Order #{order.id}</Text>
                    <Text style={s.orderDate}>{order.date}</Text>
                  </View>
                  <View style={[s.statusBadge, { backgroundColor: cfg.bg }]}>
                    <Text style={[s.statusText, { color: cfg.text }]}>
                      {cfg.icon} {cfg.label}
                    </Text>
                  </View>
                </View>

                {/* Items Row */}
                <View style={s.itemsRow}>
                  <View style={{ flexDirection: 'row' }}>
                    {order.items.slice(0, 3).map((item, i) => (
                      <View key={i} style={[s.itemThumb, { marginLeft: i > 0 ? -6 : 0 }]}>
                        <Text style={{ fontSize: 16 }}>{item.image}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={s.itemNames} numberOfLines={1}>
                      {order.items.map((i) => i.name).join(', ')}
                    </Text>
                    <Text style={s.vendorName}>{order.vendor}</Text>
                  </View>
                </View>

                {/* Transit Progress */}
                {order.status === 'in-transit' && (
                  <View style={s.transitBox}>
                    <Text style={{ fontSize: 14 }}>🚚</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={s.transitText}>
                        Expected by {order.expectedDelivery}
                      </Text>
                      <View style={s.progressTrack}>
                        <View style={[s.progressFill, { width: '65%' }]} />
                      </View>
                    </View>
                  </View>
                )}

                {/* Footer */}
                <View style={s.cardFoot}>
                  <Text style={s.total}>₹{order.total}</Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Pressable style={s.outlineBtn}>
                      <Text style={s.outlineBtnText}>💬 Support</Text>
                    </Pressable>
                    <Pressable style={s.primaryBtn}>
                      <Text style={s.primaryBtnText}>Track Order</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <View style={{ height: 32 }} />
      </SafeAreaView>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f9fafb' },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 20, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 12, color: '#6b7280', marginTop: 2 },

  tabRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    padding: 4,
  },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  tabActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: { fontSize: 13, color: '#6b7280', fontWeight: '500' },
  tabTextActive: { color: '#111827', fontWeight: '700' },

  section: { paddingHorizontal: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 12,
  },
  cardHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderId: { fontSize: 10, color: '#6b7280' },
  orderDate: { fontSize: 11, color: '#6b7280', marginTop: 1 },
  statusBadge: { borderRadius: 99, paddingHorizontal: 8, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },

  itemsRow: { flexDirection: 'row', alignItems: 'center' },
  itemThumb: {
    width: 40,
    height: 40,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  itemNames: { fontSize: 13, fontWeight: '600', color: '#111827' },
  vendorName: { fontSize: 10, color: '#6b7280', marginTop: 1 },

  transitBox: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    backgroundColor: '#fff7f5',
    borderRadius: 10,
    padding: 10,
  },
  transitText: { fontSize: 12, fontWeight: '600', color: '#c75a28' },
  progressTrack: { height: 6, backgroundColor: '#e5e7eb', borderRadius: 3, marginTop: 4 },
  progressFill: { height: 6, backgroundColor: '#c75a28', borderRadius: 3 },

  cardFoot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 10,
  },
  total: { fontSize: 15, fontWeight: '700', color: '#111827' },
  outlineBtn: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  outlineBtnText: { fontSize: 12, color: '#374151', fontWeight: '500' },
  primaryBtn: {
    backgroundColor: '#c75a28',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  primaryBtnText: { fontSize: 12, color: '#fff', fontWeight: '700' },
});
