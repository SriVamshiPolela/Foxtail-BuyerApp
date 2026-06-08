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
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text style={[s.rowLabel, bold && { color: '#111827', fontWeight: '700', fontSize: 15 }]}>
        {label}
      </Text>
      <Text style={[s.rowValue, green && { color: '#2d8a4e' }, bold && { color: '#c75a28', fontWeight: '700', fontSize: 15 }]}>
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
          <Text style={s.subtitle}>{items.length} items</Text>
        </View>

        {/* Delivery Address */}
        <View style={s.section}>
          <View style={s.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flexDirection: 'row', gap: 8, flex: 1 }}>
                <Text style={{ fontSize: 16 }}>📍</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.addrTitle}>Delivering to Home</Text>
                  <Text style={s.addrSub}>Plot 123, Kukatpally, Hyderabad - 500072</Text>
                </View>
              </View>
              <Pressable>
                <Text style={s.changeBtn}>Change</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Cart Items */}
        <View style={[s.section, { gap: 12 }]}>
          {items.map((item, i) => (
            <View key={i} style={s.card}>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={s.itemImg}>
                  <Text style={{ fontSize: 30 }}>{item.image}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.itemName} numberOfLines={1}>{item.name}</Text>
                      <Text style={s.itemVendor}>{item.vendor}</Text>
                      <View style={{ marginTop: 4 }}>
                        <ShippabilityBadge level={item.shippability} />
                      </View>
                    </View>
                    <Pressable onPress={() => removeItem(i)} style={{ padding: 4 }}>
                      <Text style={{ color: '#9ca3af', fontSize: 16 }}>✕</Text>
                    </Pressable>
                  </View>
                  <View style={s.itemBottom}>
                    <View style={s.qtyRow}>
                      <Pressable onPress={() => updateQty(i, -1)} style={s.qtyBtn}>
                        <Text style={s.qtyBtnText}>−</Text>
                      </Pressable>
                      <Text style={s.qtyText}>{item.quantity}</Text>
                      <Pressable onPress={() => updateQty(i, 1)} style={s.qtyBtn}>
                        <Text style={s.qtyBtnText}>+</Text>
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
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput
              style={s.couponInput}
              placeholder="Enter coupon code"
              placeholderTextColor="#9ca3af"
            />
            <Pressable style={s.applyBtn}>
              <Text style={s.applyBtnText}>Apply</Text>
            </Pressable>
          </View>
        </View>

        {/* Price Summary */}
        <View style={s.section}>
          <View style={[s.card, { backgroundColor: '#f9fafb' }]}>
            <Text style={s.summaryTitle}>Price Details</Text>
            <View style={{ gap: 8, marginTop: 10 }}>
              <PriceRow label="Subtotal" value={`₹${subtotal}`} />
              <PriceRow label="Delivery Fee" value={`₹${delivery}`} />
              <PriceRow label="Coupon Discount" value={`-₹${discount}`} green />
              <View style={s.divider} />
              <PriceRow label="Total" value={`₹${total}`} bold />
            </View>
          </View>
        </View>

        {/* Checkout */}
        <View style={s.section}>
          <Pressable style={s.checkoutBtn}>
            <Text style={s.checkoutBtnText}>Proceed to Checkout</Text>
          </Pressable>
          <Text style={s.terms}>By placing order, you agree to our Terms & Conditions</Text>
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
  section: { paddingHorizontal: 16, paddingTop: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  addrTitle: { fontSize: 13, fontWeight: '600', color: '#111827' },
  addrSub: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  changeBtn: { fontSize: 12, color: '#c75a28', fontWeight: '600' },

  itemImg: {
    width: 64,
    height: 64,
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemName: { fontSize: 13, fontWeight: '600', color: '#111827' },
  itemVendor: { fontSize: 10, color: '#6b7280' },
  itemBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    overflow: 'hidden',
  },
  qtyBtn: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { fontSize: 18, color: '#374151' },
  qtyText: {
    width: 28,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  itemPrice: { fontSize: 15, fontWeight: '700', color: '#c75a28' },

  couponInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontSize: 13,
    color: '#111827',
  },
  applyBtn: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingHorizontal: 16,
    height: 42,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  applyBtnText: { fontSize: 13, fontWeight: '600', color: '#374151' },

  summaryTitle: { fontSize: 14, fontWeight: '700', color: '#111827' },
  divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 4 },
  rowLabel: { fontSize: 13, color: '#6b7280' },
  rowValue: { fontSize: 13, color: '#111827' },

  checkoutBtn: {
    backgroundColor: '#c75a28',
    borderRadius: 12,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  terms: { fontSize: 10, color: '#9ca3af', textAlign: 'center', marginTop: 8 },
});
