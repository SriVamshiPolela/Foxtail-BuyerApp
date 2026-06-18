import { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authService } from '@/services/auth';
import { useAuthStore } from '@/store/auth';
import { applyReferralCode } from '@/services/user';

const BRAND     = '#c75a28';
const WARM_BG   = '#fffaf7';
const OTP_LEN   = 6;

export default function OtpScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const { mode, referralCode } = useLocalSearchParams<{ mode: 'register' | 'login'; referralCode?: string }>();
  const { pendingPhone, login, setPendingPhone } = useAuthStore();

  const [digits,    setDigits]    = useState<string[]>(Array(OTP_LEN).fill(''));
  const [busy,      setBusy]      = useState(false);
  const [countdown, setCountdown] = useState(30);
  const inputs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  function handleDigit(value: string, index: number) {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next  = [...digits];
    next[index] = digit;
    setDigits(next);
    if (digit && index < OTP_LEN - 1) inputs.current[index + 1]?.focus();
    if (next.every(Boolean)) submitOtp(next.join(''));
  }

  function handleKey(key: string, index: number) {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  }

  async function submitOtp(code: string) {
    if (!pendingPhone) {
      Alert.alert('Session expired', 'Please start over.');
      router.replace('/auth/login');
      return;
    }
    setBusy(true);
    try {
      const session = mode === 'register'
        ? await authService.registerVerify(pendingPhone, code)
        : await authService.verifyOtp(pendingPhone, code);
      setPendingPhone('');
      // login() sets isLoggedIn: true → AuthGuard in _layout.tsx
      // detects the change and calls router.replace('/(tabs)') automatically.
      await login(session.token, session.userId, session.userType, session.sessionId);
      // Apply referral code silently — fire-and-forget, never block login
      if (mode === 'register' && referralCode) {
        applyReferralCode(session.userId, referralCode).catch(() => {});
      }
    } catch (err) {
      Alert.alert('Wrong OTP', err instanceof Error ? err.message : 'Please try again.');
      setDigits(Array(OTP_LEN).fill(''));
      inputs.current[0]?.focus();
      setBusy(false);
    }
  }

  async function handleResend() {
    if (!pendingPhone || countdown > 0) return;
    try {
      if (mode === 'login') await authService.requestOtp(pendingPhone);
      setCountdown(30);
      Alert.alert('OTP resent', 'A new code has been sent.');
    } catch (err) {
      Alert.alert('Failed to resend', err instanceof Error ? err.message : 'Please try again.');
    }
  }

  const maskedPhone = pendingPhone
    ? pendingPhone.slice(0, -4).replace(/\d/g, '•') + pendingPhone.slice(-4)
    : '••••••••';

  return (
    <KeyboardAvoidingView
      style={[s.root, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Back */}
      <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/auth/login')} style={s.backBtn} activeOpacity={0.7}>
        <Text style={s.backArrow}>←</Text>
        <Text style={s.backTxt}>Back</Text>
      </TouchableOpacity>

      <View style={s.body}>
        {/* Icon */}
        <View style={s.iconRing}>
          <View style={s.iconCircle}>
            <Text style={{ fontSize: 36 }}>📲</Text>
          </View>
        </View>

        <Text style={s.heading}>Verify your number</Text>
        <Text style={s.sub}>
          We sent a 6-digit code to{'\n'}
          <Text style={s.maskedPhone}>{maskedPhone}</Text>
        </Text>

        {/* Mode badge */}
        <View style={s.modeBadge}>
          <Text style={s.modeBadgeTxt}>
            {mode === 'register' ? '🆕  Registration OTP' : '🔐  Login OTP'}
          </Text>
        </View>

        {/* OTP boxes */}
        <View style={s.otpRow}>
          {digits.map((d, i) => (
            <TextInput
              key={i}
              ref={(el) => { inputs.current[i] = el; }}
              style={[s.otpBox, d ? s.otpBoxFilled : null, busy && s.otpBoxBusy]}
              value={d}
              onChangeText={(v) => handleDigit(v, i)}
              onKeyPress={({ nativeEvent }) => handleKey(nativeEvent.key, i)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              editable={!busy}
            />
          ))}
        </View>

        {busy && (
          <View style={s.verifyRow}>
            <ActivityIndicator color={BRAND} size="small" />
            <Text style={s.verifyTxt}>Verifying…</Text>
          </View>
        )}

        {/* Resend */}
        <TouchableOpacity
          onPress={handleResend}
          disabled={countdown > 0}
          style={s.resendBtn}
          activeOpacity={0.7}
        >
          {countdown > 0 ? (
            <Text style={s.resendDisabled}>
              Resend OTP in <Text style={{ color: BRAND, fontWeight: '700' }}>{countdown}s</Text>
            </Text>
          ) : (
            <Text style={s.resendActive}>Resend OTP</Text>
          )}
        </TouchableOpacity>

        {/* Tip */}
        <View style={s.tipBox}>
          <Text style={s.tipTxt}>
            {mode === 'register'
              ? '💡  If you added an email, check your inbox too — we sent the code there as well'
              : '💡  Didn\'t get it? Check SMS and wait a moment before resending'}
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: WARM_BG },

  backBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 20, paddingVertical: 14,
    alignSelf: 'flex-start',
  },
  backArrow: { fontSize: 20, color: BRAND, fontWeight: '700', lineHeight: 22 },
  backTxt:   { fontSize: 15, color: BRAND, fontWeight: '700' },

  body: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 8,
    alignItems: 'center',
  },

  // Icon
  iconRing: {
    width: 104, height: 104,
    borderRadius: 52,
    backgroundColor: '#ffe4d6',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 28,
    shadowColor: BRAND, shadowOpacity: 0.18, shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 }, elevation: 5,
  },
  iconCircle: {
    width: 80, height: 80,
    borderRadius: 40,
    backgroundColor: '#fff3ef',
    borderWidth: 2, borderColor: '#fdc9b0',
    alignItems: 'center', justifyContent: 'center',
  },

  heading: { fontSize: 26, fontWeight: '800', color: '#111827', marginBottom: 10, textAlign: 'center' },
  sub: { fontSize: 15, color: '#6b7280', textAlign: 'center', lineHeight: 22, marginBottom: 16 },
  maskedPhone: { color: '#111827', fontWeight: '700', fontSize: 16 },

  modeBadge: {
    backgroundColor: '#fff',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7,
    borderWidth: 1, borderColor: '#e8e4df',
    marginBottom: 32,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  modeBadgeTxt: { fontSize: 12, color: '#374151', fontWeight: '600' },

  // OTP boxes
  otpRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  otpBox: {
    width: 48, height: 58,
    borderWidth: 1.5, borderColor: '#e8e4df',
    borderRadius: 14,
    backgroundColor: '#fff',
    textAlign: 'center',
    fontSize: 22, fontWeight: '800', color: '#111827',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  otpBoxFilled: {
    borderColor: BRAND,
    backgroundColor: '#fff8f5',
    shadowColor: BRAND, shadowOpacity: 0.15, shadowRadius: 6, elevation: 3,
  },
  otpBoxBusy: { opacity: 0.55 },

  verifyRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginBottom: 12,
  },
  verifyTxt: { fontSize: 14, color: '#6b7280', fontWeight: '500' },

  // Resend
  resendBtn:    { paddingVertical: 10, paddingHorizontal: 8, marginBottom: 28 },
  resendDisabled:{ fontSize: 14, color: '#9ca3af', fontWeight: '500' },
  resendActive:  { fontSize: 14, color: BRAND, fontWeight: '700' },

  // Tip
  tipBox: {
    backgroundColor: '#fff',
    borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: '#e8e4df',
    width: '100%',
  },
  tipTxt: { fontSize: 12, color: '#6b7280', textAlign: 'center', lineHeight: 18 },
});
