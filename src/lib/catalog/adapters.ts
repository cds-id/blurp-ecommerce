import type {
  CatalogCategory,
  CatalogProduct,
  CatalogProductDetail,
  CatalogVariantAttribute,
  CatalogVariant,
  CatalogVariantDetail,
} from "./types";
import { categoryImages } from "@/src/data/mock-images";
import type { Category } from "@/src/data/categories";
import type { Product } from "@/src/data/products";

function isProbablyHexColor(value: string): boolean {
  return /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(value.trim());
}

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function parseIso(s?: string | null): number | null {
  if (!s) return null;
  const t = Date.parse(s);
  return Number.isFinite(t) ? t : null;
}

export function toUiCategories(cats: CatalogCategory[]): Category[] {
  return cats.map((c, idx) => {
    const img =
      categoryImages[c.slug] ??
      `https://picsum.photos/seed/category-${encodeURIComponent(c.slug || String(idx))}/600/600`;
    return {
      id: c.id,
      slug: c.slug,
      name: c.name,
      image: img,
      productCount: 0,
    };
  });
}

export function toUiProduct(
  p: CatalogProduct,
  categoryById: Map<string, { name: string; slug: string }>,
): Product {
  const cat = p.category_id ? categoryById.get(p.category_id) : undefined;
  const createdAt = parseIso(p.created_at);
  const isNew = createdAt ? Date.now() - createdAt < 1000 * 60 * 60 * 24 * 14 : false;

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    sku: p.sku,
    category: cat?.name ?? "Catalog",
    categorySlug: cat?.slug ?? "catalog",
    price: p.base_price_idr,
    // Do not fabricate image URLs for catalog list.
    // If backend doesn't provide media in list, UI should show broken placeholder.
    images: [],
    colors: [],
    sizes: [],
    stock: 0,
    rating: 0,
    reviewCount: 0,
    description: p.description ?? "",
    specs: [],
    isNew,
  };
}

function findAttributeValues(
  attrs: CatalogVariantAttribute[] | undefined,
  key: string,
): string[] {
  if (!attrs) return [];
  const target = key.toLowerCase();
  return attrs
    .filter((a) => (a.key ?? "").toLowerCase() === target)
    .map((a) => a.value)
    .filter(Boolean);
}

export function toUiProductDetail(
  detail: CatalogProductDetail,
  categoryById: Map<string, { name: string; slug: string }>,
): Product {
  const p = detail.product;
  const cat = p.category_id ? categoryById.get(p.category_id) : undefined;

  type VariantFlat = CatalogVariant & { attributes: CatalogVariantAttribute[] };
  type VariantEither = CatalogVariantDetail | VariantFlat;

  const getVariantCore = (v: VariantEither): CatalogVariant => {
    if (typeof (v as CatalogVariantDetail).variant === "object" && (v as CatalogVariantDetail).variant) {
      return (v as CatalogVariantDetail).variant;
    }
    return v as VariantFlat;
  };

  const getVariantAttrs = (v: VariantEither): CatalogVariantAttribute[] => {
    const attrs = (v as CatalogVariantDetail).attributes ?? (v as VariantFlat).attributes;
    return Array.isArray(attrs) ? attrs : [];
  };

  const variants = (detail.variants ?? []) as VariantEither[];

  const prices = variants
    .map((v) => getVariantCore(v).price_idr)
    .filter((n) => Number.isFinite(n));
  const price = prices.length > 0 ? Math.min(...prices) : p.base_price_idr;

  const stock = variants.reduce((sum, v) => sum + (getVariantCore(v).stock ?? 0), 0);

  const media = [...(detail.media ?? [])].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  const images = media
    .map((m) => m.cdn_url)
    .filter((u): u is string => Boolean(u))
    .slice(0, 8);

  const allAttrs = variants.flatMap(getVariantAttrs);
  const sizes = uniq([
    ...findAttributeValues(allAttrs, "size"),
    ...findAttributeValues(allAttrs, "ukuran"),
  ]);

  const colorValues = uniq([
    ...findAttributeValues(allAttrs, "color"),
    ...findAttributeValues(allAttrs, "warna"),
  ]);
  const colors = colorValues
    .filter(isProbablyHexColor)
    .map((hex) => ({ name: hex.toUpperCase(), value: hex }));

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    sku: p.sku,
    category: cat?.name ?? "Catalog",
    categorySlug: cat?.slug ?? "catalog",
    price,
    // Only use real backend media URLs; show broken placeholder if missing.
    images,
    colors,
    sizes,
    stock,
    rating: 0,
    reviewCount: 0,
    description: p.description ?? "",
    specs: [
      { label: "Weight", value: `${p.weight_grams ?? 0} g` },
    ].filter((s) => !s.value.startsWith("0 ")),
    isNew: false,
  };
}

