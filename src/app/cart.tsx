import { useState } from 'react';
import { ScrollView, View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ShippabilityBadge } from '@/components/buyer-ui';

type ShipLevel = 'mandal' | 'district' | 'state' | 'national';

type CartItem = {
  name: string;
  vendor: string;
  price: number;
  quantity: number;
  image: string;
  shippability: ShipLevel;
};

const initialItems: CartItem[] = [
  { name: 'Organic Turmeric Powder', vendor: 'Lakshmi Farms', price: 249, quantity: 2, image: '🫚', shippability: 'national' },
  { name: 'Fresh Buffalo Milk (1L)', vendor: 'Gokul Dairy', price: 72, quantity: 3, image: '🥛', shippability: 'mandal' },
  { name: 'Handwoven Cotton Towel', vendor: 'Chirala Weavers', price: 350, quantity: 1, image: '🧺', shippability: 'state' },
];

function PriceRow({ label, value, green, bold }: { label: string; value: string; green?: boolean; bold?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text style={[s.rowLabel, bold && { color: '#111827', fontWeight: '700', fontSize: 15 }]}>
        {label}
      </Text>
      <Text style={[s.rowValue, green && { color: '#2d8a4e', fontWeight: '700' }, bold && { color: '#c75a28', fontWeight: '800', fontSize: 16 }]}>
        {value}
      </Text>
    </View>
  );
}

