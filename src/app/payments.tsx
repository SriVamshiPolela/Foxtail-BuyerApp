import { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet,
  TextInput, Switch, Alert, KeyboardAvoidingView, Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';

import { usePaymentStore, detectUPIApp, detectCardNetwork } from '@/store/payment';
import { useAuthStore } from '@/store/auth';
import {
  fetchPaymentMethods,
  addUPIToServer, addCardToServer,
  setDefaultPMOnServer, deletePMFromServer,
  validateUPIId,
} from '@/services/payment';
import type { SavedCard, CardType, UPIApp } from '@/store/payment';

const BRAND = '#c75a28';

// ── UPI app meta ──────────────────────────────────────────────────────────────
const UPI_META: Record<UPIApp, { color: string; short: string }> = {
  GPay:    { color: '#4285F4', short: 'G' },
  PhonePe: { color: '#5F259F', short: 'Ph' },
  Paytm:   { color: '#00BAF2', short: 'Pt' },
  BHIM:    { color: '#007932', short: 'B' },
  UPI:     { color: '#9ca3af', short: '₹' },
};

// ── Card network meta ─────────────────────────────────────────────────────────
const CARD_META: Record<string, { from: string; to: string; label: string }> = {
  visa:       { from: '#1a237e', to: '#283593', label: 'VISA' },
  mastercard: { from: '#1f1c2c', to: '#5c5b8d', label: 'MASTERCARD' },
  rupay:      { from: '#0d47a1', to: '#1976d2', label: 'RuPay' },
  amex:       { from: '#004d40', to: '#00796b', label: 'AMEX' },
  unknown:    { from: '#374151', to: '#6b7280', label: 'CARD' },
};

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader({ label, action, onAction }: {
  label: string; action?: string; onAction?: () => void;
}) {
  return (
    <View style={s.sectionHead}>
      <Text style={s.sectionLabel}>{label}</Text>
      {action && (
        <Pressable onPress={onAction} hitSlop={8} style={({ pressed }) => pressed && { opacity: 0.6 }}>
          <Text style={s.sectionAction}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}

function CardVisual({ card }: { card: SavedCard }) {
  const meta = CARD_META[card.network] ?? CARD_META.unknown!;
  return (
    <View style={[s.cardVisual, { backgroundColor: meta.from }]}>
      <View style={[s.cardGradientOverlay, { backgroundColor: meta.to }]} />
      <View style={s.cardTopRow}>
        <View style={s.cardChip} />
        <Text style={s.cardNetworkLabel}>{meta.label}</Text>
      </View>
      <Text style={s.cardNumber}>{'•••• •••• ••••'} {card.last4}</Text>
      <View style={s.cardBottomRow}>
        <View>
          <Text style={s.cardFieldLabel}>CARD HOLDER</Text>
          <Text style={s.cardFieldValue} numberOfLines={1}>{card.holderName.toUpperCase()}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={s.cardFieldLabel}>EXPIRES</Text>
          <Text style={s.cardFieldValue}>{card.expiryMonth}/{card.expiryYear}</Text>
        </View>
      </View>
      <View style={s.cardTypeBadge}>
        <Text style={s.cardTypeTxt}>{card.type.toUpperCase()}</Text>
      </View>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function PaymentsScreen() {
  const userId = useAuthStore((s) => s.userId);
  const {
    upiIds, cards, loading, codEnabled,
    hydrate, addUPILocally, addCardLocally,
    removeLocally, setDefaultLocally, setLoading, setError,
    toggleCOD,
  } = usePaymentStore();

  // Refresh from server whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (!userId) { setLoading(false); return; }
      setLoading(true);
      fetchPaymentMethods(userId)
        .then(({ upiIds: u, cards: c }) => hydrate(u, c))
        .catch(() => { setError('Could not load payment methods'); setLoading(false); });
    }, [userId])
  );

  // ── UPI state ─────────────────────────────────────────────────────────────
  const [showAddUPI,    setShowAddUPI]    = useState(false);
  const [upiInput,      setUpiInput]      = useState('');
  const [upiErr,        setUpiErr]        = useState('');
  const [upiSaving,     setUpiSaving]     = useState(false);
  const [upiValidating, setUpiValidating] = useState(false);
  const [upiVerified,   setUpiVerified]   = useState<{ name: string | null } | null>(null);

  // ── Card state ────────────────────────────────────────────────────────────
  const [showAddCard,    setShowAddCard]    = useState(false);
  const [cardNumber,     setCardNumber]     = useState('');
  const [cardExpiry,     setCardExpiry]     = useState('');
  const [cardHolder,     setCardHolder]     = useState('');
  const [cvv,            setCvv]            = useState('');
  const [cardType,       setCardType]       = useState<CardType>('debit');
  const [cardErr,        setCardErr]        = useState('');
  const [cardSaving,     setCardSaving]     = useState(false);
  const [cardVerified,   setCardVerified]   = useState<{ last4: string; network: string } | null>(null);

  // ── UPI handlers ──────────────────────────────────────────────────────────

  function resetUPIForm() {
    setShowAddUPI(false); setUpiInput(''); setUpiErr('');
    setUpiVerified(null); setUpiValidating(false);
  }

  function handleUPIInput(v: string) {
    setUpiInput(v);
    setUpiErr('');
    setUpiVerified(null); // reset verification whenever input changes
  }

  async function handleVerifyUPI() {
    const val = upiInput.trim().toLowerCase();
    const parts = val.split('@');
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      setUpiErr('Enter a valid UPI ID, e.g. name@okaxis'); return;
    }
    if (upiIds.some((u) => u.upiId === val)) {
      setUpiErr('This UPI ID is already saved'); return;
    }
    setUpiValidating(true); setUpiErr('');
    try {
      const result = await validateUPIId(val);
      setUpiVerified({ name: result.name });
    } catch (e) {
      setUpiErr(e instanceof Error ? e.message : 'UPI ID not found or inactive');
      setUpiVerified(null);
    } finally {
      setUpiValidating(false);
    }
  }

  async function handleAddUPI() {
    if (!userId || !upiVerified) return;
    const val = upiInput.trim().toLowerCase();
    setUpiSaving(true);
    try {
      const saved = await addUPIToServer(userId, val, detectUPIApp(val));
      addUPILocally(saved);
      resetUPIForm();
    } catch (e) {
      setUpiErr(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setUpiSaving(false);
    }
  }

  async function handleSetDefaultUPI(id: string) {
    if (!userId) return;
    setDefaultLocally(id, 'upi');
    await setDefaultPMOnServer(userId, id).catch(() => {});
  }

  function confirmRemoveUPI(id: string, upiId: string) {
    Alert.alert('Remove UPI ID', `Remove ${upiId}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          removeLocally(id);
          if (userId) await deletePMFromServer(userId, id).catch(() => {});
        },
      },
    ]);
  }

  // ── Card validation utilities (all client-side — card number never leaves device) ──

  function luhn(number: string): boolean {
    const digits = number.replace(/\D/g, '');
    let sum = 0;
    let isEven = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let d = parseInt(digits[i]!, 10);
      if (isEven) { d *= 2; if (d > 9) d -= 9; }
      sum += d;
      isEven = !isEven;
    }
    return digits.length > 0 && sum % 10 === 0;
  }

  function isExpiryValid(mm: string, yy: string): boolean {
    const month = parseInt(mm, 10);
    const year  = 2000 + parseInt(yy, 10);
    const now   = new Date();
    if (year < now.getFullYear()) return false;
    if (year === now.getFullYear() && month < now.getMonth() + 1) return false;
    return true;
  }

  // ── Card handlers ─────────────────────────────────────────────────────────

  function formatCardInput(raw: string) {
    const network = detectCardNetwork(raw.replace(/\D/g, '')[0] ?? '');
    const maxLen  = network === 'amex' ? 15 : 16;
    return raw.replace(/\D/g, '').slice(0, maxLen).replace(/(.{4})/g, '$1 ').trim();
  }

  function formatExpiry(raw: string) {
    const d = raw.replace(/\D/g, '').slice(0, 4);
    return d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d;
  }

  function resetCardForm() {
    setShowAddCard(false);
    setCardNumber(''); setCardExpiry(''); setCardHolder(''); setCvv('');
    setCardErr(''); setCardVerified(null);
  }

  function handleCardInput(v: string) {
    setCardNumber(formatCardInput(v));
    setCardErr('');
    setCardVerified(null);
  }

  function handleVerifyCard() {
    const digits  = cardNumber.replace(/\s/g, '');
    const network = detectCardNetwork(digits[0] ?? '');
    const expLen  = network === 'amex' ? 15 : 16;

    if (digits.length !== expLen) {
      setCardErr(`Card number must be ${expLen} digits`); return;
    }
    if (!luhn(digits)) {
      setCardErr('Invalid card number — please check and re-enter'); return;
    }

    const [mm, yy] = cardExpiry.split('/');
    if (!mm || mm.length !== 2 || !yy || yy.length !== 2) {
      setCardErr('Enter expiry as MM/YY'); return;
    }
    if (!isExpiryValid(mm, yy)) {
      setCardErr('This card has expired'); return;
    }

    const cvvLen = network === 'amex' ? 4 : 3;
    if (cvv.replace(/\D/g, '').length !== cvvLen) {
      setCardErr(`CVV must be ${cvvLen} digits for ${network === 'amex' ? 'Amex' : 'this card'}`); return;
    }

    if (!cardHolder.trim()) { setCardErr('Enter cardholder name'); return; }

    setCardErr('');
    setCardVerified({ last4: digits.slice(-4), network });
  }

  async function handleSaveCard() {
    if (!userId || !cardVerified) return;
    const digits   = cardNumber.replace(/\s/g, '');
    const [mm, yy] = cardExpiry.split('/') as [string, string];
    setCardSaving(true);
    try {
      const saved = await addCardToServer(userId, {
        last4:       cardVerified.last4,
        network:     detectCardNetwork(digits[0] ?? ''),
        type:        cardType,
        expiryMonth: mm,
        expiryYear:  yy,
        holderName:  cardHolder.trim(),
      });
      addCardLocally(saved);
      resetCardForm();
    } catch (e) {
      setCardErr(e instanceof Error ? e.message : 'Failed to save card');
    } finally {
      setCardSaving(false);
    }
  }

  async function handleSetDefaultCard(id: string) {
    if (!userId) return;
    setDefaultLocally(id, 'card');
    await setDefaultPMOnServer(userId, id).catch(() => {});
  }

  function confirmRemoveCard(id: string, last4: string) {
    Alert.alert('Remove Card', `Remove card ending in ${last4}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          removeLocally(id);
          if (userId) await deletePMFromServer(userId, id).catch(() => {});
        },
      },
    ]);
  }

  // ── Render ────────────────────────────────────────────────────────────────

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
          <Text style={s.headerTitle}>Payment Methods</Text>
          <View style={{ width: 64 }} />
        </SafeAreaView>

        {loading && upiIds.length === 0 && cards.length === 0 ? (
          <View style={s.loadingWrap}>
            <ActivityIndicator size="large" color={BRAND} />
            <Text style={s.loadingTxt}>Loading your payment methods…</Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={s.content}
          >
            {/* ── UPI ───────────────────────────────────────────────────── */}
            <View>
              <SectionHeader
                label="UPI IDs"
                action={showAddUPI ? undefined : '+ Add'}
                onAction={() => { setShowAddUPI(true); setUpiErr(''); }}
              />
              <View style={s.card}>
                {upiIds.length === 0 && !showAddUPI && (
                  <View style={s.emptyState}>
                    <Text style={s.emptyIcon}>₹</Text>
                    <Text style={s.emptyTitle}>No UPI IDs saved</Text>
                    <Text style={s.emptySub}>Add your GPay, PhonePe or Paytm UPI ID</Text>
                  </View>
                )}

                {upiIds.map((upi, i) => {
                  const meta = UPI_META[upi.appName];
                  return (
                    <View key={upi.id}>
                      {i > 0 && <View style={s.divider} />}
                      <View style={s.upiRow}>
                        <View style={[s.upiCircle, { backgroundColor: meta.color }]}>
                          <Text style={s.upiCircleTxt}>{meta.short}</Text>
                        </View>
                        <View style={{ flex: 1, gap: 2 }}>
                          <Text style={s.upiId}>{upi.upiId}</Text>
                          <Text style={s.upiApp}>{upi.appName}</Text>
                        </View>
                        {upi.isDefault ? (
                          <View style={s.defaultBadge}>
                            <Text style={s.defaultBadgeTxt}>Default</Text>
                          </View>
                        ) : (
                          <Pressable
                            onPress={() => handleSetDefaultUPI(upi.id)}
                            style={({ pressed }) => [s.setDefaultBtn, pressed && { opacity: 0.7 }]}
                          >
                            <Text style={s.setDefaultTxt}>Set Default</Text>
                          </Pressable>
                        )}
                        <Pressable
                          onPress={() => confirmRemoveUPI(upi.id, upi.upiId)}
                          hitSlop={8}
                          style={({ pressed }) => [s.deleteBtn, pressed && { opacity: 0.6 }]}
                        >
                          <Text style={s.deleteTxt}>✕</Text>
                        </Pressable>
                      </View>
                    </View>
                  );
                })}

                {showAddUPI && (
                  <View>
                    {upiIds.length > 0 && <View style={s.divider} />}
                    <View style={s.addForm}>
                      <TextInput
                        style={[s.textInput, upiErr ? s.inputError : upiVerified ? s.inputVerified : null]}
                        value={upiInput}
                        onChangeText={handleUPIInput}
                        placeholder="yourname@okaxis"
                        placeholderTextColor="#9ca3af"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        autoFocus
                        returnKeyType="done"
                        editable={!upiVerified}
                        onSubmitEditing={upiVerified ? handleAddUPI : handleVerifyUPI}
                      />

                      {/* Verified name badge */}
                      {upiVerified && (
                        <View style={s.verifiedBadge}>
                          <Text style={s.verifiedIcon}>✓</Text>
                          <Text style={s.verifiedText}>
                            {upiVerified.name ? `Verified: ${upiVerified.name}` : 'Valid UPI handle confirmed'}
                          </Text>
                          <Pressable onPress={() => { setUpiVerified(null); }} hitSlop={8}>
                            <Text style={s.verifiedEdit}>Edit</Text>
                          </Pressable>
                        </View>
                      )}

                      {upiErr ? <Text style={s.inputErrTxt}>{upiErr}</Text> : null}

                      <View style={s.formActions}>
                        <Pressable
                          style={({ pressed }) => [s.cancelBtn, pressed && { opacity: 0.7 }]}
                          onPress={resetUPIForm}
                        >
                          <Text style={s.cancelTxt}>Cancel</Text>
                        </Pressable>

                        {!upiVerified ? (
                          <Pressable
                            style={({ pressed }) => [s.verifyBtn, (pressed || upiValidating) && { opacity: 0.8 }]}
                            onPress={handleVerifyUPI}
                            disabled={upiValidating}
                          >
                            {upiValidating
                              ? <ActivityIndicator color="#fff" size="small" />
                              : <Text style={s.confirmTxt}>Verify UPI</Text>
                            }
                          </Pressable>
                        ) : (
                          <Pressable
                            style={({ pressed }) => [s.confirmBtn, (pressed || upiSaving) && { opacity: 0.8 }]}
                            onPress={handleAddUPI}
                            disabled={upiSaving}
                          >
                            {upiSaving
                              ? <ActivityIndicator color="#fff" size="small" />
                              : <Text style={s.confirmTxt}>Save UPI ID</Text>
                            }
                          </Pressable>
                        )}
                      </View>
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* ── Cards ─────────────────────────────────────────────────── */}
            <View>
              <SectionHeader
                label="Credit & Debit Cards"
                action={showAddCard ? undefined : '+ Add'}
                onAction={() => { setShowAddCard(true); setCardErr(''); }}
              />
              <View style={s.card}>
                {cards.length === 0 && !showAddCard && (
                  <View style={s.emptyState}>
                    <Text style={s.emptyIcon}>💳</Text>
                    <Text style={s.emptyTitle}>No cards saved</Text>
                    <Text style={s.emptySub}>Add Visa, Mastercard or RuPay cards</Text>
                  </View>
                )}

                {cards.map((card, i) => (
                  <View key={card.id}>
                    {i > 0 && <View style={[s.divider, { marginVertical: 4 }]} />}
                    <View style={s.cardWrap}>
                      <CardVisual card={card} />
                      <View style={s.cardActions}>
                        {card.isDefault ? (
                          <View style={s.defaultBadge}>
                            <Text style={s.defaultBadgeTxt}>Default</Text>
                          </View>
                        ) : (
                          <Pressable
                            onPress={() => handleSetDefaultCard(card.id)}
                            style={({ pressed }) => [s.setDefaultBtn, pressed && { opacity: 0.7 }]}
                          >
                            <Text style={s.setDefaultTxt}>Set Default</Text>
                          </Pressable>
                        )}
                        <Pressable
                          onPress={() => confirmRemoveCard(card.id, card.last4)}
                          style={({ pressed }) => [s.deleteCardBtn, pressed && { opacity: 0.7 }]}
                        >
                          <Text style={s.deleteCardTxt}>🗑 Remove</Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                ))}

                {showAddCard && (
                  <View>
                    {cards.length > 0 && <View style={[s.divider, { marginVertical: 4 }]} />}
                    <View style={s.addForm}>
                      <Text style={s.addFormTitle}>Add New Card</Text>

                      <View style={s.cardTypeRow}>
                        {(['debit', 'credit'] as CardType[]).map((t) => (
                          <Pressable
                            key={t}
                            onPress={() => { setCardType(t); setCardVerified(null); }}
                            style={({ pressed }) => [
                              s.cardTypePill,
                              cardType === t && s.cardTypePillActive,
                              pressed && { opacity: 0.8 },
                            ]}
                          >
                            <Text style={[s.cardTypePillTxt, cardType === t && s.cardTypePillTxtActive]}>
                              {t === 'debit' ? '🏦 Debit' : '💳 Credit'}
                            </Text>
                          </Pressable>
                        ))}
                      </View>

                      <View style={s.fieldGroup}>
                        <View style={s.fieldWrap}>
                          <Text style={s.fieldLabel}>Card Number</Text>
                          <TextInput
                            style={[s.fieldInput, cardErr && !cardVerified ? s.inputError : cardVerified ? s.inputVerified : null]}
                            value={cardNumber}
                            onChangeText={handleCardInput}
                            placeholder="•••• •••• •••• ••••"
                            placeholderTextColor="#9ca3af"
                            keyboardType="numeric"
                            maxLength={19}
                            editable={!cardVerified}
                            autoFocus
                          />
                        </View>

                        <View style={s.fieldRow}>
                          <View style={[s.fieldWrap, { flex: 1 }]}>
                            <Text style={s.fieldLabel}>Expiry (MM/YY)</Text>
                            <TextInput
                              style={[s.fieldInput, cardVerified ? s.inputVerified : null]}
                              value={cardExpiry}
                              onChangeText={(v) => { setCardExpiry(formatExpiry(v)); setCardVerified(null); setCardErr(''); }}
                              placeholder="MM/YY"
                              placeholderTextColor="#9ca3af"
                              keyboardType="numeric"
                              maxLength={5}
                              editable={!cardVerified}
                            />
                          </View>
                          <View style={{ width: 14 }} />
                          <View style={[s.fieldWrap, { flex: 1 }]}>
                            <Text style={s.fieldLabel}>CVV</Text>
                            <TextInput
                              style={[s.fieldInput, cardVerified ? s.inputVerified : null]}
                              value={cvv}
                              onChangeText={(v) => { setCvv(v.replace(/\D/g, '').slice(0, 4)); setCardVerified(null); setCardErr(''); }}
                              placeholder="•••"
                              placeholderTextColor="#9ca3af"
                              keyboardType="numeric"
                              maxLength={4}
                              secureTextEntry
                              editable={!cardVerified}
                            />
                          </View>
                        </View>

                        <View style={s.fieldWrap}>
                          <Text style={s.fieldLabel}>Cardholder Name</Text>
                          <TextInput
                            style={[s.fieldInput, cardVerified ? s.inputVerified : null]}
                            value={cardHolder}
                            onChangeText={(v) => { setCardHolder(v); setCardVerified(null); setCardErr(''); }}
                            placeholder="Name on card"
                            placeholderTextColor="#9ca3af"
                            autoCapitalize="words"
                            returnKeyType="done"
                            editable={!cardVerified}
                            onSubmitEditing={cardVerified ? handleSaveCard : handleVerifyCard}
                          />
                        </View>
                      </View>

                      {/* Verified card badge */}
                      {cardVerified && (
                        <View style={s.verifiedBadge}>
                          <Text style={s.verifiedIcon}>✓</Text>
                          <Text style={s.verifiedText}>
                            Card ending {cardVerified.last4} passed all checks
                          </Text>
                          <Pressable onPress={() => setCardVerified(null)} hitSlop={8}>
                            <Text style={s.verifiedEdit}>Edit</Text>
                          </Pressable>
                        </View>
                      )}

                      {cardErr ? <Text style={s.inputErrTxt}>{cardErr}</Text> : null}

                      <View style={s.formActions}>
                        <Pressable
                          style={({ pressed }) => [s.cancelBtn, pressed && { opacity: 0.7 }]}
                          onPress={resetCardForm}
                        >
                          <Text style={s.cancelTxt}>Cancel</Text>
                        </Pressable>

                        {!cardVerified ? (
                          <Pressable
                            style={({ pressed }) => [s.verifyBtn, pressed && { opacity: 0.8 }]}
                            onPress={handleVerifyCard}
                          >
                            <Text style={s.confirmTxt}>Verify Card</Text>
                          </Pressable>
                        ) : (
                          <Pressable
                            style={({ pressed }) => [s.confirmBtn, (pressed || cardSaving) && { opacity: 0.8 }]}
                            onPress={handleSaveCard}
                            disabled={cardSaving}
                          >
                            {cardSaving
                              ? <ActivityIndicator color="#fff" size="small" />
                              : <Text style={s.confirmTxt}>Save Card</Text>
                            }
                          </Pressable>
                        )}
                      </View>
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* ── COD ───────────────────────────────────────────────────── */}
            <View>
              <SectionHeader label="Cash on Delivery" />
              <View style={s.card}>
                <View style={s.codRow}>
                  <View style={s.codIconWrap}>
                    <Text style={{ fontSize: 22 }}>💵</Text>
                  </View>
                  <View style={{ flex: 1, gap: 3 }}>
                    <Text style={s.codTitle}>Enable COD</Text>
                    <Text style={s.codSub}>Available for orders up to ₹5,000</Text>
                  </View>
                  <Switch
                    value={codEnabled}
                    onValueChange={toggleCOD}
                    trackColor={{ false: '#e5e7eb', true: '#fdc9b0' }}
                    thumbColor={codEnabled ? BRAND : '#9ca3af'}
                  />
                </View>
                {codEnabled && (
                  <View style={s.codNoteBox}>
                    <Text style={s.codNoteIcon}>ℹ️</Text>
                    <Text style={s.codNoteText}>
                      A ₹40 handling fee applies for Cash on Delivery. Keep exact change ready for the delivery partner.
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Security note */}
            <View style={s.securityNote}>
              <Text style={s.securityIcon}>🔒</Text>
              <Text style={s.securityText}>
                Your payment methods are securely stored on our servers. Card numbers are never stored in full — only the last 4 digits and an encrypted gateway token.
              </Text>
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f5f7' },

  header: {
    backgroundColor: BRAND, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 16,
    shadowColor: BRAND, shadowOpacity: 0.3, shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 }, elevation: 6,
  },
  backBtn: { width: 64, paddingVertical: 8 },
  backTxt: { fontSize: 14, color: '#fff', fontWeight: '700' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '800', color: '#fff' },

  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14 },
  loadingTxt:  { fontSize: 13, color: '#6b7280' },

  content: { padding: 16, gap: 20, paddingBottom: 40 },

  sectionHead: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10,
  },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.8 },
  sectionAction: { fontSize: 13, color: BRAND, fontWeight: '700' },

  card: {
    backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: '#f0f0f3',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#f0f0f3', marginHorizontal: 16 },

  emptyState: { alignItems: 'center', paddingVertical: 28, gap: 8 },
  emptyIcon:  { fontSize: 36 },
  emptyTitle: { fontSize: 14, fontWeight: '700', color: '#374151' },
  emptySub:   { fontSize: 12, color: '#9ca3af', textAlign: 'center', paddingHorizontal: 24 },

  // UPI
  upiRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  upiCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  upiCircleTxt: { fontSize: 12, fontWeight: '800', color: '#fff' },
  upiId:  { fontSize: 13, fontWeight: '700', color: '#111827' },
  upiApp: { fontSize: 11, color: '#9ca3af' },

  // Card visual
  cardWrap: { padding: 16, gap: 12 },
  cardVisual: {
    borderRadius: 16, height: 190, padding: 20, justifyContent: 'space-between',
    overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 }, elevation: 8,
  },
  cardGradientOverlay: { ...StyleSheet.absoluteFillObject, opacity: 0.45, borderRadius: 16 },
  cardTopRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardChip:       { width: 36, height: 28, backgroundColor: 'rgba(255,215,0,0.7)', borderRadius: 5, borderWidth: 1, borderColor: 'rgba(255,200,0,0.5)' },
  cardNetworkLabel: { fontSize: 13, fontWeight: '800', color: 'rgba(255,255,255,0.9)', letterSpacing: 1 },
  cardNumber:     { fontSize: 22, fontWeight: '600', color: '#fff', letterSpacing: 3, textAlign: 'center' },
  cardBottomRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  cardFieldLabel: { fontSize: 8, color: 'rgba(255,255,255,0.6)', letterSpacing: 1, fontWeight: '600' },
  cardFieldValue: { fontSize: 13, color: '#fff', fontWeight: '700', marginTop: 2, maxWidth: 160 },
  cardTypeBadge:  {
    position: 'absolute', top: 16, left: 20,
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 4,
    paddingHorizontal: 6, paddingVertical: 2,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  cardTypeTxt: { fontSize: 8, color: 'rgba(255,255,255,0.85)', fontWeight: '700', letterSpacing: 0.5 },

  cardActions:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  deleteCardBtn:  {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 8, borderWidth: 1, borderColor: '#fecaca', backgroundColor: '#fff5f5',
  },
  deleteCardTxt: { fontSize: 12, color: '#ef4444', fontWeight: '700' },

  defaultBadge:    { backgroundColor: '#fce7d9', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#fdc9b0' },
  defaultBadgeTxt: { fontSize: 11, color: BRAND, fontWeight: '700' },
  setDefaultBtn:   { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  setDefaultTxt:   { fontSize: 11, color: '#6b7280', fontWeight: '600' },
  deleteBtn:       { width: 28, height: 28, borderRadius: 14, backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#fecaca' },
  deleteTxt:       { fontSize: 11, color: '#ef4444', fontWeight: '700' },

  // Add forms
  addForm:      { padding: 16, gap: 10 },
  addFormTitle: { fontSize: 13, fontWeight: '700', color: '#374151' },
  textInput:    {
    height: 48, borderWidth: 1.5, borderColor: '#e5e7eb',
    borderRadius: 12, paddingHorizontal: 14, fontSize: 14, color: '#111827', backgroundColor: '#fafafa',
  },
  cardTypeRow: { flexDirection: 'row', gap: 10 },
  cardTypePill: {
    flex: 1, alignItems: 'center', paddingVertical: 10,
    borderRadius: 10, borderWidth: 1.5, borderColor: '#e5e7eb', backgroundColor: '#fafafa',
  },
  cardTypePillActive:    { borderColor: BRAND, backgroundColor: '#fff7f5' },
  cardTypePillTxt:       { fontSize: 12, fontWeight: '700', color: '#6b7280' },
  cardTypePillTxtActive: { color: BRAND },
  fieldGroup: { gap: 12 },
  fieldRow:   { flexDirection: 'row' },
  fieldWrap:  { gap: 4 },
  fieldLabel: { fontSize: 10, fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5 },
  fieldInput: {
    height: 44, borderWidth: 1.5, borderColor: '#e5e7eb',
    borderRadius: 10, paddingHorizontal: 12, fontSize: 14, color: '#111827', backgroundColor: '#fafafa',
  },
  inputError:    { borderColor: '#ef4444' },
  inputVerified: { borderColor: '#16a34a', backgroundColor: '#f0fdf4' },
  inputErrTxt:   { fontSize: 11, color: '#ef4444' },

  verifiedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#f0fdf4', borderRadius: 8, padding: 10,
    borderWidth: 1, borderColor: '#bbf7d0',
  },
  verifiedIcon:  { fontSize: 13, color: '#16a34a', fontWeight: '800' },
  verifiedText:  { flex: 1, fontSize: 12, color: '#166534', fontWeight: '600' },
  verifiedEdit:  { fontSize: 11, color: '#6b7280', fontWeight: '600', textDecorationLine: 'underline' },
  verifyBtn: {
    flex: 2, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#1d4ed8',
    shadowColor: '#1d4ed8', shadowOpacity: 0.3, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 4,
  },
  formActions:  { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelBtn:    { flex: 1, height: 44, borderRadius: 12, borderWidth: 1.5, borderColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fafafa' },
  cancelTxt:    { fontSize: 13, fontWeight: '700', color: '#6b7280' },
  confirmBtn:   {
    flex: 2, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    backgroundColor: BRAND,
    shadowColor: BRAND, shadowOpacity: 0.3, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 4,
  },
  confirmTxt:   { fontSize: 13, fontWeight: '800', color: '#fff' },

  // COD
  codRow:     { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  codIconWrap: { width: 46, height: 46, backgroundColor: '#f0fdf4', borderRadius: 23, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#bbf7d0' },
  codTitle:   { fontSize: 14, fontWeight: '700', color: '#111827' },
  codSub:     { fontSize: 11, color: '#9ca3af' },
  codNoteBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    marginHorizontal: 16, marginBottom: 14,
    backgroundColor: '#fffbeb', borderRadius: 10, padding: 10,
    borderWidth: 1, borderColor: '#fde68a',
  },
  codNoteIcon: { fontSize: 13 },
  codNoteText: { flex: 1, fontSize: 11, color: '#92400e', lineHeight: 16 },

  // Security note
  securityNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#f0fdf4', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#bbf7d0' },
  securityIcon: { fontSize: 14 },
  securityText: { flex: 1, fontSize: 11, color: '#166534', lineHeight: 16 },
});
