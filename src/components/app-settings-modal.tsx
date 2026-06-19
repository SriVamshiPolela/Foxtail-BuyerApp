import { useState, useEffect } from 'react';
import {
  Modal, View, Text, Pressable, StyleSheet, ScrollView, Switch, Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage, type Language } from '@/context/language-context';
import { useThemePreference, type ThemePreference } from '@/context/theme-context';
import { useAppColors, type AppColors } from '@/hooks/use-app-colors';
import Constants from 'expo-constants';

const NOTIF_KEYS = [
  { key: 'order_updates', labelKey: 'notif_order_updates', descKey: 'notif_order_updates_desc' },
  { key: 'price_drops',   labelKey: 'notif_price_drops',   descKey: 'notif_price_drops_desc' },
  { key: 'new_arrivals',  labelKey: 'notif_new_arrivals',  descKey: 'notif_new_arrivals_desc' },
  { key: 'promos',        labelKey: 'notif_promos',        descKey: 'notif_promos_desc' },
] as const;

const LANGUAGES: { value: Language; native: string }[] = [
  { value: 'en', native: 'English' },
  { value: 'te', native: 'తెలుగు' },
  { value: 'hi', native: 'हिन्दी' },
];

const THEME_OPTIONS: { value: ThemePreference; icon: string; labelKey: 'theme_light' | 'theme_dark' | 'theme_system' }[] = [
  { value: 'light',  icon: '☀️', labelKey: 'theme_light' },
  { value: 'dark',   icon: '🌙', labelKey: 'theme_dark' },
  { value: 'system', icon: '⚙️', labelKey: 'theme_system' },
];

