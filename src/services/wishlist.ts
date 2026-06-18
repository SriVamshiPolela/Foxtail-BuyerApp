import { USER_API_BASE } from '@/constants/api';

export async function fetchWishlist(userId: string, token: string): Promise<string[]> {
  const res = await fetch(`${USER_API_BASE}/v1/users/${userId}/wishlist`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  const json = await res.json() as { success: boolean; data?: string[] };
  return json.success && json.data ? json.data : [];
}

export async function addToWishlist(userId: string, productId: string, token: string): Promise<void> {
  await fetch(`${USER_API_BASE}/v1/users/${userId}/wishlist/${encodeURIComponent(productId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: '{}',
  });
}

export async function removeFromWishlist(userId: string, productId: string, token: string): Promise<void> {
  await fetch(`${USER_API_BASE}/v1/users/${userId}/wishlist/${encodeURIComponent(productId)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}
