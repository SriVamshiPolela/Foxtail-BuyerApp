import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authService } from '@/services/auth';
import { useAuthStore } from '@/store/auth';
import { useLanguage } from '@/context/language-context';

const BRAND   = '#c75a28';
const WARM_BG = '#fffaf7';

export default function LoginScreen() {
  const { t } = useLanguage();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const setPendingPhone = useAuthStore((s) => s.setPendingPhone);

  const [phone,   setPhone]   = useState('');
  const [busy,    setBusy]    = useState(false);
  const [focused, setFocused] = useState(false);

  async function handleLogin() {
    const trimmed = phone.trim();
    if (!trimmed) { Alert.alert('Phone required', 'Please enter your mobile number.'); return; }
    setBusy(true);
    try {
      await authService.requestOtp(trimmed);
      setPendingPhone(trimmed);
      router.push({ pathname: '/auth/otp', params: { mode: 'login' } });
    } catch (err) {
      Alert.alert('Login failed', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: WARM_BG }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ── Hero ── */}
        <View style={[s.hero, { paddingTop: insets.top + 28 }]}>
          <View style={s.logoWrap}>
            <Text style={{ fontSize: 30 }}>🪔</Text>
          </View>
          <Text style={s.appName}>{t('login_app_name')}</Text>
          <Text style={s.tagline}>{t('login_hero_tagline')}</Text>

          <View style={s.emojiBar}>
            {['🥦', '🧅', '🍅', '🌾', '🫙', '🧵', '🏺', '🌿'].map((e, i) => (
              <View key={i} style={s.emojiChip}>
                <Text style={{ fontSize: 15 }}>{e}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Card ── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>{t('login_welcome')}</Text>
          <Text style={s.cardSub}>{t('login_card_sub')}</Text>

          <View style={s.trustRow}>
            <View style={s.chip}><Text style={s.chipTxt}>🔒  {t('login_secure_otp')}</Text></View>
            <View style={s.chip}><Text style={s.chipTxt}>⚡  {t('login_instant')}</Text></View>
          </View>

          <Text style={s.label}>{t('login_phone_label')}</Text>
          <View style={[s.inputWrap, focused && s.inputActive]}>
            <Text style={s.inputIcon}>📱</Text>
            <TextInput
              style={s.input}
              placeholder={t('login_phone_placeholder')}
              placeholderTextColor="#b0b8c4"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              autoFocus
            />
          </View>

          <TouchableOpacity
            style={[s.primaryBtn, busy && s.btnBusy]}
            onPress={handleLogin}
            disabled={busy}
            activeOpacity={0.88}
          >
            {busy
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.primaryBtnTxt}>{t('login_send_otp')}</Text>
            }
          </TouchableOpacity>

          <View style={s.divRow}>
            <View style={s.divLine} />
            <Text style={s.divTxt}>{t('login_new_to')}</Text>
            <View style={s.divLine} />
          </View>

          <TouchableOpacity
            style={s.ghostBtn}
            onPress={() => router.replace('/auth/register')}
            activeOpacity={0.85}
          >
            <Text style={s.ghostBtnTxt}>{t('login_create_account')}</Text>
          </TouchableOpacity>

          <View style={s.proofRow}>
            <Text style={s.proofTxt}>
              🌟  {t('login_trusted_by')}{' '}
              <Text style={{ color: BRAND, fontWeight: '700' }}>2,340+</Text>
              {' '}{t('login_trusted_suffix')}
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  // Hero
  hero: {
    backgroundColor: BRAND,
    paddingHorizontal: 24,
    paddingBottom: 52,
    alignItems: 'center',
  },
  logoWrap: {
    width: 72, height: 72,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 36,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 }, elevation: 4,
  },
  appName:  { color: '#fff', fontWeight: '800', fontSize: 22, letterSpacing: 0.5, marginBottom: 6 },
  tagline:  { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginBottom: 22, textAlign: 'center' },
  emojiBar: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  emojiChip: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20, width: 40, height: 40,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },

  // Card
  card: {
    backgroundColor: WARM_BG,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -28,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 48,
    minHeight: 520,
  },
  cardTitle: { fontSize: 26, fontWeight: '800', color: '#111827', marginBottom: 6 },
  cardSub:   { fontSize: 14, color: '#6b7280', marginBottom: 22 },

  // Trust chips
  trustRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  chip: {
    backgroundColor: '#fff',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7,
    borderWidth: 1, borderColor: '#ede9e4',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  chipTxt: { fontSize: 12, color: '#374151', fontWeight: '600' },

  // Input
  label: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 8 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14, borderWidth: 1.5, borderColor: '#e8e4df',
    paddingHorizontal: 14, height: 54,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  inputActive: {
    borderColor: BRAND,
    shadowColor: BRAND, shadowOpacity: 0.14, shadowRadius: 6, elevation: 3,
  },
  inputIcon: { fontSize: 18, marginRight: 10 },
  input:     { flex: 1, fontSize: 16, color: '#111827', fontWeight: '500' },

  // Buttons
  primaryBtn: {
    backgroundColor: BRAND,
    borderRadius: 14, height: 54,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 22,
    shadowColor: BRAND, shadowOpacity: 0.45, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 5,
  },
  btnBusy:       { opacity: 0.7 },
  primaryBtnTxt: { color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: 0.4 },

  ghostBtn: {
    borderRadius: 14, height: 54,
    borderWidth: 1.5, borderColor: '#e8e4df',
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  ghostBtnTxt: { color: BRAND, fontWeight: '700', fontSize: 15 },

  // Divider
  divRow:  { flexDirection: 'row', alignItems: 'center', marginVertical: 22, gap: 10 },
  divLine: { flex: 1, height: 1, backgroundColor: '#e8e4df' },
  divTxt:  { fontSize: 12, color: '#9ca3af', fontWeight: '500' },

  // Social proof
  proofRow: { marginTop: 24, alignItems: 'center' },
  proofTxt: { fontSize: 12, color: '#9ca3af', textAlign: 'center', lineHeight: 18 },
});
