import { useState } from 'react';
import {
  ScrollView, View, Text, TextInput, Pressable,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';

import { PressableScale } from '@/components/pressable-scale';
import { useUserStore } from '@/store/user';
import { useAuthStore } from '@/store/auth';
import { createAddressOnServer, updateAddressOnServer } from '@/services/user';
import type { Address } from '@/store/user';

const LABELS: Address['label'][] = ['Home', 'Work', 'Other'];
const LABEL_ICON: Record<Address['label'], string> = {
  Home: '🏠', Work: '🏢', Other: '📍',
};

type TextField = keyof Pick<Address, 'name' | 'phone' | 'line1' | 'line2' | 'city' | 'pincode' | 'district' | 'state'>;

const FIELDS: {
  key: TextField;
  label: string;
  placeholder: string;
  keyboardType?: 'default' | 'phone-pad' | 'numeric';
  required?: boolean;
}[] = [
  { key: 'name',     label: 'Full Name',                placeholder: 'Recipient name',            required: true },
  { key: 'phone',    label: 'Phone Number',             placeholder: '+91 98765 43210',           keyboardType: 'phone-pad', required: true },
  { key: 'line1',    label: 'Door / Flat / Building',   placeholder: 'Flat 12A, Sunrise Towers',  required: true },
  { key: 'line2',    label: 'Area / Street / Landmark', placeholder: 'Near water tank, Phase 3'  },
  { key: 'city',     label: 'City',                     placeholder: 'Hyderabad',                 required: true },
  { key: 'pincode',  label: 'Pincode',                  placeholder: '500072',                    keyboardType: 'numeric', required: true },
  { key: 'district', label: 'District',                 placeholder: 'Medchal District',          required: true },
  { key: 'state',    label: 'State',                    placeholder: 'Telangana',                 required: true },
];

type FormState = Omit<Address, 'id'>;

const BLANK: FormState = {
  label: 'Home',
  name: '', phone: '',
  line1: '', line2: '',
  city: '', pincode: '',
  district: '', state: '',
  isDefault: false,
};

export default function AddressFormScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const addresses = useUserStore((s) => s.addresses);
  const addAddress = useUserStore((s) => s.addAddress);
  const updateAddress = useUserStore((s) => s.updateAddress);

  const userId = useAuthStore((s) => s.userId);

  const editAddr = id ? addresses.find((a) => a.id === id) : undefined;
  const isEdit = !!editAddr;

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(() =>
    editAddr
      ? {
          label: editAddr.label,
          name: editAddr.name,
          phone: editAddr.phone,
          line1: editAddr.line1,
          line2: editAddr.line2,
          city: editAddr.city,
          pincode: editAddr.pincode,
          district: editAddr.district,
          state: editAddr.state,
          isDefault: editAddr.isDefault,
        }
      : BLANK,
  );
  const [errors, setErrors] = useState<Partial<Record<TextField, string>>>({});

  const patch = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const validate = (): boolean => {
    const errs: Partial<Record<TextField, string>> = {};
    if (!form.name.trim())    errs.name     = 'Name is required';
    if (!form.phone.trim())   errs.phone    = 'Phone is required';
    if (!form.line1.trim())   errs.line1    = 'Address line is required';
    if (!form.city.trim())    errs.city     = 'City is required';
    if (!/^\d{6}$/.test(form.pincode)) errs.pincode = 'Enter a valid 6-digit pincode';
    if (!form.district.trim()) errs.district = 'District is required';
    if (!form.state.trim())   errs.state    = 'State is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    setSaveErr(null);
    const payload = {
      label:     form.label,
      line1:     form.line1,
      line2:     form.line2 || undefined,
      city:      form.city,
      district:  form.district,
      state:     form.state,
      pincode:   form.pincode,
      isDefault: form.isDefault,
    };
    try {
      if (isEdit && id) {
        await updateAddressOnServer(userId!, id, payload);
        updateAddress(id, form);
      } else {
        const server = await createAddressOnServer(userId!, payload);
        addAddress(form, server.id);
      }
      goBack();
    } catch {
      // backend unreachable — save locally so data isn't lost
      if (isEdit && id) {
        updateAddress(id, form);
      } else {
        addAddress(form);
      }
      goBack();
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={s.screen}>
        {/* Header */}
        <SafeAreaView edges={['top']} style={s.header}>
          <Pressable
            onPress={goBack}
            style={({ pressed }) => [s.backBtn, pressed && { opacity: 0.6 }]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={s.backText}>← Back</Text>
          </Pressable>
          <Text style={s.headerTitle}>{isEdit ? 'Edit Address' : 'New Address'}</Text>
          <View style={{ width: 64 }} />
        </SafeAreaView>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={s.content}
        >
          {/* Address type label */}
          <View style={s.block}>
            <Text style={s.blockTitle}>Address Type</Text>
            <View style={s.labelRow}>
              {LABELS.map((lbl) => (
                <Pressable
                  key={lbl}
                  onPress={() => patch('label', lbl)}
                  style={({ pressed }) => [
                    s.labelPill,
                    form.label === lbl && s.labelPillActive,
                    pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] },
                  ]}
                >
                  <Text style={{ fontSize: 18 }}>{LABEL_ICON[lbl]}</Text>
                  <Text style={[s.labelPillTxt, form.label === lbl && s.labelPillTxtActive]}>
                    {lbl}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Text fields */}
          <View style={s.block}>
            <Text style={s.blockTitle}>Address Details</Text>
            <View style={s.formCard}>
              {FIELDS.map((f, idx) => (
                <View key={f.key} style={[s.fieldWrap, idx > 0 && s.fieldDivider]}>
                  <Text style={s.fieldLabel}>
                    {f.label}
                    {f.required && <Text style={s.required}> *</Text>}
                  </Text>
                  <TextInput
                    style={[s.input, !!errors[f.key] && s.inputError]}
                    placeholder={f.placeholder}
                    placeholderTextColor="#9ca3af"
                    value={form[f.key] as string}
                    onChangeText={(v) => {
                      patch(f.key, v as never);
                      if (errors[f.key]) setErrors((e) => ({ ...e, [f.key]: undefined }));
                    }}
                    keyboardType={f.keyboardType ?? 'default'}
                    returnKeyType={idx === FIELDS.length - 1 ? 'done' : 'next'}
                    autoCapitalize={f.key === 'pincode' ? 'none' : 'words'}
                    maxLength={f.key === 'pincode' ? 6 : undefined}
                  />
                  {errors[f.key] && <Text style={s.errText}>{errors[f.key]}</Text>}
                </View>
              ))}
            </View>
          </View>

          {/* Default toggle */}
          <View style={s.block}>
            <Pressable
              style={({ pressed }) => [s.toggleRow, pressed && { opacity: 0.7 }]}
              onPress={() => patch('isDefault', !form.isDefault)}
            >
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={s.toggleLabel}>Set as default address</Text>
                <Text style={s.toggleSub}>Used automatically at checkout</Text>
              </View>
              <View style={[s.toggle, form.isDefault && s.toggleOn]}>
                <View style={[s.toggleKnob, form.isDefault && s.toggleKnobOn]} />
              </View>
            </Pressable>
          </View>

          <View style={{ height: 110 }} />
        </ScrollView>

        {/* Sticky save */}
        <SafeAreaView edges={['bottom']} style={s.bottomBar}>
          <PressableScale style={[s.saveBtn, saving && { opacity: 0.7 }]} scale={0.97} onPress={handleSave} disabled={saving}>
            {saving
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.saveBtnTxt}>{isEdit ? 'Save Changes' : 'Save Address'}</Text>
            }
          </PressableScale>
        </SafeAreaView>
      </View>
    </KeyboardAvoidingView>
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

  content: { paddingHorizontal: 16, paddingTop: 20, gap: 16 },

  block: {},
  blockTitle: {
    fontSize: 11, fontWeight: '700', color: '#6b7280',
    textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10,
  },

  labelRow: { flexDirection: 'row', gap: 10 },
  labelPill: {
    flex: 1, alignItems: 'center', gap: 6, paddingVertical: 14,
    backgroundColor: '#fff', borderRadius: 14, borderWidth: 1.5, borderColor: '#e5e7eb',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  labelPillActive: {
    borderColor: '#c75a28', backgroundColor: '#fff7f5',
    shadowColor: '#c75a28', shadowOpacity: 0.15, elevation: 3,
  },
  labelPillTxt: { fontSize: 12, fontWeight: '700', color: '#374151' },
  labelPillTxtActive: { color: '#c75a28' },

  formCard: {
    backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: '#f0f0f3',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  fieldWrap: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  fieldDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#f0f0f3' },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 },
  required: { color: '#c75a28' },
  input: {
    fontSize: 14, color: '#111827', paddingVertical: 6,
    borderBottomWidth: 1.5, borderBottomColor: '#e5e7eb',
  },
  inputError: { borderBottomColor: '#ef4444' },
  errText: { fontSize: 11, color: '#ef4444', marginTop: 4 },

  toggleRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#f0f0f3',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  toggleLabel: { fontSize: 14, fontWeight: '700', color: '#111827' },
  toggleSub: { fontSize: 11, color: '#9ca3af' },
  toggle: {
    width: 48, height: 28, borderRadius: 14,
    backgroundColor: '#e5e7eb', justifyContent: 'center', paddingHorizontal: 3,
  },
  toggleOn: { backgroundColor: '#c75a28' },
  toggleKnob: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#fff',
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 3, elevation: 2,
  },
  toggleKnobOn: { alignSelf: 'flex-end' },

  bottomBar: {
    backgroundColor: '#fff',
    paddingHorizontal: 16, paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#e5e7eb',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: -3 }, elevation: 10,
  },
  saveBtn: {
    backgroundColor: '#c75a28', borderRadius: 16, height: 56,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#c75a28', shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 6,
  },
  saveBtnTxt: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: 0.2 },
});