const SHOP_PREFS_KEY = '@hc_buyer_shop_prefs';
const NOTIFS_KEY     = '@hc_buyer_notifs';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function AppSettingsModal({ visible, onClose }: Props) {
  const { t, language, setLanguage } = useLanguage();
  const { preference, setPreference } = useThemePreference();
  const c = useAppColors();
  const s = makeStyles(c);

  const [notifs, setNotifs] = useState({
    order_updates: true,
    price_drops:   true,
    new_arrivals:  true,
    promos:        false,
  });

  const [shopPrefs, setShopPrefs] = useState({
    walletAuto:   true,
    gstInclusive: false,
  });

  useEffect(() => {
    AsyncStorage.multiGet([NOTIFS_KEY, SHOP_PREFS_KEY]).then(([[, n], [, s]]) => {
      if (n) setNotifs(JSON.parse(n));
      if (s) setShopPrefs(JSON.parse(s));
    }).catch(() => {});
  }, []);

  function toggleNotif(key: keyof typeof notifs) {
    setNotifs(prev => {
      const next = { ...prev, [key]: !prev[key] };
      AsyncStorage.setItem(NOTIFS_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }

  function toggleShopPref(key: keyof typeof shopPrefs) {
    setShopPrefs(prev => {
      const next = { ...prev, [key]: !prev[key] };
      AsyncStorage.setItem(SHOP_PREFS_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}>
      <View style={s.container}>
        <Pressable style={[StyleSheet.absoluteFill, s.backdrop]} onPress={onClose} />
        <View style={s.sheet}>

          <View style={s.head}>
            <Text style={s.headTitle}>{t('settings_title')}</Text>
            <Pressable style={s.closeBtn} onPress={onClose}>
              <Text style={s.closeTxt}>✕</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={s.body}>

            {/* Notifications */}
            <Text style={s.sectionTitle}>{t('settings_notifications')}</Text>
            <View style={s.card}>
              {NOTIF_KEYS.map((item, i) => (
                <View key={item.key} style={[s.row, i > 0 && s.rowBorder]}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.rowLabel}>{t(item.labelKey)}</Text>
                    <Text style={s.rowDesc}>{t(item.descKey)}</Text>
                  </View>
                  <Switch
                    value={notifs[item.key]}
                    onValueChange={() => toggleNotif(item.key)}
                    trackColor={{ false: c.border, true: c.primaryBorder }}
                    thumbColor={notifs[item.key] ? c.primary : c.textFaint}
                  />
                </View>
              ))}
            </View>

            {/* Display */}
            <Text style={s.sectionTitle}>{t('settings_display')}</Text>
            <View style={s.card}>

              {/* Language */}
              <View style={s.row}>
                <View style={{ flex: 1 }}>
                  <Text style={s.rowLabel}>{t('display_language')}</Text>
                  <View style={s.chips}>
                    {LANGUAGES.map(lang => {
                      const active = language === lang.value;
                      return (
                        <Pressable
                          key={lang.value}
                          style={[s.chip, active && s.chipActive]}
                          onPress={() => setLanguage(lang.value)}>
                          <Text style={[s.chipTxt, active && s.chipTxtActive]}>
                            {lang.native}
                          </Text>
                          {active && <Text style={s.chipCheck}>✓</Text>}
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </View>

              {/* Theme */}
              <View style={[s.row, s.rowBorder]}>
                <View style={{ flex: 1 }}>
                  <Text style={s.rowLabel}>{t('display_dark_mode')}</Text>
                  <Text style={s.rowDesc}>{t('display_dark_mode_desc')}</Text>
                  <View style={s.chips}>
                    {THEME_OPTIONS.map(opt => {
                      const active = preference === opt.value;
                      return (
                        <Pressable
                          key={opt.value}
                          style={[s.chip, active && s.chipActive]}
                          onPress={() => setPreference(opt.value)}>
                          <Text style={{ fontSize: 13 }}>{opt.icon}</Text>
                          <Text style={[s.chipTxt, active && s.chipTxtActive]}>
                            {t(opt.labelKey)}
                          </Text>
                          {active && <Text style={s.chipCheck}>✓</Text>}
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </View>
            </View>

            {/* Shopping Preferences */}
            <Text style={s.sectionTitle}>{t('settings_shopping')}</Text>
            <View style={s.card}>
              <View style={s.row}>
                <View style={{ flex: 1 }}>
                  <Text style={s.rowLabel}>{t('shop_wallet_auto')}</Text>
                  <Text style={s.rowDesc}>{t('shop_wallet_auto_desc')}</Text>
                </View>
                <Switch
                  value={shopPrefs.walletAuto}
                  onValueChange={() => toggleShopPref('walletAuto')}
                  trackColor={{ false: c.border, true: c.primaryBorder }}
                  thumbColor={shopPrefs.walletAuto ? c.primary : c.textFaint}
                />
              </View>
              <View style={[s.row, s.rowBorder]}>
                <View style={{ flex: 1 }}>
                  <Text style={s.rowLabel}>{t('shop_gst_inclusive')}</Text>
                  <Text style={s.rowDesc}>{t('shop_gst_inclusive_desc')}</Text>
                </View>
                <Switch
                  value={shopPrefs.gstInclusive}
                  onValueChange={() => toggleShopPref('gstInclusive')}
                  trackColor={{ false: c.border, true: c.primaryBorder }}
                  thumbColor={shopPrefs.gstInclusive ? c.primary : c.textFaint}
                />
              </View>
            </View>

            {/* Privacy & Legal */}
            <Text style={s.sectionTitle}>{t('settings_privacy')}</Text>
            <View style={s.card}>
              {[
                { labelKey: 'privacy_policy'   as const, url: 'https://harvestconnect.in/privacy' },
                { labelKey: 'terms_of_service' as const, url: 'https://harvestconnect.in/terms' },
                { labelKey: 'data_permissions' as const, url: 'https://harvestconnect.in/data' },
              ].map((item, i) => (
                <Pressable
                  key={item.labelKey}
                  style={[s.row, i > 0 && s.rowBorder]}
                  onPress={() => Linking.openURL(item.url)}>
                  <Text style={[s.rowLabel, { flex: 1 }]}>{t(item.labelKey)}</Text>
                  <Text style={s.rowChevron}>›</Text>
                </Pressable>
              ))}
            </View>

            {/* About */}
            <Text style={s.sectionTitle}>{t('settings_about')}</Text>
            <View style={s.card}>
              <View style={s.row}>
                <Text style={[s.rowLabel, { flex: 1 }]}>{t('about_version')}</Text>
                <Text style={s.rowMeta}>{appVersion}</Text>
              </View>
              <Pressable
                style={[s.row, s.rowBorder]}
                onPress={() => Linking.openURL('https://play.google.com/store/apps/details?id=com.anonymous.BuyerApp')}>
                <View style={{ flex: 1 }}>
                  <Text style={s.rowLabel}>{t('about_rate_app')}</Text>
                  <Text style={s.rowDesc}>{t('about_rate_app_desc')}</Text>
                </View>
                <Text style={s.rowChevron}>›</Text>
              </Pressable>
            </View>

            <View style={{ height: 32 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function makeStyles(c: AppColors) {
  return StyleSheet.create({
    container: { flex: 1, justifyContent: 'flex-end' },
    backdrop:  { backgroundColor: 'rgba(0,0,0,0.55)' },
    sheet: {
      backgroundColor: c.bg,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      overflow: 'hidden',
      maxHeight: '92%',
    },

    head: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: c.borderLight,
    },
    headTitle: { fontSize: 17, fontWeight: '700', color: c.text },
    closeBtn: {
      width: 32, height: 32,
      backgroundColor: c.bgSubtle,
      borderRadius: 16,
      alignItems: 'center', justifyContent: 'center',
    },
    closeTxt: { fontSize: 13, color: c.textSub, fontWeight: '700' },

    body: { padding: 16 },

    sectionTitle: {
      fontSize: 12, fontWeight: '700', color: c.textFaint,
      letterSpacing: 0.5, textTransform: 'uppercase',
      marginBottom: 8, marginTop: 4,
    },

    card: {
      backgroundColor: c.bg,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
      overflow: 'hidden',
      marginBottom: 20,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 12,
    },
    rowBorder:  { borderTopWidth: 1, borderTopColor: c.borderLight },
    rowLabel:   { fontSize: 14, fontWeight: '600', color: c.text },
    rowDesc:    { fontSize: 11, color: c.textMuted, marginTop: 2 },
    rowMeta:    { fontSize: 12, color: c.textFaint },
    rowChevron: { fontSize: 20, color: c.borderMid },

    chips: { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' },
    chip: {
      flexDirection: 'row', alignItems: 'center', gap: 5,
      paddingHorizontal: 14, paddingVertical: 7,
      borderRadius: 99, borderWidth: 1.5, borderColor: c.border,
      backgroundColor: c.bgMuted,
    },
    chipActive:    { borderColor: c.primary, backgroundColor: c.primaryBg },
    chipTxt:       { fontSize: 13, fontWeight: '600', color: c.textMuted },
    chipTxtActive: { color: c.primaryText },
    chipCheck:     { fontSize: 11, fontWeight: '800', color: c.primary },
  });
}
