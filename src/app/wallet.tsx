import { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet,
  TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';

import { useUserStore } from '@/store/user';
import { useAuthStore } from '@/store/auth';
import { usePaymentStore } from '@/store/payment';
import { fetchWallet, topupWallet } from '@/services/user';
import { useLanguage } from '@/context/language-context';
import type { WalletTransaction } from '@/services/user';

const BRAND   = '#c75a28';
const GREEN   = '#16a34a';
const RED     = '#dc2626';

const QUICK_AMOUNTS = [100, 500, 1000, 2000];

function fmt(rupees: number) {
  return `₹${rupees.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

function TxnRow({ txn }: { txn: WalletTransaction }) {
  const isCredit = txn.type === 'credit';
  const date = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(txn.createdAt));
  return (
    <View style={s.txnRow}>
      <View style={[s.txnIcon, { backgroundColor: isCredit ? '#f0fdf4' : '#fef2f2' }]}>
        <Text style={{ fontSize: 16 }}>{isCredit ? '↓' : '↑'}</Text>
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={s.txnDesc} numberOfLines={1}>{txn.description}</Text>
        <Text style={s.txnDate}>{date}</Text>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 2 }}>
        <Text style={[s.txnAmount, { color: isCredit ? GREEN : RED }]}>
          {isCredit ? '+' : '-'}{fmt(txn.amount)}
        </Text>
        <Text style={s.txnBalance}>Bal: {fmt(txn.balance)}</Text>
      </View>
    </View>
  );
}

export default function WalletScreen() {
  const { t } = useLanguage();
  const userId         = useAuthStore((s) => s.userId);
  const walletBalance  = useUserStore((s) => s.walletBalance);
  const setWalletBal   = useUserStore((s) => s.setWalletBalance);
  const upiIds         = usePaymentStore((s) => s.upiIds);
  const cards          = usePaymentStore((s) => s.cards);

  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [selectedAmt,  setSelectedAmt]  = useState<number | null>(null);
  const [customAmt,    setCustomAmt]    = useState('');
  const [selectedPM,   setSelectedPM]   = useState<string | null>(null);  // pm id or 'upi:id' / 'card:id'
  const [adding,       setAdding]       = useState(false);
  const [addErr,       setAddErr]       = useState('');
  const [showForm,     setShowForm]     = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!userId) return;
      setLoading(true);
      fetchWallet(userId)
        .then((w) => { setWalletBal(w.balance); setTransactions(w.transactions); })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, [userId]),
  );

  // effectiveAmount is in rupees throughout — only multiply to paise when calling API
  const effectiveAmount = selectedAmt ?? (customAmt ? parseInt(customAmt, 10) : 0);

  function resetForm() {
    setSelectedAmt(null); setCustomAmt(''); setSelectedPM(null);
    setAddErr(''); setShowForm(false);
  }

  async function handleAddMoney() {
    if (!userId) return;
    if (effectiveAmount < 1) { setAddErr(t('wallet_min_error')); return; }
    if (effectiveAmount > 10000) { setAddErr(t('wallet_max_error')); return; }
    if (!selectedPM) { setAddErr(t('wallet_pm_error')); return; }

    setAdding(true); setAddErr('');
    try {
      const [pmType, pmId] = selectedPM.split(':') as [string, string];
      const result = await topupWallet(userId, effectiveAmount, pmType, pmId);
      setWalletBal(result.balance);
      setTransactions((prev) => [result.transaction, ...prev]);
      resetForm();
      Alert.alert('Money Added!', `${fmt(effectiveAmount)} added to your Harvest Wallet.`);
    } catch (e) {
      setAddErr(e instanceof Error ? e.message : 'Failed to add money');
    } finally {
      setAdding(false);
    }
  }

  const defaultUPI  = upiIds.find((u) => u.isDefault) ?? upiIds[0];
  const defaultCard = cards.find((c) => c.isDefault) ?? cards[0];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.screen}>

        {/* Header */}
        <SafeAreaView edges={['top']} style={s.header}>
          <Pressable
            onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')}
            style={({ pressed }) => [s.backBtn, pressed && { opacity: 0.6 }]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={s.backTxt}>← Back</Text>
          </Pressable>
          <Text style={s.headerTitle}>{t('wallet_title')}</Text>
          <View style={{ width: 64 }} />
        </SafeAreaView>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={s.content}
        >
          {/* Balance card */}
          <View style={s.balanceCard}>
            <View style={s.walletIconWrap}>
              <Text style={{ fontSize: 32 }}>👛</Text>
            </View>
            <Text style={s.balanceLabel}>{t('wallet_balance_label')}</Text>
            {loading ? (
              <ActivityIndicator color="#fff" style={{ marginTop: 8 }} />
            ) : (
              <Text style={s.balanceAmt}>{fmt(walletBalance)}</Text>
            )}
            <Text style={s.balanceSub}>{t('wallet_balance_sub')}</Text>

            {!showForm && (
              <Pressable
                style={({ pressed }) => [s.addMoneyBtn, pressed && { opacity: 0.85 }]}
                onPress={() => setShowForm(true)}
              >
                <Text style={s.addMoneyTxt}>{t('wallet_add_money')}</Text>
              </Pressable>
            )}
          </View>

          {/* Add money form */}
          {showForm && (
            <View style={s.formCard}>
              <Text style={s.formTitle}>{t('wallet_form_title')}</Text>

              {/* Quick amounts */}
              <Text style={s.fieldLabel}>{t('wallet_select_amount')}</Text>
              <View style={s.quickRow}>
                {QUICK_AMOUNTS.map((amt) => (
                  <Pressable
                    key={amt}
                                  onPress={() => { setSelectedAmt(amt); setCustomAmt(''); setAddErr(''); }}
                    style={({ pressed }) => [
                      s.quickBtn,
                      selectedAmt === amt && s.quickBtnActive,
                      pressed && { opacity: 0.8 },
                    ]}
                  >
                    <Text style={[s.quickTxt, selectedAmt === amt && s.quickTxtActive]}>
                      ₹{amt}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={s.orDivider}>{t('wallet_custom_or')}</Text>

              <View style={s.customAmtRow}>
                <Text style={s.rupeeSign}>₹</Text>
                <TextInput
                  style={s.customInput}
                  value={customAmt}
                  onChangeText={(v) => { setCustomAmt(v.replace(/\D/g, '')); setSelectedAmt(null); setAddErr(''); }}
                  placeholder="0"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>

              {/* Payment method */}
              <Text style={[s.fieldLabel, { marginTop: 16 }]}>{t('wallet_pay_via')}</Text>

              {upiIds.length === 0 && cards.length === 0 ? (
                <Pressable onPress={() => router.push('/payments')} style={s.addPMPrompt}>
                  <Text style={s.addPMPromptTxt}>{t('wallet_no_pm')}</Text>
                </Pressable>
              ) : (
                <View style={s.pmList}>
                  {upiIds.map((upi) => (
                    <Pressable
                      key={upi.id}
                      onPress={() => { setSelectedPM(`upi:${upi.id}`); setAddErr(''); }}
                      style={({ pressed }) => [
                        s.pmOption,
                        selectedPM === `upi:${upi.id}` && s.pmOptionActive,
                        pressed && { opacity: 0.8 },
                      ]}
                    >
                      <View style={[s.pmDot, selectedPM === `upi:${upi.id}` && s.pmDotActive]} />
                      <Text style={s.pmIcon}>₹</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={s.pmLabel}>{upi.upiId}</Text>
                        <Text style={s.pmSub}>{upi.appName}</Text>
                      </View>
                      {upi.isDefault && <Text style={s.pmDefault}>Default</Text>}
                    </Pressable>
                  ))}
                  {cards.map((card) => (
                    <Pressable
                      key={card.id}
                      onPress={() => { setSelectedPM(`card:${card.id}`); setAddErr(''); }}
                      style={({ pressed }) => [
                        s.pmOption,
                        selectedPM === `card:${card.id}` && s.pmOptionActive,
                        pressed && { opacity: 0.8 },
                      ]}
                    >
                      <View style={[s.pmDot, selectedPM === `card:${card.id}` && s.pmDotActive]} />
                      <Text style={s.pmIcon}>💳</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={s.pmLabel}>•••• {card.last4}</Text>
                        <Text style={s.pmSub}>{card.network.toUpperCase()} {card.type}</Text>
                      </View>
                      {card.isDefault && <Text style={s.pmDefault}>Default</Text>}
                    </Pressable>
                  ))}
                </View>
              )}

              {addErr ? <Text style={s.errTxt}>{addErr}</Text> : null}

              {/* Preview */}
              {effectiveAmount >= 1 && selectedPM && (
                <View style={s.previewBox}>
                  <Text style={s.previewTxt}>
                    {t('wallet_preview_adding')} <Text style={{ fontWeight: '800' }}>{fmt(effectiveAmount)}</Text> {t('wallet_preview_to')}
                  </Text>
                  <Text style={s.previewSub}>
                    {t('wallet_preview_new_bal')} {fmt(walletBalance + effectiveAmount)}
                  </Text>
                </View>
              )}

              <View style={s.formActions}>
                <Pressable
                  style={({ pressed }) => [s.cancelBtn, pressed && { opacity: 0.7 }]}
                  onPress={resetForm}
                >
                  <Text style={s.cancelTxt}>{t('wallet_cancel')}</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [s.confirmBtn, (pressed || adding) && { opacity: 0.8 }]}
                  onPress={handleAddMoney}
                  disabled={adding}
                >
                  {adding
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <Text style={s.confirmTxt}>{t('wallet_confirm_add')} {effectiveAmount >= 1 ? fmt(effectiveAmount) : ''}</Text>
                  }
                </Pressable>
              </View>
            </View>
          )}

          {/* Transaction history */}
          <View>
            <Text style={s.sectionLabel}>{t('wallet_transactions')}</Text>
            <View style={s.txnCard}>
              {loading ? (
                <View style={s.centerPad}>
                  <ActivityIndicator color={BRAND} />
                </View>
              ) : transactions.length === 0 ? (
                <View style={s.centerPad}>
                  <Text style={{ fontSize: 28, textAlign: 'center' }}>🧾</Text>
                  <Text style={s.emptyTxt}>{t('wallet_empty')}</Text>
                  <Text style={s.emptySub}>{t('wallet_empty_sub')}</Text>
                </View>
              ) : (
                transactions.map((txn, i) => (
                  <View key={txn.id}>
                    {i > 0 && <View style={s.divider} />}
                    <TxnRow txn={txn} />
                  </View>
                ))
              )}
            </View>
          </View>

          {/* Info note */}
          <View style={s.infoNote}>
            <Text style={s.infoIcon}>ℹ️</Text>
            <Text style={s.infoTxt}>{t('wallet_info')}</Text>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: '#f5f5f7' },

  header: {
    backgroundColor: BRAND, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 16,
    shadowColor: BRAND, shadowOpacity: 0.3, shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 }, elevation: 6,
  },
  backBtn:     { width: 64, paddingVertical: 8 },
  backTxt:     { fontSize: 14, color: '#fff', fontWeight: '700' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '800', color: '#fff' },

  content: { padding: 16, gap: 20 },

  balanceCard: {
    backgroundColor: '#1e3a2f', borderRadius: 20, padding: 24,
    alignItems: 'center', gap: 8,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  walletIconWrap: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  balanceLabel: { fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  balanceAmt:   { fontSize: 42, fontWeight: '800', color: '#fff', letterSpacing: -1 },
  balanceSub:   { fontSize: 11, color: 'rgba(255,255,255,0.5)', textAlign: 'center' },
  addMoneyBtn: {
    marginTop: 8, backgroundColor: BRAND, borderRadius: 14,
    paddingHorizontal: 32, paddingVertical: 12,
    shadowColor: BRAND, shadowOpacity: 0.4, shadowRadius: 8, elevation: 4,
  },
  addMoneyTxt: { fontSize: 14, fontWeight: '800', color: '#fff' },

  formCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 10,
    borderWidth: 1, borderColor: '#f0f0f3',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  formTitle: { fontSize: 15, fontWeight: '800', color: '#111827' },
  fieldLabel: { fontSize: 10, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 },

  quickRow:      { flexDirection: 'row', gap: 8 },
  quickBtn:      { flex: 1, height: 44, borderRadius: 10, borderWidth: 1.5, borderColor: '#e5e7eb', backgroundColor: '#fafafa', alignItems: 'center', justifyContent: 'center' },
  quickBtnActive:{ borderColor: BRAND, backgroundColor: '#fff7f5' },
  quickTxt:      { fontSize: 13, fontWeight: '700', color: '#6b7280' },
  quickTxtActive:{ color: BRAND },

  orDivider:  { fontSize: 11, color: '#9ca3af', textAlign: 'center' },
  customAmtRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12, backgroundColor: '#fafafa', paddingHorizontal: 14, height: 50 },
  rupeeSign:  { fontSize: 20, fontWeight: '700', color: '#374151', marginRight: 6 },
  customInput:{ flex: 1, fontSize: 24, fontWeight: '700', color: '#111827' },

  pmList:       { gap: 8 },
  pmOption:     { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, borderWidth: 1.5, borderColor: '#e5e7eb', backgroundColor: '#fafafa' },
  pmOptionActive:{ borderColor: BRAND, backgroundColor: '#fff7f5' },
  pmDot:        { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#d1d5db' },
  pmDotActive:  { borderColor: BRAND, backgroundColor: BRAND },
  pmIcon:       { fontSize: 18, width: 28, textAlign: 'center' },
  pmLabel:      { fontSize: 13, fontWeight: '700', color: '#111827' },
  pmSub:        { fontSize: 11, color: '#9ca3af' },
  pmDefault:    { fontSize: 10, color: BRAND, fontWeight: '700', backgroundColor: '#fff7f5', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, borderColor: '#fdc9b0' },

  addPMPrompt: { padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: '#e5e7eb', borderStyle: 'dashed', alignItems: 'center' },
  addPMPromptTxt: { fontSize: 12, color: BRAND, fontWeight: '600', textAlign: 'center' },

  errTxt: { fontSize: 11, color: '#ef4444' },

  previewBox: { backgroundColor: '#f0fdf4', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#bbf7d0', gap: 2 },
  previewTxt: { fontSize: 13, color: '#166534' },
  previewSub: { fontSize: 11, color: '#4ade80' },

  formActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelBtn:   { flex: 1, height: 44, borderRadius: 12, borderWidth: 1.5, borderColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fafafa' },
  cancelTxt:   { fontSize: 13, fontWeight: '700', color: '#6b7280' },
  confirmBtn:  {
    flex: 2, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    backgroundColor: BRAND,
    shadowColor: BRAND, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4,
  },
  confirmTxt:  { fontSize: 13, fontWeight: '800', color: '#fff' },

  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  txnCard: {
    backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: '#f0f0f3',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  txnRow:    { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  txnIcon:   { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  txnDesc:   { fontSize: 13, fontWeight: '600', color: '#111827' },
  txnDate:   { fontSize: 11, color: '#9ca3af' },
  txnAmount: { fontSize: 14, fontWeight: '800' },
  txnBalance:{ fontSize: 10, color: '#9ca3af' },
  divider:   { height: StyleSheet.hairlineWidth, backgroundColor: '#f0f0f3', marginHorizontal: 14 },

  centerPad:  { padding: 32, alignItems: 'center', gap: 8 },
  emptyTxt:   { fontSize: 14, fontWeight: '700', color: '#374151' },
  emptySub:   { fontSize: 12, color: '#9ca3af' },

  infoNote: { flexDirection: 'row', gap: 8, backgroundColor: '#eff6ff', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#bfdbfe' },
  infoIcon: { fontSize: 14 },
  infoTxt:  { flex: 1, fontSize: 11, color: '#1e40af', lineHeight: 16 },
});