export default function CartScreen() {
  const [items, setItems] = useState<CartItem[]>(initialItems);

  const updateQty = (i: number, delta: number) =>
    setItems((prev) =>
      prev.map((item, idx) =>
        idx === i ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item,
      ),
    );

  const removeItem = (i: number) =>
    setItems((prev) => prev.filter((_, idx) => idx !== i));

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const delivery = 40;
  const discount = 50;
  const total = subtotal + delivery - discount;

  return (
    <ScrollView style={s.screen} showsVerticalScrollIndicator={false}>
      <SafeAreaView edges={['top']}>
        <View style={s.header}>
          <Text style={s.title}>Shopping Cart</Text>
          <View style={s.itemCountBadge}>
            <Text style={s.itemCountText}>{items.length} items</Text>
          </View>
        </View>

        {/* Delivery Address */}
        <View style={s.section}>
          <Pressable
            style={({ pressed }) => [s.card, pressed && { opacity: 0.88 }]}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flexDirection: 'row', gap: 10, flex: 1 }}>
                <View style={s.addrIconWrap}>
                  <Text style={{ fontSize: 16 }}>📍</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.addrTitle}>Delivering to Home</Text>
                  <Text style={s.addrSub}>Plot 123, Kukatpally, Hyderabad - 500072</Text>
                </View>
              </View>
              <Text style={s.changeBtn}>Change</Text>
            </View>
          </Pressable>
        </View>

        {/* Cart Items */}
        <View style={[s.section, { gap: 12 }]}>
          {items.map((item, i) => (
            <View key={i} style={s.card}>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={s.itemImg}>
                  <Text style={{ fontSize: 32 }}>{item.image}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.itemName} numberOfLines={1}>{item.name}</Text>
                      <Text style={s.itemVendor}>{item.vendor}</Text>
                      <View style={{ marginTop: 5 }}>
                        <ShippabilityBadge level={item.shippability} />
                      </View>
                    </View>
                    <Pressable
                      onPress={() => removeItem(i)}
                      style={({ pressed }) => [s.removeBtn, pressed && { opacity: 0.6, transform: [{ scale: 0.85 }] }]}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text style={s.removeBtnText}>✕</Text>
                    </Pressable>
                  </View>
                  <View style={s.itemBottom}>
                    <View style={s.qtyRow}>
                      <Pressable
                        onPress={() => updateQty(i, -1)}
                        style={({ pressed }) => [s.qtyBtn, s.qtyBtnMinus, pressed && { opacity: 0.7 }]}
                      >
                        <Text style={s.qtyBtnText}>−</Text>
                      </Pressable>
                      <Text style={s.qtyText}>{item.quantity}</Text>
                      <Pressable
                        onPress={() => updateQty(i, 1)}
                        style={({ pressed }) => [s.qtyBtn, s.qtyBtnPlus, pressed && { opacity: 0.7 }]}
                      >
                        <Text style={[s.qtyBtnText, { color: '#fff' }]}>+</Text>
                      </Pressable>
                    </View>
                    <Text style={s.itemPrice}>₹{item.price * item.quantity}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Coupon */}
        <View style={s.section}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TextInput
              style={s.couponInput}
              placeholder="Enter coupon code"
              placeholderTextColor="#9ca3af"
            />
            <Pressable
              style={({ pressed }) => [s.applyBtn, pressed && { opacity: 0.82, transform: [{ scale: 0.97 }] }]}
            >
              <Text style={s.applyBtnText}>Apply</Text>
            </Pressable>
          </View>
        </View>

        {/* Price Summary */}
        <View style={s.section}>
          <View style={[s.card, { backgroundColor: '#fafafa' }]}>
            <Text style={s.summaryTitle}>Price Details</Text>
            <View style={{ gap: 10, marginTop: 12 }}>
              <PriceRow label="Subtotal" value={`₹${subtotal}`} />
              <PriceRow label="Delivery Fee" value={`₹${delivery}`} />
              <PriceRow label="Coupon Discount" value={`-₹${discount}`} green />
              <View style={s.divider} />
              <PriceRow label="Total Payable" value={`₹${total}`} bold />
            </View>
          </View>
        </View>

        {/* Checkout */}
        <View style={[s.section, { paddingBottom: 12 }]}>
          <Pressable
            style={({ pressed }) => [s.checkoutBtn, pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] }]}
          >
            <Text style={s.checkoutBtnText}>Proceed to Checkout  →</Text>
          </Pressable>
          <Text style={s.terms}>By placing order, you agree to our Terms & Conditions</Text>
        </View>

        <View style={{ height: 32 }} />
      </SafeAreaView>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f5f7' },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: { fontSize: 22, fontWeight: '800', color: '#111827' },
  itemCountBadge: {
    backgroundColor: '#fff3ef',
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#fdc9b0',
  },
  itemCountText: { fontSize: 11, color: '#9a3412', fontWeight: '700' },

  section: { paddingHorizontal: 16, paddingTop: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#f0f0f3',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  addrIconWrap: {
    width: 36,
    height: 36,
    backgroundColor: '#fff7f5',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addrTitle: { fontSize: 13, fontWeight: '700', color: '#111827' },
  addrSub: { fontSize: 11, color: '#6b7280', marginTop: 2, lineHeight: 16 },
  changeBtn: { fontSize: 12, color: '#c75a28', fontWeight: '700' },

  itemImg: {
    width: 68,
    height: 68,
    backgroundColor: '#fff7f5',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemName: { fontSize: 13, fontWeight: '700', color: '#111827' },
  itemVendor: { fontSize: 10, color: '#9ca3af', marginTop: 1 },
  removeBtn: {
    width: 28,
    height: 28,
    backgroundColor: '#fef2f2',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  removeBtnText: { color: '#ef4444', fontSize: 12, fontWeight: '700' },
  itemBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  qtyBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  qtyBtnMinus: { backgroundColor: '#f3f4f6' },
  qtyBtnPlus: { backgroundColor: '#c75a28' },
  qtyBtnText: { fontSize: 18, color: '#374151', fontWeight: '700' },
  qtyText: {
    width: 32,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    backgroundColor: '#fff',
    lineHeight: 34,
  },
  itemPrice: { fontSize: 16, fontWeight: '800', color: '#c75a28' },

  couponInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontSize: 13,
    color: '#111827',
  },
  applyBtn: {
    backgroundColor: '#c75a28',
    borderRadius: 12,
    paddingHorizontal: 18,
    height: 46,
    justifyContent: 'center',
    shadowColor: '#c75a28',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  applyBtnText: { fontSize: 13, fontWeight: '800', color: '#fff' },

  summaryTitle: { fontSize: 15, fontWeight: '800', color: '#111827' },
  divider: { height: 1, backgroundColor: '#f0f0f3', marginVertical: 2 },
  rowLabel: { fontSize: 13, color: '#6b7280' },
  rowValue: { fontSize: 13, color: '#111827', fontWeight: '600' },

  checkoutBtn: {
    backgroundColor: '#c75a28',
    borderRadius: 16,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#c75a28',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  checkoutBtnText: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },
  terms: { fontSize: 10, color: '#9ca3af', textAlign: 'center', marginTop: 10 },
});
