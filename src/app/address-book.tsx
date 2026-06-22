import { ScrollView, View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';

import { PressableScale } from '@/components/pressable-scale';
import { useUserStore } from '@/store/user';
import { useAuthStore } from '@/store/auth';
import { deleteAddressOnServer } from '@/services/user';
import { useLanguage } from '@/context/language-context';
import type { Address } from '@/store/user';

const LABEL_ICON: Record<Address['label'], string> = {
  Home: '🏠',
  Work: '🏢',
  Other: '📍',
};

export default function AddressBookScreen() {
  const { t } = useLanguage();
  const params = useLocalSearchParams<{ select?: string }>();
  const isSelectMode = params.select === '1';

  const userId = useAuthStore((s) => s.userId);
  const addresses = useUserStore((s) => s.addresses);
  const selectedAddressId = useUserStore((s) => s.selectedAddressId);
  const setSelectedAddress = useUserStore((s) => s.setSelectedAddress);
  const deleteAddress = useUserStore((s) => s.deleteAddress);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  const handleSelect = (id: string) => {
    setSelectedAddress(id);
    if (isSelectMode) goBack();
  };

  const handleDelete = (addr: Address) => {
    if (addresses.length <= 1) {
      Alert.alert(
        'Cannot Delete',
        'You need at least one delivery address. Add a new address first, then delete this one.',
        [{ text: 'OK' }],
      );
      return;
    }
    Alert.alert(
      'Delete Address',
      `Remove "${addr.label}" at ${addr.line1}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteAddress(addr.id);
            if (userId) deleteAddressOnServer(userId, addr.id).catch(() => {});
          },
        },
      ],
    );
  };

  return (
    <View style={s.screen}>
      <SafeAreaView edges={['top']} style={s.header}>
        <Pressable
          onPress={goBack}
          style={({ pressed }) => [s.backBtn, pressed && { opacity: 0.6 }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={s.backText}>{t('address_book_back')}</Text>
        </Pressable>
        <Text style={s.headerTitle}>
          {isSelectMode ? t('address_book_select_title') : t('address_book_title')}
        </Text>
        <View style={{ width: 64 }} />
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.list}>
        {addresses.length === 0 && (
          <View style={s.emptyWrap}>
            <Text style={{ fontSize: 52 }}>📭</Text>
            <Text style={s.emptyTitle}>{t('address_book_empty_title')}</Text>
            <Text style={s.emptySub}>{t('address_book_empty_sub')}</Text>
          </View>
        )}

        {addresses.map((addr) => {
          const active = addr.id === selectedAddressId;
          return (
            // Plain View as card container — no nested touchable issues
            <View key={addr.id} style={[s.card, active && s.cardActive]}>

              {/* Selectable area — only this Pressable handles select */}
              <Pressable
                onPress={() => handleSelect(addr.id)}
                style={({ pressed }) => [s.selectArea, pressed && { opacity: 0.75 }]}
              >
                <View style={s.cardTop}>
                  <View style={[s.radio, active && s.radioActive]}>
                    {active && <View style={s.radioDot} />}
                  </View>
                  <Text style={s.labelIcon}>{LABEL_ICON[addr.label]}</Text>
                  <Text style={[s.labelText, active && s.labelTextActive]}>
                    {addr.label}
                  </Text>
                  {addr.isDefault && (
                    <View style={s.defaultBadge}>
                      <Text style={s.defaultBadgeTxt}>{t('address_book_default')}</Text>
                    </View>
                  )}
                </View>

                <View style={s.cardBody}>
                  <Text style={s.addrName}>
                    {addr.name}{'  '}
                    <Text style={s.addrPhone}>{addr.phone}</Text>
                  </Text>
                  <Text style={s.addrLine}>{addr.line1}</Text>
                  {!!addr.line2 && <Text style={s.addrLine}>{addr.line2}</Text>}
                  <Text style={s.addrLine}>{addr.city} – {addr.pincode}</Text>
                  <Text style={s.addrLine}>{addr.district}, {addr.state}</Text>
                </View>
              </Pressable>

              {/* Action row — flat sibling, NOT nested inside selectable area */}
              <View style={s.actionRow}>
                <Pressable
                  style={({ pressed }) => [s.actionBtn, pressed && { backgroundColor: '#e5e7eb', opacity: 0.8 }]}
                  onPress={() => router.push({ pathname: '/address-form', params: { id: addr.id } })}
                >
                  <Text style={{ fontSize: 13 }}>✏️</Text>
                  <Text style={s.actionBtnTxt}>{t('address_book_edit')}</Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [s.actionBtn, s.actionBtnDelete, pressed && { backgroundColor: '#fee2e2', opacity: 0.8 }]}
                  onPress={() => handleDelete(addr)}
                >
                  <Text style={{ fontSize: 13 }}>🗑️</Text>
                  <Text style={[s.actionBtnTxt, { color: '#ef4444' }]}>{t('address_book_delete')}</Text>
                </Pressable>
              </View>
            </View>
          );
        })}

        {/* Add new address */}
        <PressableScale
          style={s.addBtn}
          scale={0.97}
          onPress={() => router.push({ pathname: '/address-form' })}
        >
          <Text style={s.addBtnPlus}>+</Text>
          <Text style={s.addBtnTxt}>{t('address_book_add')}</Text>
        </PressableScale>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f5f7' },

  header: {
    backgroundColor: '#c75a28',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    shadowColor: '#c75a28',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  backBtn: { width: 64 },
  backText: { fontSize: 14, color: '#fff', fontWeight: '700' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '800', color: '#fff' },

  list: { paddingHorizontal: 16, paddingTop: 16, gap: 12 },

  emptyWrap: { alignItems: 'center', paddingTop: 64, gap: 10, paddingHorizontal: 24 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  emptySub: { fontSize: 13, color: '#9ca3af', textAlign: 'center' },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#f0f0f3',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardActive: {
    borderColor: '#c75a28',
    backgroundColor: '#fff7f5',
    shadowColor: '#c75a28',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },

  selectArea: { padding: 16, paddingBottom: 12 },

  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 6 },
  radio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: '#d1d5db',
    alignItems: 'center', justifyContent: 'center',
  },
  radioActive: { borderColor: '#c75a28' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#c75a28' },
  labelIcon: { fontSize: 18 },
  labelText: { fontSize: 14, fontWeight: '700', color: '#374151' },
  labelTextActive: { color: '#c75a28' },
  defaultBadge: {
    backgroundColor: '#c75a28', borderRadius: 6,
    paddingHorizontal: 7, paddingVertical: 2, marginLeft: 2,
  },
  defaultBadgeTxt: { fontSize: 9, fontWeight: '700', color: '#fff' },

  cardBody: { gap: 2 },
  addrName: { fontSize: 13, fontWeight: '700', color: '#111827' },
  addrPhone: { fontSize: 12, color: '#6b7280', fontWeight: '400' },
  addrLine: { fontSize: 12, color: '#6b7280', lineHeight: 18 },

  // Action row sits below the selectable area, as a flat sibling
  actionRow: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#f0f0f3',
  },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 11, backgroundColor: '#fafafa',
  },
  actionBtnDelete: {
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: '#f0f0f3',
  },
  actionBtnTxt: { fontSize: 12, fontWeight: '700', color: '#374151' },

  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 18,
    borderWidth: 2,
    borderColor: '#c75a28',
    borderStyle: 'dashed',
    marginTop: 4,
  },
  addBtnPlus: { fontSize: 22, color: '#c75a28', fontWeight: '300', lineHeight: 24 },
  addBtnTxt: { fontSize: 15, fontWeight: '700', color: '#c75a28' },
});
