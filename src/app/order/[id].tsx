import { useEffect, useState } from 'react';
import { Modal, ScrollView, View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/pressable-scale';
import { fetchOrderById, cancelOrder } from '@/services/orders';
import { useAuthStore } from '@/store/auth';
import { useLanguage } from '@/context/language-context';
import type { OrderStatus } from '@/types';
import type { ApiOrder } from '@/services/orders';

type DisplayOrder = {
  id:             string;
  date:           string;
  status:         OrderStatus;
  apiStatus:      string;
  paymentMethod:  string;
  items:          { name: string; image: string; qty: number; price: number }[];
  total:          number;
  vendor:         string;
  subtotal:       number;
  deliveryFee:    number;
  discount:       number;
  address:        string;
  expectedDelivery?: string;
};

const CANCELLABLE_STATUSES = new Set(['pending_payment', 'confirmed', 'processing']);
const CANCEL_REASONS = [
  'Changed my mind',
  'Ordered by mistake',
  'Delivery time is too long',
  'Found a better price',
  'Want to change delivery address',
  'Item quality concern',
];



const PAYMENT_LABELS: Record<string, string> = {
  upi: 'UPI', card: 'Credit / Debit Card',
  cod: 'Cash on Delivery', wallet: 'Harvest Wallet',
};

function mapStatus(s: string): OrderStatus {
  if (s === 'delivered')                                                  return 'delivered';
  if (s === 'in_transit' || s === 'dispatched')                           return 'in-transit';
  if (s === 'cancelled' || s === 'refund_initiated' || s === 'refunded')  return 'cancelled';
  return 'processing';
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDelivery(d: string): string {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function apiToDisplay(api: ApiOrder): DisplayOrder {
  const addr = api.deliveryAddress;
  const addressStr = [addr.line1, addr.line2, addr.city, addr.pincode].filter(Boolean).join(', ');
  const sellerNames = [...new Set(api.items.map((i) => i.sellerName))];

  return {
    id:        api.id,
    date:      formatDate(api.createdAt),
    status:    mapStatus(api.status),
    apiStatus: api.status,
    items:  api.items.map((i) => ({
      name:  i.productName,
      image: '📦',
      qty:   i.quantity,
      price: Math.round(i.unitPrice / 100),
    })),
    total:         Math.round(api.total / 100),
    vendor:        sellerNames.length === 1 ? sellerNames[0]! : 'Multiple Vendors',
    subtotal:      Math.round(api.subtotal / 100),
    deliveryFee:   Math.round(api.deliveryFee / 100),
    discount:      Math.round(api.discount / 100),
    paymentMethod: PAYMENT_LABELS[api.paymentMethod] ?? api.paymentMethod,
    address:       addressStr,
    expectedDelivery: api.estimatedDelivery ? formatDelivery(api.estimatedDelivery) : undefined,
  };
}

export default function OrderDetailScreen() {
  const { t } = useLanguage();

  const STATUS_CFG: Record<OrderStatus, { label: string; bg: string; text: string; border: string; icon: string; step: number }> = {
    processing:   { label: t('orders_status_processing'),  bg: '#f3f4f6', text: '#374151', border: '#d1d5db', icon: '⏳', step: 1 },
    'in-transit': { label: t('orders_status_transit'),     bg: '#fef3c7', text: '#92400e', border: '#fcd34d', icon: '🚚', step: 2 },
    delivered:    { label: t('orders_status_delivered'),   bg: '#dcfce7', text: '#166534', border: '#86efac', icon: '✓',  step: 3 },
    cancelled:    { label: t('orders_status_cancelled'),   bg: '#fef2f2', text: '#991b1b', border: '#fecaca', icon: '✕',  step: 0 },
  };

  const STEPS = [
    { label: t('order_detail_placed'),     sub: t('order_detail_confirmed') },
    { label: t('order_detail_confirmed'),  sub: t('order_detail_dispatched') },
    { label: t('order_detail_dispatched'), sub: t('order_detail_transit') },
    { label: t('order_detail_delivered'),  sub: t('order_detail_delivered') },
  ];

  const { id }        = useLocalSearchParams<{ id: string }>();
  const { token }     = useAuthStore();
  const [order,          setOrder]          = useState<DisplayOrder | null>(null);
  const [loading,        setLoading]        = useState(true);
  const [cancelModal,    setCancelModal]    = useState(false);
  const [cancelReason,   setCancelReason]   = useState<string | null>(null);
  const [cancelling,     setCancelling]     = useState(false);
  const [cancelError,    setCancelError]    = useState<string | null>(null);

  useEffect(() => {
    if (!id || !token) { setLoading(false); return; }
    fetchOrderById(id, token)
      .then((api) => { if (api) setOrder(apiToDisplay(api)); })
      .finally(() => setLoading(false));
  }, [id, token]);

  async function handleCancelOrder() {
    if (!order || !token || !cancelReason) return;
    setCancelling(true);
    setCancelError(null);
    try {
      const updated = await cancelOrder(order.id, cancelReason, token);
      setOrder((prev) => prev
        ? { ...prev, status: mapStatus(updated.status), apiStatus: updated.status }
        : prev,
      );
      setCancelModal(false);
      setCancelReason(null);
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : 'Failed to cancel order. Please try again.');
    } finally {
      setCancelling(false);
    }
  }

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
        <Pressable style={s.backBtnCenter} onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/orders')}>
          <Text style={s.backBtnCenterText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const cfg         = STATUS_CFG[order.status];
  const currentStep = cfg.step;
  const cancellable = CANCELLABLE_STATUSES.has(order.apiStatus);

  return (
    <View style={s.screen}>
      {/* Cancel Order Bottom Sheet */}
      <Modal
        visible={cancelModal}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => { if (!cancelling) { setCancelModal(false); setCancelError(null); } }}>
        <View style={s.modalOverlay}>
          <Pressable
            style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.55)' }]}
            onPress={() => { if (!cancelling) { setCancelModal(false); setCancelError(null); } }}
          />
          <View style={s.modalSheet}>
            {/* Modal Header */}
            <View style={s.modalHead}>
              <Text style={s.modalTitle}>Cancel Order</Text>
              <Pressable
                style={s.modalCloseBtn}
                onPress={() => { setCancelModal(false); setCancelError(null); }}
                disabled={cancelling}>
                <Text style={s.modalCloseTxt}>✕</Text>
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              <Text style={s.modalSub}>Why are you cancelling this order?</Text>

              {/* Reason List */}
              <View style={s.reasonList}>
                {CANCEL_REASONS.map((reason) => {
                  const selected = cancelReason === reason;
                  return (
                    <Pressable
                      key={reason}
                      style={[s.reasonRow, selected && s.reasonRowSelected]}
                      onPress={() => { setCancelReason(reason); setCancelError(null); }}>
                      <View style={[s.radioOuter, selected && s.radioOuterSelected]}>
                        {selected && <View style={s.radioInner} />}
                      </View>
                      <Text style={[s.reasonText, selected && s.reasonTextSelected]}>{reason}</Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Refund Note */}
              <View style={s.refundNote}>
                <Text style={{ fontSize: 14 }}>💳</Text>
                <Text style={s.refundNoteText}>
                  {order.paymentMethod === 'Cash on Delivery'
                    ? 'No refund applicable for COD orders.'
                    : 'Refund will be processed to your original payment method within 5–7 business days.'}
                </Text>
              </View>

              {cancelError && (
                <View style={s.errorBanner}>
                  <Text style={s.errorBannerText}>{cancelError}</Text>
                </View>
              )}

              <View style={{ height: 16 }} />
            </ScrollView>

            {/* Action Buttons */}
            <View style={s.modalFooter}>
              <Pressable
                style={[s.confirmCancelBtn, (!cancelReason || cancelling) && s.confirmCancelBtnDisabled]}
                onPress={handleCancelOrder}
                disabled={!cancelReason || cancelling}>
                {cancelling
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={s.confirmCancelBtnText}>Confirm Cancellation</Text>}
              </Pressable>
              <Pressable
                style={s.keepOrderBtn}
                onPress={() => { setCancelModal(false); setCancelError(null); }}
                disabled={cancelling}>
                <Text style={s.keepOrderBtnText}>Keep my order</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      {/* Top Bar */}
      <SafeAreaView edges={['top']} style={s.topBar}>
        <Pressable
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/orders')}
          style={({ pressed }) => [s.backBtn, pressed && { opacity: 0.6 }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={s.backText}>{t('order_detail_back')}</Text>
        </Pressable>
        <Text style={s.topTitle} numberOfLines={1}>{t('order_detail_title')} #{order.id.slice(-8)}</Text>
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

        {/* Timeline Stepper or Cancellation Notice */}
        {order.status === 'cancelled' ? (
          <View style={s.section}>
            <View style={s.cancelledNotice}>
              <Text style={{ fontSize: 28 }}>🚫</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.cancelledNoticeTitle}>Order Cancelled</Text>
                <Text style={s.cancelledNoticeSub}>
                  {order.paymentMethod === 'Cash on Delivery'
                    ? 'No refund applicable for COD orders.'
                    : 'If you were charged, the refund will be processed within 5–7 business days.'}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={s.section}>
            <Text style={s.sectionTitle}>{t('order_detail_timeline')}</Text>
            <View style={s.card}>
              {STEPS.map((step, i) => {
                const done   = currentStep > i;
                const active = currentStep === i;
                return (
                  <View key={i} style={s.stepRow}>
                    <View style={s.stepTrack}>
                      <View style={[s.stepDot, done && s.stepDotDone, active && s.stepDotActive]}>
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
        )}

        {/* Items */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{t('order_detail_items')} · {order.vendor}</Text>
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
                  <Text style={s.itemPrice}>₹{item.price * item.qty}</Text>
                </View>
                {i < order.items.length - 1 && <View style={s.divider} />}
              </View>
            ))}
          </View>
        </View>

        {/* Delivery Address */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{t('checkout_deliver_to')}</Text>
          <View style={s.card}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={s.addrIcon}><Text style={{ fontSize: 18 }}>📍</Text></View>
              <Text style={s.addrText}>{order.address}</Text>
            </View>
          </View>
        </View>

        {/* Price Breakdown */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{t('order_detail_summary')}</Text>
          <View style={[s.card, { gap: 10 }]}>
            <View style={s.priceRow}>
              <Text style={s.priceLabel}>{t('order_detail_subtotal')}</Text>
              <Text style={s.priceValue}>₹{order.subtotal}</Text>
            </View>
            <View style={s.priceRow}>
              <Text style={s.priceLabel}>{t('order_detail_delivery')}</Text>
              <Text style={s.priceValue}>₹{order.deliveryFee}</Text>
            </View>
            {order.discount > 0 && (
              <View style={s.priceRow}>
                <Text style={s.priceLabel}>{t('order_detail_discount')}</Text>
                <Text style={[s.priceValue, { color: '#2d8a4e', fontWeight: '700' }]}>-₹{order.discount}</Text>
              </View>
            )}
            <View style={s.priceRow}>
              <Text style={s.priceLabel}>{t('order_confirmed_payment')}</Text>
              <Text style={[s.priceValue, { color: '#374151' }]}>{order.paymentMethod}</Text>
            </View>
            <View style={s.divider} />
            <View style={s.priceRow}>
              <Text style={[s.priceLabel, { color: '#111827', fontWeight: '700', fontSize: 14 }]}>{t('order_detail_total')}</Text>
              <Text style={[s.priceValue, { color: '#c75a28', fontWeight: '800', fontSize: 15 }]}>₹{order.total}</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Action Bar */}
      <SafeAreaView edges={['bottom']} style={s.bottomBar}>
        {cancellable ? (
          <>
            <Pressable style={({ pressed }) => [s.supportBtn, pressed && { opacity: 0.75 }]}>
              <Text style={s.supportBtnText}>💬  Support</Text>
            </Pressable>
            <PressableScale
              style={s.cancelOrderBtn}
              scale={0.96}
              onPress={() => { setCancelReason(null); setCancelError(null); setCancelModal(true); }}>
              <Text style={s.cancelOrderBtnText}>Cancel Order</Text>
            </PressableScale>
          </>
        ) : order.status === 'delivered' ? (
          <>
            <Pressable style={({ pressed }) => [s.supportBtn, pressed && { opacity: 0.75 }]}>
              <Text style={s.supportBtnText}>💬  Support</Text>
            </Pressable>
            <PressableScale style={s.reorderBtn} scale={0.96}>
              <Text style={s.reorderBtnText}>🔄  Reorder</Text>
            </PressableScale>
          </>
        ) : (
          <Pressable style={[s.supportBtn, { flex: 1 }]}>
            <Text style={s.supportBtnText}>💬  Support</Text>
          </Pressable>
        )}
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
    borderRadius: 16, padding: 16, borderWidth: 1,
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
  stepDotDone:   { backgroundColor: '#c75a28', borderColor: '#c75a28' },
  stepDotActive: { backgroundColor: '#c75a28', borderColor: '#c75a28' },
  stepDotText:   { fontSize: 11, fontWeight: '800', color: '#9ca3af' },
  stepLine:      { width: 2, flex: 1, backgroundColor: '#e5e7eb', marginVertical: 3 },
  stepLineDone:  { backgroundColor: '#c75a28' },
  stepContent:   { flex: 1, paddingTop: 3 },
  stepLabel:     { fontSize: 13, fontWeight: '600', color: '#9ca3af' },
  stepSub:       { fontSize: 11, color: '#9ca3af', marginTop: 2 },

  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  itemEmoji: {
    width: 50, height: 50, backgroundColor: '#fff7f5',
    borderRadius: 12, alignItems: 'center', justifyContent: 'center',
  },
  itemName:    { fontSize: 13, fontWeight: '700', color: '#111827' },
  itemQtyText: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  itemPrice:   { fontSize: 14, fontWeight: '800', color: '#c75a28' },
  divider:     { height: 1, backgroundColor: '#f0f0f3' },

  addrIcon: { width: 40, height: 40, backgroundColor: '#fff7f5', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  addrText: { fontSize: 13, color: '#374151', flex: 1, lineHeight: 18 },

  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceLabel: { fontSize: 13, color: '#6b7280' },
  priceValue: { fontSize: 13, color: '#111827', fontWeight: '600' },

  bottomBar: {
    flexDirection: 'row', gap: 12,
    backgroundColor: '#fff', paddingHorizontal: 16, paddingTop: 12,
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
    flex: 1, height: 50, borderRadius: 14, backgroundColor: '#c75a28',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#c75a28', shadowOpacity: 0.3, shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 }, elevation: 4,
  },
  reorderBtnText: { fontSize: 14, color: '#fff', fontWeight: '800' },
  cancelOrderBtn: {
    flex: 1, height: 50, borderRadius: 14,
    borderWidth: 1.5, borderColor: '#fca5a5',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff5f5',
  },
  cancelOrderBtnText: { fontSize: 14, color: '#dc2626', fontWeight: '700' },

  // Cancelled notice
  cancelledNotice: {
    flexDirection: 'row', gap: 14, alignItems: 'flex-start',
    backgroundColor: '#fef2f2', borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: '#fecaca',
  },
  cancelledNoticeTitle: { fontSize: 15, fontWeight: '800', color: '#991b1b', marginBottom: 4 },
  cancelledNoticeSub:   { fontSize: 12, color: '#b91c1c', lineHeight: 17 },

  // Cancel Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    overflow: 'hidden',
    paddingBottom: 16,
  },
  modalHead: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f3',
  },
  modalTitle:    { fontSize: 17, fontWeight: '800', color: '#111827' },
  modalCloseBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center',
  },
  modalCloseTxt: { fontSize: 12, color: '#6b7280', fontWeight: '700' },
  modalSub:      { fontSize: 13, color: '#6b7280', marginHorizontal: 20, marginTop: 14, marginBottom: 12 },

  reasonList: { paddingHorizontal: 20, gap: 8 },
  reasonRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: 12,
    borderWidth: 1.5, borderColor: '#e5e7eb', backgroundColor: '#fff',
  },
  reasonRowSelected: { borderColor: '#dc2626', backgroundColor: '#fff5f5' },
  radioOuter: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: '#d1d5db',
    alignItems: 'center', justifyContent: 'center',
  },
  radioOuterSelected: { borderColor: '#dc2626' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#dc2626' },
  reasonText:         { flex: 1, fontSize: 13, color: '#374151', fontWeight: '600' },
  reasonTextSelected: { color: '#dc2626' },

  refundNote: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
    marginHorizontal: 20, marginTop: 16,
    backgroundColor: '#fffbeb', borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: '#fde68a',
  },
  refundNoteText: { flex: 1, fontSize: 12, color: '#92400e', lineHeight: 17 },

  errorBanner: {
    marginHorizontal: 20, marginTop: 10,
    backgroundColor: '#fef2f2', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: '#fecaca',
  },
  errorBannerText: { fontSize: 12, color: '#dc2626' },

  modalFooter: { paddingHorizontal: 20, paddingTop: 16, gap: 10 },
  confirmCancelBtn: {
    height: 50, borderRadius: 14, backgroundColor: '#dc2626',
    alignItems: 'center', justifyContent: 'center',
  },
  confirmCancelBtnDisabled: { backgroundColor: '#fca5a5' },
  confirmCancelBtnText:     { fontSize: 14, color: '#fff', fontWeight: '800' },
  keepOrderBtn:      { height: 44, alignItems: 'center', justifyContent: 'center' },
  keepOrderBtnText:  { fontSize: 13, color: '#6b7280', fontWeight: '600' },
});
