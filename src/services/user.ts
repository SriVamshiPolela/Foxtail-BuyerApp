import { USER_API_BASE } from '@/constants/api';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  type: 'buyer' | 'seller';
  verified: boolean;
  createdAt: string;
}

export async function fetchUserProfile(userId: string): Promise<UserProfile> {
  const res  = await fetch(`${USER_API_BASE}/v1/users/${userId}`);
  const json = await res.json() as { success: boolean; data?: UserProfile; error?: { title: string } };
  if (!json.success || !json.data) {
    throw new Error(json.error?.title ?? 'Failed to load profile');
  }
  return json.data;
}

// ── Address API ───────────────────────────────────────────────────────────────

export interface ServerAddress {
  id: string;
  userId: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  lat: number;
  lng: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

type AddressPayload = {
  label: string;
  line1: string;
  line2?: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  isDefault: boolean;
};

export async function fetchAddresses(userId: string): Promise<ServerAddress[]> {
  const res  = await fetch(`${USER_API_BASE}/v1/users/${userId}/addresses`);
  const json = await res.json() as { success: boolean; data?: ServerAddress[]; error?: { title: string } };
  if (!json.success || !json.data) throw new Error(json.error?.title ?? 'Failed to load addresses');
  return json.data;
}

export async function createAddressOnServer(userId: string, data: AddressPayload): Promise<ServerAddress> {
  const res  = await fetch(`${USER_API_BASE}/v1/users/${userId}/addresses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json() as { success: boolean; data?: ServerAddress; error?: { title: string } };
  if (!json.success || !json.data) throw new Error(json.error?.title ?? 'Failed to create address');
  return json.data;
}

export async function updateAddressOnServer(
  userId: string, addrId: string, patch: Partial<AddressPayload>,
): Promise<ServerAddress> {
  const res  = await fetch(`${USER_API_BASE}/v1/users/${userId}/addresses/${addrId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  const json = await res.json() as { success: boolean; data?: ServerAddress; error?: { title: string } };
  if (!json.success || !json.data) throw new Error(json.error?.title ?? 'Failed to update address');
  return json.data;
}

export async function deleteAddressOnServer(userId: string, addrId: string): Promise<void> {
  const res = await fetch(`${USER_API_BASE}/v1/users/${userId}/addresses/${addrId}`, {
    method: 'DELETE',
  });
  if (!res.ok && res.status !== 204) throw new Error('Failed to delete address');
}

// ── Wallet API ────────────────────────────────────────────────────────────────
// All amounts are converted from paise (backend) → rupees (frontend) here.
// Nothing outside this file ever sees paise.

export interface WalletTransaction {
  id:           string;
  userId:       string;
  type:         'credit' | 'debit';
  amount:       number;   // ₹ rupees
  balance:      number;   // ₹ rupees
  description:  string;
  source?:      string;
  referenceId?: string;
  createdAt:    string;
}

interface RawWalletTransaction extends Omit<WalletTransaction, 'amount' | 'balance'> {
  amount:  number;  // paise from server
  balance: number;  // paise from server
}

interface RawWalletData {
  balance:      number;                  // paise
  transactions: RawWalletTransaction[];
}

function toRupees(paise: number) { return paise / 100; }

function mapTxn(raw: RawWalletTransaction): WalletTransaction {
  return { ...raw, amount: toRupees(raw.amount), balance: toRupees(raw.balance) };
}

export async function fetchWallet(userId: string): Promise<{ balance: number; transactions: WalletTransaction[] }> {
  const res  = await fetch(`${USER_API_BASE}/v1/users/${userId}/wallet`);
  const json = await res.json() as { success: boolean; data?: RawWalletData; error?: { title: string } };
  if (!json.success || !json.data) throw new Error(json.error?.title ?? 'Failed to load wallet');
  return {
    balance:      toRupees(json.data.balance),
    transactions: json.data.transactions.map(mapTxn),
  };
}

// ── Referral API ──────────────────────────────────────────────────────────────

export interface ReferralEntry {
  id: string;
  refereeId: string;
  status: 'pending' | 'rewarded';
  rewardRupees: number;   // ₹ (referrer reward)
  createdAt: string;
}

export interface ReferralStats {
  code: string;
  totalReferrals: number;
  pendingReferrals: number;
  rewardedReferrals: number;
  totalEarnedRupees: number;
  referrals: ReferralEntry[];
}

interface RawReferralStats {
  code: string;
  totalReferrals: number;
  pendingReferrals: number;
  rewardedReferrals: number;
  totalEarnedPaise: number;
  referrals: Array<{
    id: string;
    refereeId: string;
    status: 'pending' | 'rewarded';
    rewardReferrerPaise: number;
    createdAt: string;
  }>;
}

export async function fetchReferralStats(userId: string): Promise<ReferralStats> {
  const res  = await fetch(`${USER_API_BASE}/v1/users/${userId}/referral`);
  const json = await res.json() as { success: boolean; data?: RawReferralStats; error?: { title: string } };
  if (!json.success || !json.data) throw new Error(json.error?.title ?? 'Failed to load referral stats');
  const raw = json.data;
  return {
    code:              raw.code,
    totalReferrals:    raw.totalReferrals,
    pendingReferrals:  raw.pendingReferrals,
    rewardedReferrals: raw.rewardedReferrals,
    totalEarnedRupees: toRupees(raw.totalEarnedPaise),
    referrals: raw.referrals.map(r => ({
      id:           r.id,
      refereeId:    r.refereeId,
      status:       r.status,
      rewardRupees: toRupees(r.rewardReferrerPaise),
      createdAt:    r.createdAt,
    })),
  };
}

export async function applyReferralCode(userId: string, code: string): Promise<void> {
  const res = await fetch(`${USER_API_BASE}/v1/users/${userId}/referral/apply`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ code }),
  });
  const json = await res.json() as { success: boolean; error?: { title: string } };
  if (!json.success) throw new Error(json.error?.title ?? 'Failed to apply referral code');
}

export async function topupWallet(
  userId: string,
  amountRupees: number,           // caller passes ₹, we multiply to paise for API
  paymentMethod: string,
  paymentMethodId?: string,
): Promise<{ balance: number; transaction: WalletTransaction }> {
  const res  = await fetch(`${USER_API_BASE}/v1/users/${userId}/wallet/topup`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ amount: Math.round(amountRupees * 100), paymentMethod, paymentMethodId }),
  });
  const json = await res.json() as {
    success: boolean;
    data?: { balance: number; transaction: RawWalletTransaction };
    error?: { title: string };
  };
  if (!json.success || !json.data) throw new Error(json.error?.title ?? 'Top-up failed');
  return {
    balance:     toRupees(json.data.balance),
    transaction: mapTxn(json.data.transaction),
  };
}
