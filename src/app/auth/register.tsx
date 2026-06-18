import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authService } from '@/services/auth';
import { useAuthStore } from '@/store/auth';

const BRAND   = '#c75a28';
const WARM_BG = '#fffaf7';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const setPendingPhone = useAuthStore((s) => s.setPendingPhone);

  const [name,         setName]         = useState('');
  const [phone,        setPhone]        = useState('');
  const [email,        setEmail]        = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [busy,         setBusy]         = useState(false);
  const [focused,      setFocused]      = useState<'name' | 'phone' | 'email' | 'referral' | null>(null);

  async function handleRegister() {
    const tName  = name.trim();
    const tPhone = phone.trim();
    const tEmail = email.trim();
    if (!tName)  { Alert.alert('Name required',  'Please enter your full name.');     return; }
    if (!tPhone) { Alert.alert('Phone required', 'Please enter your mobile number.'); return; }

    setBusy(true);
    try {
      await authService.register(tName, tPhone, tEmail || undefined);
      setPendingPhone(tPhone);
      router.push({ pathname: '/auth/otp', params: { mode: 'register', referralCode: referralCode.trim().toUpperCase() || '' } });
    } catch (err) {
      Alert.alert('Registration failed', err instanceof Error ? err.message : 'Please try again.');
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
        <View style={[s.hero, { paddingTop: insets.top + 20 }]}>
          <View style={s.logoWrap}>
            <Text style={{ fontSize: 30 }}>🪔</Text>
          </View>
          <Text style={s.appName}>Harvest Connect</Text>
          <Text style={s.tagline}>Connect with local farmers & artisans</Text>

          <View style={s.benefitRow}>
            {[
              { icon: '✅', label: 'Free to join' },
              { icon: '🌿', label: 'Verified local' },
              { icon: '🚚', label: 'Fast delivery' },
            ].map(({ icon, label }) => (
              <View key={label} style={s.benefitChip}>
                <Text style={{ fontSize: 13 }}>{icon}</Text>
                <Text style={s.benefitLabel}>{label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Card ── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Create account</Text>
          <Text style={s.cardSub}>Join 2,340+ buyers. Takes less than a minute.</Text>

          {/* Name */}
          <Text style={s.label}>Full name</Text>
          <View style={[s.inputWrap, focused === 'name' && s.inputActive]}>
            <Text style={s.inputIcon}>👤</Text>
            <TextInput
              style={s.input}
              placeholder="Enter your full name"
              placeholderTextColor="#b0b8c4"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              returnKeyType="next"
              onFocus={() => setFocused('name')}
              onBlur={() => setFocused(null)}
            />
          </View>

          {/* Phone */}
          <Text style={[s.label, { marginTop: 16 }]}>Mobile number</Text>
          <View style={[s.inputWrap, focused === 'phone' && s.inputActive]}>
            <Text style={s.inputIcon}>📱</Text>
            <TextInput
              style={s.input}
              placeholder="+91 XXXXX XXXXX"
              placeholderTextColor="#b0b8c4"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              returnKeyType="next"
              onFocus={() => setFocused('phone')}
              onBlur={() => setFocused(null)}
            />
          </View>

          {/* Email */}
          <View style={s.emailLabelRow}>
            <Text style={[s.label, { marginTop: 16 }]}>Email</Text>
            <View style={s.optionalBadge}>
              <Text style={s.optionalTxt}>optional · for OTP delivery</Text>
            </View>
          </View>
          <View style={[s.inputWrap, focused === 'email' && s.inputActive]}>
            <Text style={s.inputIcon}>✉️</Text>
            <TextInput
              style={s.input}
              placeholder="you@example.com"
              placeholderTextColor="#b0b8c4"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={handleRegister}
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused(null)}
            />
          </View>

          {/* Referral code */}
          <View style={s.emailLabelRow}>
            <Text style={[s.label, { marginTop: 16 }]}>Referral code</Text>
            <View style={s.optionalBadge}>
              <Text style={s.optionalTxt}>optional · get ₹50 off first order</Text>
            </View>
          </View>
          <View style={[s.inputWrap, focused === 'referral' && s.inputActive]}>
            <Text style={s.inputIcon}>🎁</Text>
            <TextInput
              style={[s.input, { textTransform: 'uppercase' }]}
              placeholder="e.g. FARM4T"
              placeholderTextColor="#b0b8c4"
              value={referralCode}
              onChangeText={(v) => setReferralCode(v.toUpperCase())}
              autoCapitalize="characters"
              returnKeyType="done"
              onSubmitEditing={handleRegister}
              onFocus={() => setFocused('referral')}
              onBlur={() => setFocused(null)}
            />
          </View>

          <TouchableOpacity
            style={[s.primaryBtn, busy && s.btnBusy]}
            onPress={handleRegister}
            disabled={busy}
            activeOpacity={0.88}
          >
            {busy
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.primaryBtnTxt}>Create Account  →</Text>
            }
          </TouchableOpacity>

          <View style={s.noteBox}>
            <Text style={s.noteTxt}>
              📲  We'll send a 6-digit OTP to verify your mobile number
            </Text>
          </View>

          <View style={s.divRow}>
            <View style={s.divLine} />
            <Text style={s.divTxt}>Already a member?</Text>
            <View style={s.divLine} />
          </View>

          <TouchableOpacity
            style={s.ghostBtn}
            onPress={() => router.replace('/auth/login')}
            activeOpacity={0.85}
          >
            <Text style={s.ghostBtnTxt}>Log in instead</Text>
          </TouchableOpacity>
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
    paddingBottom: 48,
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
  appName: { color: '#fff', fontWeight: '800', fontSize: 22, letterSpacing: 0.5, marginBottom: 6 },
  tagline: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginBottom: 20, textAlign: 'center' },

  benefitRow: { flexDirection: 'row', gap: 8 },
  benefitChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 20, paddingHorizontal: 11, paddingVertical: 7,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  benefitLabel: { color: '#fff', fontSize: 11, fontWeight: '600' },

  // Card
  card: {
    backgroundColor: WARM_BG,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -28,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 48,
    minHeight: 560,
  },
  cardTitle: { fontSize: 26, fontWeight: '800', color: '#111827', marginBottom: 6 },
  cardSub:   { fontSize: 14, color: '#6b7280', marginBottom: 22 },

  // Inputs
  label: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 8 },
  emailLabelRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 16 },
  optionalBadge: {
    backgroundColor: '#f3f4f6', borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 3,
    marginBottom: 8,
  },
  optionalTxt: { fontSize: 10, color: '#9ca3af', fontWeight: '500' },

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

  // CTA
  primaryBtn: {
    backgroundColor: BRAND,
    borderRadius: 14, height: 54,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 26,
    shadowColor: BRAND, shadowOpacity: 0.45, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 5,
  },
  btnBusy:       { opacity: 0.7 },
  primaryBtnTxt: { color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: 0.4 },

  noteBox: {
    marginTop: 14,
    backgroundColor: '#fff',
    borderRadius: 12, padding: 13,
    borderWidth: 1, borderColor: '#e8e4df',
  },
  noteTxt: { fontSize: 12, color: '#6b7280', textAlign: 'center' },

  divRow:  { flexDirection: 'row', alignItems: 'center', marginVertical: 22, gap: 10 },
  divLine: { flex: 1, height: 1, backgroundColor: '#e8e4df' },
  divTxt:  { fontSize: 12, color: '#9ca3af', fontWeight: '500' },

  ghostBtn: {
    borderRadius: 14, height: 54,
    borderWidth: 1.5, borderColor: '#e8e4df',
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  ghostBtnTxt: { color: BRAND, fontWeight: '700', fontSize: 15 },
});
