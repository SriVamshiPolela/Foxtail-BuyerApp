import { useState } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { PressableScale } from '@/components/pressable-scale';
import { useCartStore, cartSubtotal } from '@/store/cart';
import { useOrderStore } from '@/store/orders';
import { useUserStore } from '@/store/user';

const DELIVERY_SLOTS = [
  { id: 'today',    icon: '⚡', label: 'Today',     sub: '4 PM – 6 PM' },
  { id: 'tomorrow', icon: '🌅', label: 'Tomorrow',  sub: 'Before 12 PM' },
  { id: 'schedule', icon: '📅', label: 'Schedule',  sub: 'Pick a date' },
];

const PAYMENT_METHODS = [
  { id: 'upi',    icon: '₹',  label: 'UPI',                  sub: 'PhonePe / GPay / BHIM' },
  { id: 'card',   icon: '💳', label: 'Credit / Debit Card',  sub: null },
  { id: 'cod',    icon: '💵', label: 'Cash on Delivery',     sub: 'Pay when delivered' },
  { id: 'wallet', icon: '👛', label: 'Harvest Wallet',       sub: '₹250 available' },
];

function PriceRow({ label, value, green, bold }: { label: string; value: string; green?: boolean; bold?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text style={[s.rowLabel, bold && { color: '#111827', fontWeight: '700', fontSize: 14 }]}>{label}</Text>
      <Text style={[
        s.rowValue,
        green && { color: '#2d8a4e', fontWeight: '700' },
        bold && { color: '#c75a28', fontWeight: '800', fontSize: 15 },
      ]}>
        {value}
      </Text>
    </View>
  );
}

