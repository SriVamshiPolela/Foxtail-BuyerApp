import { CATALOG_API_BASE } from '@/constants/api';
import type { Product, Category, Vendor, Region } from '@/types';
import { categories, vendors, regions } from '@/data/mock';

interface CatalogProduct {
  id: string;
  name: string;
  category: string;
  subCategory: string;
  price: number;
  originalPrice?: number;
  unit: string;
  sellerId: string;
  sellerName: string;
  location: string;
  inStock: boolean;
  isVerified: boolean;
  isHandmade: boolean;
  shipsTo: 'mandal' | 'district' | 'state' | 'national';
  rating: number;
  reviewCount: number;
  status: 'active' | 'draft' | 'archived';
  createdAt: string;
}

const CATEGORY_EMOJI: Record<string, string> = {
  farm_products:   '🌾',
  processed_foods: '🫙',
  foods:           '🍱',
  arts_handmade:   '🎨',
  services:        '🔧',
};

const SUBCATEGORY_EMOJI: Record<string, string> = {
  grains_staples:         '🌾',
  vegetables_spices:      '🧄',
  animal_products:        '🥩',
  pastes_powders:         '🫙',
  oils:                   '🫒',
  preserved_packaged:     '🥫',
  furniture:              '🪑',
  iron_works:             '⚙️',
  vendor_products:        '🛍️',
  dealer_products:        '🏗️',
  materials_finishes:     '🎨',
  utilities:              '🔧',
  beauty_wellness:        '💆',
  technical:              '🔌',
  construction_finishing: '🏠',
  mechanical:             '🔩',
  rentals:                '🚗',
};

const CATEGORY_DISPLAY: Record<string, string> = {
  farm_products:   'Farm Products',
  processed_foods: 'Processed Foods',
  foods:           'Foods',
  arts_handmade:   'Arts & Handmade',
  services:        'Services',
};

const SHIP_RANK: Record<string, number> = { mandal: 0, district: 1, state: 2, national: 3 };

function mapProduct(p: CatalogProduct): Product {
  const badges: Product['badges'] = [];
  if (p.isVerified) badges.push('verified');
  if (p.isHandmade) badges.push('handmade');
  if (p.shipsTo === 'mandal') badges.push('local');

  return {
    id: p.id,
    name: p.name,
    vendor: p.sellerName,
    vendorId: p.sellerId,
    location: p.location,
    price: p.price / 100,
    originalPrice: (p.originalPrice ?? p.price) / 100,
    image: SUBCATEGORY_EMOJI[p.subCategory] ?? CATEGORY_EMOJI[p.category] ?? '📦',
    rating: p.rating,
    reviews: p.reviewCount,
    badges,
    shippability: p.shipsTo,
    category: CATEGORY_DISPLAY[p.category] ?? p.category,
    description: `${p.name} from ${p.location}. Sold by ${p.sellerName}. Available per ${p.unit}.`,
    inStock: p.inStock,
  };
}

async function fetchCatalogProducts(params?: Record<string, string>): Promise<CatalogProduct[]> {
  const url = new URL(`${CATALOG_API_BASE}/v1/products`);
  if (params) {
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString());
  const body = await res.json();
  return body.data as CatalogProduct[];
}

export async function getProducts(regionId?: string): Promise<Product[]> {
  const raw = await fetchCatalogProducts({ status: 'active' });
  if (!regionId) return raw.map(mapProduct);
  const min = SHIP_RANK[regionId] ?? 0;
  return raw.filter((p) => (SHIP_RANK[p.shipsTo] ?? 0) >= min).map(mapProduct);
}

export async function getProductById(id: string): Promise<Product | null> {
  const res = await fetch(`${CATALOG_API_BASE}/v1/products/${id}`);
  if (res.status === 404) return null;
  const body = await res.json();
  const p = body.data as CatalogProduct;
  if (p.status !== 'active') return null;
  return mapProduct(p);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const raw = await fetchCatalogProducts({ status: 'active' });
  return raw
    .filter((p) => p.inStock)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6)
    .map(mapProduct);
}

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  const raw = await fetchCatalogProducts({ category: categoryId, status: 'active' });
  return raw.map(mapProduct);
}

export async function getCategories(): Promise<Category[]> {
  return categories;
}

export async function getVendors(): Promise<Vendor[]> {
  return vendors;
}

export async function getVendorById(id: string): Promise<Vendor | null> {
  return vendors.find((v) => v.id === id) ?? null;
}

export async function getRegions(): Promise<Region[]> {
  return regions;
}
