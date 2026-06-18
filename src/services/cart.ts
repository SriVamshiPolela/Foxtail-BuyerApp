import { USER_API_BASE } from '@/constants/api';
import type { CartItem, Product } from '@/types';

interface DbCartItem {
  productId:   string;
  productName: string;
  vendorId:    string;
  vendorName:  string;
  quantity:    number;
  unitPrice:   number;  // paise
  image:       string | null;
}

function toCartItem(row: DbCartItem): CartItem {
  const product: Product = {
    id:            row.productId,
    name:          row.productName,
    vendor:        row.vendorName,
    vendorId:      row.vendorId,
    price:         row.unitPrice / 100,
    originalPrice: row.unitPrice / 100,
    image:         row.image ?? '📦',
    location:      '',
    rating:        0,
    reviews:       0,
    badges:        [],
    shippability:  'mandal',
    category:      '',
    description:   '',
    inStock:       true,
  };
  return { product, quantity: row.quantity };
}

export async function fetchCart(userId: string, token: string): Promise<CartItem[]> {
  const res = await fetch(`${USER_API_BASE}/v1/users/${userId}/cart`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  const json = await res.json() as { success: boolean; data?: DbCartItem[] };
  return json.success && json.data ? json.data.map(toCartItem) : [];
}

export async function upsertCartItem(userId: string, item: CartItem, token: string): Promise<void> {
  await fetch(`${USER_API_BASE}/v1/users/${userId}/cart/${encodeURIComponent(item.product.id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      productId:   item.product.id,
      productName: item.product.name,
      vendorId:    item.product.vendorId,
      vendorName:  item.product.vendor,
      quantity:    item.quantity,
      unitPrice:   Math.round(item.product.price * 100),
      image:       item.product.image ?? null,
    }),
  });
}

export async function removeCartItem(userId: string, productId: string, token: string): Promise<void> {
  await fetch(`${USER_API_BASE}/v1/users/${userId}/cart/${encodeURIComponent(productId)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function clearCart(userId: string, token: string): Promise<void> {
  await fetch(`${USER_API_BASE}/v1/users/${userId}/cart`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}
