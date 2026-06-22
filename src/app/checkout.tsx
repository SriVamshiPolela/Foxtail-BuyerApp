import { useState, useMemo } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';

import { PressableScale } from '@/components/pressable-scale';
import { useCartStore } from '@/store/cart';
import { useUserStore } from '@/store/user';
import { useAuthStore } from '@/store/auth';
import { usePaymentStore } from '@/store/payment';
import { placeOrder as callPlaceOrder } from '@/services/orders';
import { debitWallet } from '@/services/user';
import { useLanguage } from '@/context/language-context';
import type { Address } from '@/store/user';

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
  const { t } = useLanguage();

  const DELIVERY_SLOTS = [
    { id: 'today',    icon: '⚡', label: t('checkout_slot_today'),    sub: t('checkout_slot_today_sub') },
    { id: 'tomorrow', icon: '🌅', label: t('checkout_slot_tomorrow'), sub: t('checkout_slot_tomorrow_sub') },
    { id: 'schedule', icon: '📅', label: t('checkout_slot_schedule'), sub: t('checkout_slot_schedule_sub') },
  ];

  const allItems  = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);

  const { selectedIds } = useLocalSearchParams<{ selectedIds?: string }>();
  const selectedIdsSet  = useMemo(() => {
    if (!selectedIds) return null;
    return new Set(selectedIds.split(',').filter(Boolean));
  }, [selectedIds]);

  const items    = selectedIdsSet ? allItems.filter((i) => selectedIdsSet.has(i.product.id)) : allItems;
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const location        = useUserStore((s) => s.location);
  const district        = useUserStore((s) => s.district);
  const name            = useUserStore((s) => s.name);
  const phone           = useUserStore((s) => s.phone);
  const addresses       = useUserStore((s) => s.addresses);
  const selectedAddressId = useUserStore((s) => s.selectedAddressId);
  const selectedAddress: Address | undefined = addresses.find((a) => a.id === selectedAddressId);

  const { userId, token } = useAuthStore();

  const { upiIds, cards, codEnabled } = usePaymentStore();
  const walletBalance    = useUserStore((s) => s.walletBalance);
  const setWalletBalance = useUserStore((s) => s.setWalletBalance);
  const defaultUPI    = upiIds.find((u) => u.isDefault);
  const defaultCard   = cards.find((c) => c.isDefault);
  const walletRupees  = walletBalance.toLocaleString('en-IN', { maximumFractionDigits: 2 });

  // Build dynamic payment methods from saved data
  const PAYMENT_METHODS = [
    ...(upiIds.length > 0
      ? [{ id: 'upi', icon: '₹', label: 'UPI', sub: defaultUPI?.upiId ?? 'PhonePe / GPay / BHIM' }]
      : [{ id: 'upi', icon: '₹', label: 'UPI', sub: 'PhonePe / GPay / BHIM' }]),
    ...(cards.length > 0
      ? [{ id: 'card', icon: '💳', label: 'Credit / Debit Card', sub: `•••• ${defaultCard?.last4 ?? '****'}` }]
      : [{ id: 'card', icon: '💳', label: 'Credit / Debit Card', sub: null }]),
    ...(codEnabled ? [{ id: 'cod', icon: '💵', label: 'Cash on Delivery', sub: t('checkout_cod') }] : []),
    {
      id: 'wallet', icon: '👛', label: 'Harvest Wallet',
      sub: walletBalance > 0 ? `₹${walletRupees} available` : t('checkout_wallet_empty'),
      disabled: walletBalance === 0,
    },
  ];

  const [selectedSlot,    setSelectedSlot]    = useState('today');
  const [selectedPayment, setSelectedPayment] = useState<'upi' | 'card' | 'cod' | 'wallet'>('upi');
  const [busy,            setBusy]            = useState(false);
  const [orderError,      setOrderError]      = useState<string | null>(null);

  const delivery = 40;
  const discount = 50;
  const total    = subtotal + delivery - discount;
  const itemCount   = items.reduce((sum, i) => sum + i.quantity, 0);
  const vendorCount = new Set(items.map((i) => i.product.vendorId)).size;

  const addressString = selectedAddress
    ? `${selectedAddress.line1}${selectedAddress.line2 ? ', ' + selectedAddress.line2 : ''}, ${selectedAddress.city} - ${selectedAddress.pincode}`
    : `${location}, Hyderabad - 500072`;

  const activeSlot   = DELIVERY_SLOTS.find((sl) => sl.id === selectedSlot)!;
  const slotLabel    = `${activeSlot.label} ${activeSlot.sub}`;
  const paymentLabel = PAYMENT_METHODS.find((p) => p.id === selectedPayment)?.label ?? selectedPayment;

  const handlePlaceOrder = async () => {
    if (busy || items.length === 0) return;
    if (!userId || !token) {
      setOrderError(t('checkout_please_login'));
      return;
    }

    // Reject wallet payment if balance is insufficient before hitting the server
    if (selectedPayment === 'wallet') {
      const totalRupees = subtotal + delivery - discount;
      if (walletBalance < totalRupees) {
        setOrderError(`Insufficient wallet balance. You have ₹${walletBalance.toFixed(2)} but need ₹${totalRupees.toFixed(2)}. Please top up your wallet.`);
        return;
      }
    }

    setOrderError(null);
    setBusy(true);
    try {
      const addr = selectedAddress
        ? {
            label:    selectedAddress.label,
            line1:    selectedAddress.line1,
            line2:    selectedAddress.line2 || undefined,
            city:     selectedAddress.city,
            district: selectedAddress.district,
            state:    selectedAddress.state,
            pincode:  selectedAddress.pincode.length === 6 ? selectedAddress.pincode : '500072',
            lat:      0,
            lng:      0,
          }
        : {
            label:    'Home',
            line1:    location,
            city:     location,
            district: district.split(',')[0]?.trim() ?? 'Hyderabad',
            state:    'Telangana',
            pincode:  '500072',
            lat:      0,
            lng:      0,
          };

      const placed = await callPlaceOrder(
        {
          buyerId:   userId,
          buyerName: name || 'Buyer',
          buyerPhone: phone || '0000000000',
          items: items.map((i) => ({
            productId:   i.product.id,
            productName: i.product.name,
            sellerId:    i.product.vendorId,
            sellerName:  i.product.vendor,
            quantity:    i.quantity,
            unitPrice:   Math.round(i.product.price * 100),  // rupees → paise
            unit:        'piece',
          })),
          deliveryAddress: addr,
          paymentMethod: selectedPayment,
        },
        token,
      );

      // placed is now an array (one sub-order per seller)
      const primaryOrder = placed[0]!;

      // Wallet: debit the sum of all sub-orders immediately
      if (selectedPayment === 'wallet' && userId) {
        try {
          const totalPaise = placed.reduce((s, o) => s + o.total, 0);
          const result = await debitWallet(userId, totalPaise, primaryOrder.id);
          setWalletBalance(result.balance);
        } catch (debitErr) {
          setOrderError(debitErr instanceof Error ? debitErr.message : 'Wallet debit failed');
          setBusy(false);
          return;
        }
      }

      clearCart();
      router.replace({
        pathname: '/order-confirmed',
        params: { orderId: primaryOrder.id, slot: slotLabel, payment: paymentLabel },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setOrderError(msg);
      setBusy(false);
    }
  };

  return (
    <View style={s.screen}>
      {/* Top Bar */}
      <SafeAreaView edges={['top']} style={s.topBar}>
        <Pressable
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/cart')}
          style={({ pressed }) => [s.backBtn, pressed && { opacity: 0.6 }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={s.backText}>{t('checkout_back')}</Text>
        </Pressable>
        <Text style={s.topTitle}>{t('checkout_title')}</Text>
        <View style={{ width: 64 }} />
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Error Banner */}
        {orderError && (
          <View style={s.errorBanner}>
            <Text style={s.errorIcon}>⚠️</Text>
            <Text style={s.errorMsg}>{orderError}</Text>
            <Pressable onPress={() => setOrderError(null)} hitSlop={8}>
              <Text style={s.errorClose}>✕</Text>
            </Pressable>
          </View>
        )}

        {/* Deliver To */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{t('checkout_deliver_to')}</Text>
          <PressableScale
            style={s.card}
            scale={0.99}
            onPress={() => router.push({ pathname: '/address-book', params: { select: '1' } })}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={s.addrIcon}>
                <Text style={{ fontSize: 18 }}>
                  {selectedAddress?.label === 'Work' ? '🏢' : selectedAddress?.label === 'Other' ? '📍' : '🏠'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.addrTitle}>
                  {selectedAddress?.label ?? 'Home'}
                  {selectedAddress?.isDefault && (
                    <Text style={s.addrDefaultBadge}>  Default</Text>
                  )}
                </Text>
                {selectedAddress ? (
                  <>
                    <Text style={s.addrName}>{selectedAddress.name}  ·  {selectedAddress.phone}</Text>
                    <Text style={s.addrSub}>{selectedAddress.line1}{selectedAddress.line2 ? ', ' + selectedAddress.line2 : ''}</Text>
                    <Text style={s.addrDistrict}>{selectedAddress.city} – {selectedAddress.pincode}, {selectedAddress.district}</Text>
                  </>
                ) : (
                  <Text style={s.addrSub}>{addressString}</Text>
                )}
              </View>
              <Text style={s.changeText}>{t('checkout_change')}</Text>
            </View>
          </PressableScale>
        </View>

        {/* Delivery Slot */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{t('checkout_delivery_slot')}</Text>
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
          <Text style={s.sectionTitle}>{t('checkout_payment_method')}</Text>
          <View style={s.card}>
            {PAYMENT_METHODS.map((pm, i) => (
              <View key={pm.id}>
                <Pressable
                  onPress={() => !('disabled' in pm && pm.disabled) && setSelectedPayment(pm.id as 'upi' | 'card' | 'cod' | 'wallet')}
                  style={({ pressed }) => [s.pmRow, pressed && !('disabled' in pm && pm.disabled) && { backgroundColor: '#fafafa' }, ('disabled' in pm && pm.disabled) && { opacity: 0.45 }]}
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
          <Text style={s.sectionTitle}>{t('checkout_order_summary')}</Text>
          <View style={[s.card, { gap: 10 }]}>
            <Text style={s.itemsSummary}>
              <Text style={{ color: '#111827', fontWeight: '700' }}>{itemCount} {t('checkout_items_from')}</Text>
              {' '}{vendorCount > 1 ? t('checkout_vendors') : t('checkout_vendor')}
            </Text>
            <View style={s.divider} />
            <PriceRow label={t('checkout_subtotal')}        value={`₹${subtotal}`} />
            <PriceRow label={t('checkout_delivery_fee')}   value={`₹${delivery}`} />
            <PriceRow label={t('checkout_coupon_discount')} value={`-₹${discount}`} green />
            <View style={s.divider} />
            <PriceRow label={t('checkout_total')}          value={`₹${total}`} bold />
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky Place Order Bar */}
      <SafeAreaView edges={['bottom']} style={s.bottomBar}>
        <PressableScale
          style={[s.placeOrderBtn, (busy || items.length === 0) && { opacity: 0.6 }]}
          scale={0.97}
          onPress={handlePlaceOrder}
        >
          {busy ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Text style={s.placeOrderText}>{t('checkout_place_order')}</Text>
              <View style={s.placeOrderBadge}>
                <Text style={s.placeOrderBadgeText}>₹{total}</Text>
              </View>
            </>
          )}
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
  addrDefaultBadge: { fontSize: 10, color: '#c75a28', fontWeight: '600' },
  addrName: { fontSize: 11, color: '#374151', fontWeight: '600', marginTop: 1 },
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

  errorBanner: {
    marginHorizontal: 16, marginTop: 12,
    backgroundColor: '#fef2f2', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#fecaca',
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  errorIcon: { fontSize: 16 },
  errorMsg: { flex: 1, fontSize: 13, color: '#dc2626', fontWeight: '600', lineHeight: 18 },
  errorClose: { fontSize: 14, color: '#dc2626', fontWeight: '700' },

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
