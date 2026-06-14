import { orders } from '@/data/mock';
import type { Order, OrderStatus } from '@/types';

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export async function getOrders(): Promise<Order[]> {
  await delay(200);
  return orders;
}

export async function getOrdersByStatus(status: OrderStatus): Promise<Order[]> {
  await delay(200);
  return orders.filter((o) => o.status === status);
}

export async function getOrderById(id: string): Promise<Order | null> {
  await delay(120);
  return orders.find((o) => o.id === id) ?? null;
}
