import { ORDER_API_BASE } from '@/constants/api';
import type { Order, OrderStatus } from '@/types';

// Shape returned by order-svc for a single order item
interface ApiOrderItem {
  productId:   string;
  productName: string;
  sellerId:    string;
  sellerName:  string;
  quantity:    number;
  unitPrice:   number;  // paise
  totalPrice:  number;  // paise
  unit:        string;
  imageUrl?:   string;
}

interface ApiDeliveryAddress {
  label:    string;
  line1:    string;
  line2?:   string;
  city:     string;
  district: string;
  state:    string;
  pincode:  string;
  lat:      number;
  lng:      number;
}

export interface ApiOrder {
  id:                string;
  buyerId:           string;
  buyerName:         string;
  buyerPhone:        string;
  items:             ApiOrderItem[];
  deliveryAddress:   ApiDeliveryAddress;
  subtotal:          number;   // paise
  deliveryFee:       number;   // paise
  discount:          number;   // paise
  total:             number;   // paise
  paymentMethod:     string;
  paymentId?:        string;
  status:            string;
  estimatedDelivery?: string;
  createdAt:         string;
  updatedAt:         string;
}

export interface PlaceOrderBody {
  buyerId:         string;
  buyerName:       string;
  buyerPhone:      string;
  items: Array<{
    productId:   string;
    productName: string;
    sellerId:    string;
    sellerName:  string;
    quantity:    number;
    unitPrice:   number;  // paise
    unit:        string;
  }>;
  deliveryAddress: {
    label:    string;
    line1:    string;
    line2?:   string;
    city:     string;
    district: string;
    state:    string;
    pincode:  string;
    lat:      number;
    lng:      number;
  };
  paymentMethod: 'upi' | 'card' | 'cod' | 'wallet';
}

function mapStatus(s: string): OrderStatus {
  if (s === 'delivered')                                                  return 'delivered';
  if (s === 'in_transit' || s === 'dispatched')                           return 'in-transit';
  if (s === 'cancelled' || s === 'refund_initiated' || s === 'refunded')  return 'cancelled';
  return 'processing';
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function formatDelivery(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function toOrder(api: ApiOrder): Order {
  const sellerNames = [...new Set(api.items.map((i) => i.sellerName))];
  return {
    id:    api.id,
    date:  formatDate(api.createdAt),
    status: mapStatus(api.status),
    items: api.items.map((i) => ({
      productId: i.productId,
      name:      i.productName,
      image:     '📦',
      qty:       i.quantity,
    })),
    total:  Math.round(api.total / 100),   // paise → rupees
    vendor: sellerNames.length === 1 ? sellerNames[0]! : 'Multiple Vendors',
    expectedDelivery: api.estimatedDelivery ? formatDelivery(api.estimatedDelivery) : undefined,
  };
}

export async function fetchOrders(userId: string, token: string): Promise<Order[]> {
  try {
    const res = await fetch(`${ORDER_API_BASE}/v1/orders?buyerId=${encodeURIComponent(userId)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return [];
    const json = await res.json() as { success: boolean; data?: ApiOrder[] };
    if (!json.success || !json.data) return [];
    return json.data.map(toOrder);
  } catch {
    return [];
  }
}

export async function fetchOrderById(orderId: string, token: string): Promise<ApiOrder | null> {
  try {
    const res = await fetch(`${ORDER_API_BASE}/v1/orders/${encodeURIComponent(orderId)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const json = await res.json() as { success: boolean; data?: ApiOrder };
    return json.success && json.data ? json.data : null;
  } catch {
    return null;
  }
}

export async function cancelOrder(orderId: string, reason: string, token: string): Promise<ApiOrder> {
  const res = await fetch(`${ORDER_API_BASE}/v1/orders/${encodeURIComponent(orderId)}/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ reason }),
  });
  const json = await res.json() as { success: boolean; data?: ApiOrder; error?: { title: string } };
  if (!json.success || !json.data) {
    throw new Error(json.error?.title ?? 'Failed to cancel order');
  }
  return json.data;
}

export async function placeOrder(body: PlaceOrderBody, token: string): Promise<ApiOrder[]> {
  const res = await fetch(`${ORDER_API_BASE}/v1/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const json = await res.json() as { success: boolean; data?: ApiOrder[]; error?: { title: string } };
  if (!json.success || !json.data || json.data.length === 0) {
    throw new Error(json.error?.title ?? 'Failed to place order');
  }
  return json.data;
}
