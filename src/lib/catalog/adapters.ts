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

/** Stable HSL for non-hex color labels (Natural Titanium, Black, …). */
function stringToSwatchColor(label: string): string {
  let h = 0;
  for (let i = 0; i < label.length; i += 1) {
    h = (h * 31 + label.charCodeAt(i)) | 0;
  }
  const hue = Math.abs(h) % 360;
  return `hsl(${hue} 42% 52%)`;
}

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function parseIso(s?: string | null): number | null {
  if (!s) return null;
  const t = Date.parse(s);
  return Number.isFinite(t) ? t : null;
}

/** Backend list + detail may expose snake_case and/or camelCase. */
function catalogPrimaryImageUrl(p: CatalogProduct): string | null {
  const u = p.primary_image_url ?? p.primaryImageUrl;
  if (u == null) return null;
  const s = String(u).trim();
  return s.length > 0 ? s : null;
}

function variantCoverImageUrl(v: CatalogVariant): string | null {
  const u = v.primary_image_url ?? v.primaryImageUrl ?? v.image_url;
  if (u == null) return null;
  const s = String(u).trim();
  return s.length > 0 ? s : null;
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
    images: (() => {
      const u = catalogPrimaryImageUrl(p);
      return u ? [u] : [];
    })(),
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

const SIZE_ATTRIBUTE_KEYS = [
  "size",
  "ukuran",
  "storage",
  "memory",
  "kapasitas",
  "capacity",
  "penyimpanan",
] as const;

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
  const fromMedia = media
    .map((m) => m.cdn_url)
    .filter((u): u is string => Boolean(u));
  const primary = catalogPrimaryImageUrl(p);
  const variantImageUrls = uniq(
    variants
      .map((v) => variantCoverImageUrl(getVariantCore(v)))
      .filter((u): u is string => Boolean(u)),
  );
  let imageList = uniq([...fromMedia, ...variantImageUrls]);
  if (imageList.length === 0 && primary) imageList = [primary];
  else imageList = imageList.slice(0, 12);

  const allAttrs = variants.flatMap(getVariantAttrs);
  const sizes = uniq(
    SIZE_ATTRIBUTE_KEYS.flatMap((k) => findAttributeValues(allAttrs, k)),
  );

  const colorValues = uniq([
    ...findAttributeValues(allAttrs, "color"),
    ...findAttributeValues(allAttrs, "warna"),
    ...findAttributeValues(allAttrs, "colour"),
  ]);
  const colors = colorValues.map((c) => {
    const trimmed = c.trim();
    if (isProbablyHexColor(trimmed)) {
      return { name: trimmed.toUpperCase(), value: trimmed };
    }
    return { name: trimmed, value: stringToSwatchColor(trimmed) };
  });

  const variantOptions =
    variants.length > 0
      ? variants.map((v) => {
          const core = getVariantCore(v);
          const attrs = getVariantAttrs(v).map((a) => ({
            key: String(a.key ?? ""),
            value: String(a.value ?? ""),
          }));
          const label =
            (core.name && core.name.trim()) ||
            attrs.map((x) => x.value).filter(Boolean).join(" · ") ||
            core.sku;
          const img = variantCoverImageUrl(core);
          return {
            id: core.id,
            name: label,
            sku: core.sku,
            priceIdr: core.price_idr,
            stock: core.stock ?? 0,
            attributes: attrs,
            ...(img ? { imageUrl: img } : {}),
          };
        })
      : undefined;

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    sku: p.sku,
    category: cat?.name ?? "Catalog",
    categorySlug: cat?.slug ?? "catalog",
    price,
    // Product media plus per-variant images when provided by the API.
    images: imageList,
    colors,
    sizes,
    variantOptions,
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

