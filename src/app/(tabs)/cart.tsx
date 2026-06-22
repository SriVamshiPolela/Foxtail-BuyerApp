import { useState } from 'react';
import { ScrollView, View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { ShippabilityBadge } from '@/components/buyer-ui';
import { PressableScale } from '@/components/pressable-scale';
import { useCartStore } from '@/store/cart';
import { useUserStore } from '@/store/user';
import { useLanguage } from '@/context/language-context';

function Checkbox({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
  return (
    <Pressable
      onPress={onToggle}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={[s.checkbox, checked && s.checkboxChecked]}
    >
      {checked && <Text style={s.checkmark}>✓</Text>}
    </Pressable>
  );
}

function PriceRow({ label, value, green, bold }: { label: string; value: string; green?: boolean; bold?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text style={[s.rowLabel, bold && { color: '#111827', fontWeight: '700', fontSize: 15 }]}>{label}</Text>
      <Text style={[s.rowValue, green && { color: '#2d8a4e', fontWeight: '700' }, bold && { color: '#c75a28', fontWeight: '800', fontSize: 16 }]}>
        {value}
      </Text>
    </View>
  );
}

export default function CartScreen() {
  const { t } = useLanguage();
  const items     = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQty  = useCartStore((s) => s.updateQty);

  // Track which items the user has unchecked. New items are checked by default.
  const [uncheckedIds, setUncheckedIds] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) =>
    setUncheckedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const selectedItems  = items.filter((i) => !uncheckedIds.has(i.product.id));
  const isAllSelected  = selectedItems.length === items.length;
  const noneSelected   = selectedItems.length === 0;

  const toggleAll = () =>
    setUncheckedIds(isAllSelected ? new Set(items.map((i) => i.product.id)) : new Set());

  const selectedSubtotal = selectedItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const selectedQtyCount = selectedItems.reduce((sum, i) => sum + i.quantity, 0);
  const totalItemCount   = items.reduce((sum, i) => sum + i.quantity, 0);

  const addresses       = useUserStore((s) => s.addresses);
  const selectedAddressId = useUserStore((s) => s.selectedAddressId);
  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  const [coupon, setCoupon] = useState('');
  const delivery = 40;
  const discount = 50;
  const total    = selectedSubtotal + delivery - discount;

  const handleCheckout = () => {
    const ids = selectedItems.map((i) => i.product.id).join(',');
    router.push({ pathname: '/checkout', params: { selectedIds: ids } });
  };

  if (items.length === 0) {
    return (
      <View style={s.emptyState}>
        <SafeAreaView edges={['top']}>
          <View style={s.header}>
            <Text style={s.title}>{t('cart_title')}</Text>
          </View>
        </SafeAreaView>
        <View style={s.emptyInner}>
          <Text style={{ fontSize: 64 }}>🛒</Text>
          <Text style={s.emptyTitle}>{t('cart_empty_title')}</Text>
          <Text style={s.emptyDesc}>{t('cart_empty_desc')}</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={s.screen} showsVerticalScrollIndicator={false}>
      <SafeAreaView edges={['top']}>
        <View style={s.header}>
          <Text style={s.title}>{t('cart_title')}</Text>
          <View style={s.itemCountBadge}>
            <Text style={s.itemCountText}>{totalItemCount} {t('home_items')}</Text>
          </View>
        </View>

        {/* Delivery Address */}
        <View style={s.section}>
          <PressableScale
            style={s.card}
            scale={0.99}
            onPress={() => router.push({ pathname: '/address-book', params: { select: '1' } })}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flexDirection: 'row', gap: 10, flex: 1 }}>
                <View style={s.addrIconWrap}>
                  <Text style={{ fontSize: 16 }}>
                    {selectedAddress?.label === 'Work' ? '🏢' : selectedAddress?.label === 'Other' ? '📍' : '🏠'}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.addrTitle}>{t('cart_delivering_to')} {selectedAddress?.label ?? 'Home'}</Text>
                  <Text style={s.addrSub}>
                    {selectedAddress
                      ? `${selectedAddress.line1}, ${selectedAddress.city} - ${selectedAddress.pincode}`
                      : t('cart_no_address')}
                  </Text>
                  {selectedAddress && (
                    <Text style={s.addrName}>{selectedAddress.name}  ·  {selectedAddress.phone}</Text>
                  )}
                </View>
              </View>
              <Text style={s.changeBtn}>{t('cart_change')}</Text>
            </View>
          </PressableScale>
        </View>

        {/* Cart Items — grouped by store */}
        <View style={s.section}>
          {/* Select All row */}
          <Pressable style={s.selectAllRow} onPress={toggleAll}>
            <Checkbox checked={isAllSelected} onToggle={toggleAll} />
            <Text style={s.selectAllText}>
              {isAllSelected ? t('cart_deselect_all') : t('cart_select_all')}
            </Text>
            {!isAllSelected && selectedItems.length > 0 && (
              <Text style={s.selectAllCount}>{selectedItems.length} {t('cart_selected_of')} {items.length} {t('cart_selected')}</Text>
            )}
          </Pressable>

          <View style={{ gap: 14 }}>
            {Object.values(
              items.reduce<Record<string, { vendorId: string; storeName: string; storeItems: typeof items }>>((acc, item) => {
                const key = item.product.vendorId;
                if (!acc[key]) acc[key] = { vendorId: key, storeName: item.product.vendor, storeItems: [] };
                acc[key].storeItems.push(item);
                return acc;
              }, {})
            ).map(({ vendorId, storeName, storeItems }) => (
              <View key={vendorId} style={s.storeGroup}>
                {/* Store Header */}
                <View style={s.storeHeader}>
                  <Text style={s.storeIcon}>🏪</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.storeName} numberOfLines={1}>{storeName}</Text>
                    <Text style={s.storeLocation} numberOfLines={1}>📍 {storeItems[0]!.product.location}</Text>
                  </View>
                  <Text style={s.storeCount}>{storeItems.length} item{storeItems.length !== 1 ? 's' : ''}</Text>
                </View>

                {/* Items for this store */}
                <View style={{ gap: 0 }}>
                  {storeItems.map((item, idx) => {
                    const checked = !uncheckedIds.has(item.product.id);
                    const isLast  = idx === storeItems.length - 1;
                    return (
                      <View
                        key={item.product.id}
                        style={[
                          s.storeItem,
                          !isLast && s.storeItemBorder,
                          !checked && s.cardDimmed,
                        ]}
                      >
                        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
                          {/* Checkbox */}
                          <View style={{ paddingTop: 4 }}>
                            <Checkbox checked={checked} onToggle={() => toggleItem(item.product.id)} />
                          </View>

                          {/* Thumbnail */}
                          <PressableScale style={s.itemImg} scale={0.94} onPress={() => {}}>
                            <Text style={{ fontSize: 32 }}>{item.product.image}</Text>
                          </PressableScale>

                          {/* Details */}
                          <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                              <View style={{ flex: 1 }}>
                                <Text style={s.itemName} numberOfLines={1}>{item.product.name}</Text>
                                <View style={{ marginTop: 5 }}>
                                  <ShippabilityBadge level={item.product.shippability} />
                                </View>
                              </View>
                              <Pressable
                                onPress={() => {
                                  removeItem(item.product.id);
                                  setUncheckedIds((prev) => { const n = new Set(prev); n.delete(item.product.id); return n; });
                                }}
                                style={({ pressed }) => [s.removeBtn, pressed && { opacity: 0.6, transform: [{ scale: 0.85 }] }]}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                              >
                                <Text style={s.removeBtnText}>✕</Text>
                              </Pressable>
                            </View>
                            <View style={s.itemBottom}>
                              <View style={s.qtyRow}>
                                <Pressable
                                  onPress={() => updateQty(item.product.id, -1)}
                                  style={({ pressed }) => [s.qtyBtn, s.qtyBtnMinus, pressed && { opacity: 0.7 }]}
                                >
                                  <Text style={s.qtyBtnText}>−</Text>
                                </Pressable>
                                <Text style={s.qtyText}>{item.quantity}</Text>
                                <Pressable
                                  onPress={() => updateQty(item.product.id, 1)}
                                  style={({ pressed }) => [s.qtyBtn, s.qtyBtnPlus, pressed && { opacity: 0.7 }]}
                                >
                                  <Text style={[s.qtyBtnText, { color: '#fff' }]}>+</Text>
                                </Pressable>
                              </View>
                              <Text style={[s.itemPrice, !checked && { color: '#9ca3af' }]}>
                                ₹{item.product.price * item.quantity}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Coupon */}
        <View style={s.section}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TextInput
              style={s.couponInput}
              placeholder={t('cart_coupon_placeholder')}
              placeholderTextColor="#9ca3af"
              value={coupon}
              onChangeText={setCoupon}
              autoCapitalize="characters"
            />
            <PressableScale style={s.applyBtn} scale={0.96}>
              <Text style={s.applyBtnText}>{t('cart_apply')}</Text>
            </PressableScale>
          </View>
        </View>

        {/* Price Summary */}
        <View style={s.section}>
          <View style={[s.card, { backgroundColor: '#fafafa' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={s.summaryTitle}>{t('cart_price_details')}</Text>
              {!isAllSelected && (
                <Text style={s.selectionNote}>
                  {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected · {selectedQtyCount} qty
                </Text>
              )}
            </View>
            <View style={{ gap: 10 }}>
              <PriceRow label={t('cart_subtotal')} value={`₹${selectedSubtotal}`} />
              <PriceRow label={t('cart_delivery_fee')} value={`₹${delivery}`} />
              <PriceRow label={t('cart_coupon_discount')} value={`-₹${discount}`} green />
              <View style={s.divider} />
              <PriceRow label={t('cart_total_payable')} value={noneSelected ? '₹0' : `₹${total}`} bold />
            </View>
          </View>
        </View>

        {/* Checkout */}
        <View style={[s.section, { paddingBottom: 12 }]}>
          <PressableScale
            style={[s.checkoutBtn, noneSelected && s.checkoutBtnDisabled]}
            scale={noneSelected ? 1 : 0.97}
            onPress={noneSelected ? undefined : handleCheckout}
          >
            <Text style={s.checkoutBtnText}>
              {noneSelected ? t('cart_select_to_continue') : t('cart_proceed_checkout')}
            </Text>
          </PressableScale>
          {!noneSelected && (
            <Text style={s.terms}>{t('cart_terms')}</Text>
          )}
        </View>

        <View style={{ height: 32 }} />
      </SafeAreaView>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f5f7' },
  emptyState: { flex: 1, backgroundColor: '#f5f5f7' },
  emptyInner: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  emptyDesc: { fontSize: 13, color: '#9ca3af', textAlign: 'center', lineHeight: 20 },

  header: {
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 10,
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  title: { fontSize: 22, fontWeight: '800', color: '#111827' },
  itemCountBadge: {
    backgroundColor: '#fff3ef', borderRadius: 99,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: '#fdc9b0',
  },
  itemCountText: { fontSize: 11, color: '#9a3412', fontWeight: '700' },

  section: { paddingHorizontal: 16, paddingTop: 12 },

  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: '#f0f0f3',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  cardDimmed: { opacity: 0.55 },

  selectAllRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 10, paddingHorizontal: 4, marginBottom: 4,
  },
  selectAllText: { fontSize: 13, fontWeight: '700', color: '#374151', flex: 1 },
  selectAllCount: { fontSize: 11, color: '#9ca3af', fontWeight: '600' },

  checkbox: {
    width: 20, height: 20, borderRadius: 5,
    borderWidth: 2, borderColor: '#d1d5db',
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#c75a28', borderColor: '#c75a28',
  },
  checkmark: { color: '#fff', fontSize: 12, fontWeight: '900', lineHeight: 14 },

  addrIconWrap: { width: 36, height: 36, backgroundColor: '#fff7f5', borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  addrTitle: { fontSize: 13, fontWeight: '700', color: '#111827' },
  addrSub: { fontSize: 11, color: '#6b7280', marginTop: 2, lineHeight: 16 },
  addrName: { fontSize: 10, color: '#9ca3af', marginTop: 2 },
  changeBtn: { fontSize: 12, color: '#c75a28', fontWeight: '700' },

  storeGroup: {
    backgroundColor: '#fff', borderRadius: 16,
    borderWidth: 1, borderColor: '#f0f0f3',
    overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  storeHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fff7f5', paddingHorizontal: 14, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#fde8dc',
  },
  storeIcon: { fontSize: 15 },
  storeName: { fontSize: 13, fontWeight: '800', color: '#111827' },
  storeLocation: { fontSize: 10, color: '#9a3412', marginTop: 1, fontWeight: '500' },
  storeCount: { fontSize: 11, color: '#9a3412', fontWeight: '600', backgroundColor: '#fde8dc', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99 },
  storeItem: { paddingHorizontal: 14, paddingVertical: 14 },
  storeItemBorder: { borderBottomWidth: 1, borderBottomColor: '#f5f5f7' },

  itemImg: { width: 68, height: 68, backgroundColor: '#fff7f5', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  itemName: { fontSize: 13, fontWeight: '700', color: '#111827' },
  removeBtn: {
    width: 28, height: 28, backgroundColor: '#fef2f2', borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#fecaca',
  },
  removeBtnText: { color: '#ef4444', fontSize: 12, fontWeight: '700' },
  itemBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#e5e7eb' },
  qtyBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  qtyBtnMinus: { backgroundColor: '#f3f4f6' },
  qtyBtnPlus: { backgroundColor: '#c75a28' },
  qtyBtnText: { fontSize: 18, color: '#374151', fontWeight: '700' },
  qtyText: { width: 32, textAlign: 'center', fontSize: 14, fontWeight: '800', color: '#111827', backgroundColor: '#fff', lineHeight: 34 },
  itemPrice: { fontSize: 16, fontWeight: '800', color: '#c75a28' },

  couponInput: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 14,
    height: 46, borderWidth: 1, borderColor: '#e5e7eb', fontSize: 13, color: '#111827',
  },
  applyBtn: {
    backgroundColor: '#c75a28', borderRadius: 12, paddingHorizontal: 18, height: 46, justifyContent: 'center',
    shadowColor: '#c75a28', shadowOpacity: 0.3, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 3,
  },
  applyBtnText: { fontSize: 13, fontWeight: '800', color: '#fff' },

  summaryTitle: { fontSize: 15, fontWeight: '800', color: '#111827' },
  selectionNote: { fontSize: 11, color: '#6b7280', fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#f0f0f3', marginVertical: 2 },
  rowLabel: { fontSize: 13, color: '#6b7280' },
  rowValue: { fontSize: 13, color: '#111827', fontWeight: '600' },

  checkoutBtn: {
    backgroundColor: '#c75a28', borderRadius: 16, height: 56,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#c75a28', shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 6,
  },
  checkoutBtnDisabled: {
    backgroundColor: '#d1d5db', shadowOpacity: 0,
  },
  checkoutBtnText: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },
  terms: { fontSize: 10, color: '#9ca3af', textAlign: 'center', marginTop: 10 },
});
