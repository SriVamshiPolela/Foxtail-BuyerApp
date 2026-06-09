import { products, categories, vendors, featuredProductIds, regions } from '@/data/mock';
import type { Product, Category, Vendor, Region } from '@/types';

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const shipRank: Record<string, number> = { mandal: 0, district: 1, state: 2, national: 3 };

export async function getProducts(regionId?: string): Promise<Product[]> {
  await delay(180);
  if (!regionId) return products;
  const min = shipRank[regionId] ?? 0;
  return products.filter((p) => (shipRank[p.shippability] ?? 0) >= min);
}

export async function getProductById(id: string): Promise<Product | null> {
  await delay(120);
  return products.find((p) => p.id === id) ?? null;
}

export async function getFeaturedProducts(): Promise<Product[]> {
  await delay(180);
  return products.filter((p) => featuredProductIds.includes(p.id));
}

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  await delay(180);
  const cat = categories.find((c) => c.id === categoryId);
  if (!cat) return [];
  return products.filter((p) => p.category === cat.name);
}

export async function getCategories(): Promise<Category[]> {
  await delay(80);
  return categories;
}

export async function getVendors(): Promise<Vendor[]> {
  await delay(120);
  return vendors;
}

export async function getRegions(): Promise<Region[]> {
  await delay(60);
  return regions;
}