export default function CheckoutScreen() {
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore(cartSubtotal);
  const clearCart = useCartStore((s) => s.clearCart);
  const placeOrder = useOrderStore((s) => s.placeOrder);
  const location = useUserStore((s) => s.location);
  const district = useUserStore((s) => s.district);

  const [selectedSlot, setSelectedSlot] = useState('today');
  const [selectedPayment, setSelectedPayment] = useState('upi');

  const delivery = 40;
  const discount = 50;
  const total = subtotal + delivery - discount;
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const vendorCount = new Set(items.map((i) => i.product.vendorId)).size;
  const address = `Plot 123, ${location}, Hyderabad - 500072`;

  const activeSlot = DELIVERY_SLOTS.find((sl) => sl.id === selectedSlot)!;
  const slotLabel = `${activeSlot.label} ${activeSlot.sub}`;
  const paymentLabel = PAYMENT_METHODS.find((p) => p.id === selectedPayment)?.label ?? selectedPayment;

  const handlePlaceOrder = () => {
    const orderId = placeOrder({
      items: items.map((i) => ({
        productId: i.product.id,
        name: i.product.name,
        image: i.product.image,
        qty: i.quantity,
        price: i.product.price,
      })),
      subtotal,
      deliveryFee: delivery,
      discount,
      total,
      vendor: vendorCount > 1 ? 'Multiple Vendors' : (items[0]?.product.vendor ?? ''),
      paymentMethod: paymentLabel,
      deliverySlot: slotLabel,
      address,
      expectedDelivery: selectedSlot === 'today' ? 'Today by 6 PM' : 'Tomorrow by 12 PM',
    });
    clearCart();
    router.replace({ pathname: '/order-confirmed', params: { orderId } });
  };

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
        <Text style={s.topTitle}>Checkout</Text>
        <View style={{ width: 64 }} />
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Deliver To */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Deliver To</Text>
          <PressableScale style={s.card} scale={0.99}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={s.addrIcon}><Text style={{ fontSize: 18 }}>📍</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.addrTitle}>Home</Text>
                <Text style={s.addrSub}>{address}</Text>
                <Text style={s.addrDistrict}>{district}</Text>
              </View>
              <Text style={s.changeText}>Change</Text>
            </View>
          </PressableScale>
        </View>

        {/* Delivery Slot */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Delivery Slot</Text>
          <View style={s.slotRow}>
            {DELIVERY_SLOTS.map((slot) => (
              <Pressable
                key={slot.id}
                onPress={() => setSelectedSlot(slot.id)}
                style={({ pressed }) => [
                  s.slotPill,
                  slot.id === selectedSlot && s.slotPillActive,
                  pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] },
                ]}
              >
                <Text style={{ fontSize: 20 }}>{slot.icon}</Text>
                <Text style={[s.slotLabel, slot.id === selectedSlot && s.slotLabelActive]}>
                  {slot.label}
                </Text>
                <Text style={[s.slotSub, slot.id === selectedSlot && s.slotSubActive]}>
                  {slot.sub}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Payment Method */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Payment Method</Text>
          <View style={s.card}>
            {PAYMENT_METHODS.map((pm, i) => (
              <View key={pm.id}>
                <Pressable
                  onPress={() => setSelectedPayment(pm.id)}
                  style={({ pressed }) => [s.pmRow, pressed && { backgroundColor: '#fafafa' }]}
                >
                  <View style={[s.pmIcon, pm.id === selectedPayment && s.pmIconActive]}>
                    <Text style={{ fontSize: pm.id === 'upi' ? 13 : 16, fontWeight: '700', color: pm.id === 'upi' ? '#c75a28' : '#374151' }}>
                      {pm.icon}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.pmLabel, pm.id === selectedPayment && { color: '#111827', fontWeight: '700' }]}>
                      {pm.label}
                    </Text>
                    {pm.sub && <Text style={s.pmSub}>{pm.sub}</Text>}
                  </View>
                  <View style={[s.radio, pm.id === selectedPayment && s.radioActive]}>
                    {pm.id === selectedPayment && <View style={s.radioDot} />}
                  </View>
                </Pressable>
                {i < PAYMENT_METHODS.length - 1 && <View style={s.divider} />}
              </View>
            ))}
          </View>
        </View>

        {/* Order Summary */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Order Summary</Text>
          <View style={[s.card, { gap: 10 }]}>
            <Text style={s.itemsSummary}>
              <Text style={{ color: '#111827', fontWeight: '700' }}>{itemCount} items</Text>
              {' '}from{' '}
              <Text style={{ color: '#111827', fontWeight: '700' }}>
                {vendorCount} vendor{vendorCount > 1 ? 's' : ''}
              </Text>
            </Text>
            <View style={s.divider} />
            <PriceRow label="Subtotal" value={`₹${subtotal}`} />
            <PriceRow label="Delivery Fee" value={`₹${delivery}`} />
            <PriceRow label="Coupon Discount" value={`-₹${discount}`} green />
            <View style={s.divider} />
            <PriceRow label="Total Payable" value={`₹${total}`} bold />
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky Place Order Bar */}
      <SafeAreaView edges={['bottom']} style={s.bottomBar}>
        <PressableScale style={s.placeOrderBtn} scale={0.97} onPress={handlePlaceOrder}>
          <Text style={s.placeOrderText}>Place Order</Text>
          <View style={s.placeOrderBadge}>
            <Text style={s.placeOrderBadgeText}>₹{total}</Text>
          </View>
        </PressableScale>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f5f7' },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 8,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  backBtn: { width: 64, flexDirection: 'row', alignItems: 'center' },
  backText: { fontSize: 14, color: '#c75a28', fontWeight: '700' },
  topTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '800', color: '#111827' },

  section: { paddingHorizontal: 16, paddingTop: 20 },
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

  addrIcon: {
    width: 44, height: 44, backgroundColor: '#fff7f5',
    borderRadius: 22, alignItems: 'center', justifyContent: 'center',
  },
  addrTitle: { fontSize: 14, fontWeight: '700', color: '#111827' },
  addrSub: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  addrDistrict: { fontSize: 10, color: '#9ca3af', marginTop: 1 },
  changeText: { fontSize: 13, color: '#c75a28', fontWeight: '700' },

  slotRow: { flexDirection: 'row', gap: 10 },
  slotPill: {
    flex: 1, alignItems: 'center', gap: 4,
    paddingVertical: 14, paddingHorizontal: 6,
    backgroundColor: '#fff', borderRadius: 14,
    borderWidth: 1.5, borderColor: '#e5e7eb',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  slotPillActive: {
    borderColor: '#c75a28', backgroundColor: '#fff7f5',
    shadowColor: '#c75a28', shadowOpacity: 0.15, shadowRadius: 6, elevation: 3,
  },
  slotLabel: { fontSize: 12, fontWeight: '700', color: '#374151' },
  slotLabelActive: { color: '#c75a28' },
  slotSub: { fontSize: 10, color: '#9ca3af', textAlign: 'center' },
  slotSubActive: { color: '#c75a28', opacity: 0.8 },

  pmRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderRadius: 8,
  },
  pmIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  pmIconActive: { backgroundColor: '#fff7f5', borderColor: '#fdc9b0' },
  pmLabel: { fontSize: 14, color: '#374151', fontWeight: '600' },
  pmSub: { fontSize: 11, color: '#9ca3af', marginTop: 1 },
  radio: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: '#d1d5db',
    alignItems: 'center', justifyContent: 'center',
  },
  radioActive: { borderColor: '#c75a28' },
  radioDot: { width: 11, height: 11, borderRadius: 5.5, backgroundColor: '#c75a28' },

  divider: { height: 1, backgroundColor: '#f0f0f3' },
  itemsSummary: { fontSize: 13, color: '#6b7280' },
  rowLabel: { fontSize: 13, color: '#6b7280' },
  rowValue: { fontSize: 13, color: '#111827', fontWeight: '600' },

  bottomBar: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -3 },
    elevation: 10,
  },
  placeOrderBtn: {
    backgroundColor: '#c75a28', borderRadius: 16, height: 56,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
    shadowColor: '#c75a28', shadowOpacity: 0.4, shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 }, elevation: 6,
  },
  placeOrderText: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: 0.2 },
  placeOrderBadge: {
    backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  placeOrderBadgeText: { fontSize: 14, fontWeight: '800', color: '#fff' },
});
