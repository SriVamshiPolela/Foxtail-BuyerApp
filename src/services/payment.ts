import { PAYMENT_API_BASE } from '@/constants/api';
import type { SavedUPI, SavedCard, CardNetwork, CardType, UPIApp } from '@/store/payment';

// Shape returned by the backend
interface ServerSavedPM {
  id:              string;
  userId:          string;
  type:            'upi' | 'card';
  upiId?:          string;
  upiApp?:         UPIApp;
  cardToken?:      string;
  cardLast4?:      string;
  cardNetwork?:    CardNetwork;
  cardType?:       CardType;
  cardExpiryMonth?: string;
  cardExpiryYear?:  string;
  cardHolderName?:  string;
  isDefault:       boolean;
  createdAt:       string;
  updatedAt:       string;
}

function toSavedUPI(pm: ServerSavedPM): SavedUPI {
  return {
    id:        pm.id,
    upiId:     pm.upiId!,
    appName:   pm.upiApp ?? 'UPI',
    isDefault: pm.isDefault,
  };
}

function toSavedCard(pm: ServerSavedPM): SavedCard {
  return {
    id:           pm.id,
    last4:        pm.cardLast4!,
    expiryMonth:  pm.cardExpiryMonth!,
    expiryYear:   pm.cardExpiryYear!,
    holderName:   pm.cardHolderName!,
    network:      pm.cardNetwork ?? 'unknown',
    type:         pm.cardType ?? 'debit',
    isDefault:    pm.isDefault,
  };
}

export interface FetchedPaymentMethods {
  upiIds: SavedUPI[];
  cards:  SavedCard[];
}

async function apiCall<T>(url: string, options?: RequestInit): Promise<T> {
  const res  = await fetch(url, options);
  if (res.status === 204) return undefined as T;
  const json = await res.json() as { success: boolean; data?: T; error?: { title: string } };
  if (!json.success) throw new Error(json.error?.title ?? 'Request failed');
  return json.data as T;
}

export async function fetchPaymentMethods(userId: string): Promise<FetchedPaymentMethods> {
  const list = await apiCall<ServerSavedPM[]>(`${PAYMENT_API_BASE}/v1/users/${userId}/payment-methods`);
  return {
    upiIds: list.filter((m) => m.type === 'upi').map(toSavedUPI),
    cards:  list.filter((m) => m.type === 'card').map(toSavedCard),
  };
}

export async function addUPIToServer(userId: string, upiId: string, upiApp?: UPIApp): Promise<SavedUPI> {
  const pm = await apiCall<ServerSavedPM>(`${PAYMENT_API_BASE}/v1/users/${userId}/payment-methods`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ type: 'upi', upiId, upiApp }),
  });
  return toSavedUPI(pm);
}

export async function addCardToServer(
  userId: string,
  card: Omit<SavedCard, 'id' | 'isDefault'>,
): Promise<SavedCard> {
  const pm = await apiCall<ServerSavedPM>(`${PAYMENT_API_BASE}/v1/users/${userId}/payment-methods`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      type:            'card',
      cardLast4:       card.last4,
      cardNetwork:     card.network,
      cardType:        card.type,
      cardExpiryMonth: card.expiryMonth,
      cardExpiryYear:  card.expiryYear,
      cardHolderName:  card.holderName,
    }),
  });
  return toSavedCard(pm);
}

export async function setDefaultPMOnServer(userId: string, id: string): Promise<void> {
  await apiCall<void>(
    `${PAYMENT_API_BASE}/v1/users/${userId}/payment-methods/${id}/default`,
    { method: 'PATCH' },
  );
}

export async function deletePMFromServer(userId: string, id: string): Promise<void> {
  await apiCall<void>(
    `${PAYMENT_API_BASE}/v1/users/${userId}/payment-methods/${id}`,
    { method: 'DELETE' },
  );
}

export interface VPAValidationResult {
  valid: boolean;
  name: string | null;
}

export async function validateUPIId(vpa: string): Promise<VPAValidationResult> {
  const res = await fetch(`${PAYMENT_API_BASE}/v1/upi/validate`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ vpa }),
  });
  const json = await res.json() as { success: boolean; data?: VPAValidationResult; error?: { title: string } };
  if (!json.success) throw new Error(json.error?.title ?? 'UPI ID not found');
  return json.data!;
}
