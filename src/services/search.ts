import { products } from '@/data/mock';
import type { Product } from '@/types';

function relevanceScore(p: Product, q: string): number {
  const lower = q.toLowerCase();
  if (p.name.toLowerCase().includes(lower)) return 3;
  if (p.vendor.toLowerCase().includes(lower) || p.category.toLowerCase().includes(lower)) return 2;
  if (p.description.toLowerCase().includes(lower)) return 1;
  return 0;
}

// Phase 1: searches mock data locally.
// Phase 2: replace this body with a fetch() to Elasticsearch.
export async function searchProducts(query: string): Promise<Product[]> {
  await new Promise<void>((r) => setTimeout(r, 80));
  const q = query.trim();
  if (!q) return [];
  return products
    .map((p) => ({ p, score: relevanceScore(p, q) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ p }) => p);
}
