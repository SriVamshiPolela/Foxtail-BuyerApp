import { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet,
  Share, Alert, ActivityIndicator, Clipboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { useAuthStore } from '@/store/auth';
import { fetchReferralStats, type ReferralStats } from '@/services/user';

const BRAND  = '#c75a28';
const GREEN  = '#16a34a';
const AMBER  = '#d97706';

function fmt(amount: number) {
  return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30)  return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export default function ReferralScreen() {
  const userId = useAuthStore((s) => s.userId);
  const [stats,   setStats]   = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied,  setCopied]  = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!userId) return;
      setLoading(true);
      fetchReferralStats(userId)
        .then(setStats)
        .catch(() => Alert.alert('Error', 'Could not load referral data.'))
        .finally(() => setLoading(false));
    }, [userId]),
  );

  function handleCopy() {
    if (!stats?.code) return;
    Clipboard.setString(stats.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleShare() {
    if (!stats?.code) return;
    try {
      await Share.share({
        message: `Join HarvestConnect — fresh groceries direct from local farmers! Use my code ${stats.code} when signing up and get ₹50 off your first order. Download: https://harvestconnect.in`,
        title: 'Join HarvestConnect',
      });
    } catch {
      // user dismissed share sheet
    }
  }

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.backBtn} hitSlop={8}>
          <Text style={s.backArrow}>←</Text>
        </Pressable>
        <Text style={s.headerTitle}>Refer & Earn</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Hero card */}
        <View style={s.hero}>
          <Text style={s.heroEmoji}>🎁</Text>
          <Text style={s.heroTitle}>Invite friends,{'\n'}earn rewards</Text>
          <Text style={s.heroSub}>
            You get <Text style={s.heroHighlight}>{fmt(100)}</Text> for every friend who places their first order.
            {'\n'}They get <Text style={s.heroHighlight}>{fmt(50)}</Text> off their first order instantly.
          </Text>
        </View>

        {/* Code card */}
        {loading ? (
          <View style={s.loadingBox}>
            <ActivityIndicator color={BRAND} />
          </View>
        ) : stats ? (
          <>
            <View style={s.codeCard}>
              <Text style={s.codeLbl}>Your referral code</Text>
              <View style={s.codeRow}>
                <Text style={s.code}>{stats.code}</Text>
                <Pressable
                  onPress={handleCopy}
                  style={({ pressed }) => [s.copyBtn, pressed && { opacity: 0.75 }]}
                >
                  <Text style={s.copyBtnTxt}>{copied ? '✓ Copied' : 'Copy'}</Text>
                </Pressable>
              </View>
              <Pressable
                onPress={handleShare}
                style={({ pressed }) => [s.shareBtn, pressed && { opacity: 0.85 }]}
              >
                <Text style={s.shareBtnTxt}>Share with friends  ↗</Text>
              </Pressable>
            </View>

            {/* Stats */}
            <View style={s.statsRow}>
              <View style={s.statBox}>
                <Text style={s.statVal}>{stats.totalReferrals}</Text>
                <Text style={s.statLbl}>Friends Invited</Text>
              </View>
              <View style={s.statDivider} />
              <View style={s.statBox}>
                <Text style={s.statVal}>{stats.rewardedReferrals}</Text>
                <Text style={s.statLbl}>Orders Placed</Text>
              </View>
              <View style={s.statDivider} />
              <View style={s.statBox}>
                <Text style={[s.statVal, { color: GREEN }]}>{fmt(stats.totalEarnedRupees)}</Text>
                <Text style={s.statLbl}>Total Earned</Text>
              </View>
            </View>

            {/* Referral history */}
            {stats.referrals.length > 0 && (
              <View style={s.section}>
                <Text style={s.sectionTitle}>Your referrals</Text>
                {stats.referrals.map((r) => (
                  <View key={r.id} style={s.referralRow}>
                    <View style={[s.statusDot, { backgroundColor: r.status === 'rewarded' ? GREEN : AMBER }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.referralDesc}>
                        {r.status === 'rewarded' ? 'Friend placed first order' : 'Friend signed up — awaiting first order'}
                      </Text>
                      <Text style={s.referralDate}>{timeAgo(r.createdAt)}</Text>
                    </View>
                    <Text style={[s.referralAmt, { color: r.status === 'rewarded' ? GREEN : '#9ca3af' }]}>
                      {r.status === 'rewarded' ? `+${fmt(r.rewardRupees)}` : 'Pending'}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </>
        ) : null}

        {/* How it works */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>How it works</Text>
          {[
            { step: '1', icon: '📤', title: 'Share your code', desc: 'Send your unique code to friends via WhatsApp, SMS, or any app.' },
            { step: '2', icon: '🆕', title: 'Friend signs up', desc: 'They enter your code at registration and get ₹50 off instantly.' },
            { step: '3', icon: '📦', title: 'Friend places first order', desc: 'Once their first order is delivered, ₹100 is credited to your Harvest Wallet.' },
          ].map((item) => (
            <View key={item.step} style={s.howRow}>
              <View style={s.howStep}>
                <Text style={s.howStepTxt}>{item.step}</Text>
              </View>
              <View style={s.howIconCircle}>
                <Text style={{ fontSize: 20 }}>{item.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.howTitle}>{item.title}</Text>
                <Text style={s.howDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Terms */}
        <View style={s.termsBox}>
          <Text style={s.termsTxt}>
            • Referral reward credited after friend's first delivered order{'\n'}
            • Friend must be a new user (never registered before){'\n'}
            • One referral code per account{'\n'}
            • Maximum 10 referrals per month per user
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f5f7' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#f0f0f3',
  },
  backBtn:     { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backArrow:   { fontSize: 22, color: BRAND, fontWeight: '700' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },

  hero: {
    backgroundColor: BRAND,
    paddingHorizontal: 24, paddingTop: 32, paddingBottom: 40,
    alignItems: 'center',
  },
  heroEmoji: { fontSize: 48, marginBottom: 12 },
  heroTitle: { fontSize: 26, fontWeight: '900', color: '#fff', textAlign: 'center', marginBottom: 12, lineHeight: 32 },
  heroSub:   { fontSize: 14, color: 'rgba(255,255,255,0.88)', textAlign: 'center', lineHeight: 22 },
  heroHighlight: { fontWeight: '800', color: '#fff', fontSize: 15 },

  loadingBox: { height: 120, alignItems: 'center', justifyContent: 'center' },

  codeCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  codeLbl: { fontSize: 11, fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  codeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  code:    { fontSize: 32, fontWeight: '900', color: '#111827', letterSpacing: 6 },
  copyBtn: {
    backgroundColor: '#f3f4f6', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  copyBtnTxt: { fontSize: 12, fontWeight: '700', color: '#374151' },
  shareBtn: {
    backgroundColor: BRAND, borderRadius: 14, height: 50,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: BRAND, shadowOpacity: 0.35, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 4,
  },
  shareBtnTxt: { fontSize: 15, fontWeight: '800', color: '#fff' },

  statsRow: {
    flexDirection: 'row', backgroundColor: '#fff',
    marginHorizontal: 16, marginTop: 12, borderRadius: 16,
    padding: 16, justifyContent: 'space-around',
    borderWidth: 1, borderColor: '#f0f0f3',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  statBox:     { alignItems: 'center', flex: 1 },
  statVal:     { fontSize: 20, fontWeight: '900', color: '#111827' },
  statLbl:     { fontSize: 10, color: '#9ca3af', fontWeight: '600', marginTop: 3 },
  statDivider: { width: 1, backgroundColor: '#f0f0f3' },

  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },

  referralRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 6,
    borderWidth: 1, borderColor: '#f0f0f3',
  },
  statusDot:    { width: 8, height: 8, borderRadius: 4 },
  referralDesc: { fontSize: 13, fontWeight: '600', color: '#111827' },
  referralDate: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  referralAmt:  { fontSize: 13, fontWeight: '800' },

  howRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: '#f0f0f3',
    shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  howStep: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: BRAND, alignItems: 'center', justifyContent: 'center',
    marginTop: 2,
  },
  howStepTxt:   { fontSize: 11, fontWeight: '900', color: '#fff' },
  howIconCircle:{ width: 40, height: 40, backgroundColor: '#fff7f5', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  howTitle:     { fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 2 },
  howDesc:      { fontSize: 11, color: '#6b7280', lineHeight: 16 },

  termsBox: {
    marginHorizontal: 16, marginTop: 16,
    backgroundColor: '#f9fafb', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  termsTxt: { fontSize: 11, color: '#6b7280', lineHeight: 18 },
});
