import { getApiBaseUrl } from "@/src/lib/api/client";
import type { ApiMeta, ApiResponse } from "@/src/lib/api/types";
import type { CatalogCategory, CatalogProduct, CatalogProductDetail, CatalogProductMedia, CatalogVariantDetail } from "./types";

type CatalogProductDetailFlattened = CatalogProduct & {
  variants: CatalogVariantDetail[];
  media: CatalogProductMedia[];
};

type QueryValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Array<string | number | boolean | null | undefined>;

async function apiGet<T>(
  path: string,
  opts?: { query?: Record<string, QueryValue>; revalidate?: number },
): Promise<{ data: T; meta: ApiMeta | null }> {
  const base = getApiBaseUrl();
  const url = new URL(path.startsWith("/") ? `${base}${path}` : `${base}/${path}`);

  if (opts?.query) {
    for (const [k, v] of Object.entries(opts.query)) {
      if (Array.isArray(v)) {
        url.searchParams.delete(k);
        for (const item of v) {
          if (item === undefined || item === null) continue;
          url.searchParams.append(k, String(item));
        }
        continue;
      }
      if (v === undefined || v === null) continue;
      url.searchParams.set(k, String(v));
    }
  }

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    next: typeof opts?.revalidate === "number" ? { revalidate: opts.revalidate } : undefined,
    cache: typeof opts?.revalidate === "number" ? undefined : "no-store",
  });

  const text = await res.text();
  let body: ApiResponse<T> | null = null;
  if (text) body = JSON.parse(text) as ApiResponse<T>;

  if (!res.ok || body?.error || !body?.data) {
    const msg = body?.error?.message ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return { data: body.data, meta: body.meta ?? null };
}

export async function listCatalogCategories(): Promise<CatalogCategory[]> {
  const { data } = await apiGet<CatalogCategory[]>("/api/catalog/categories", { revalidate: 60 });
  return data;
}

export async function listCatalogProducts(params: {
  page?: number;
  per_page?: number;
  category_id?: string | string[];
  search?: string;
  min_price_idr?: number;
  max_price_idr?: number;
  sort?: "newest" | "popular" | "price_asc" | "price_desc";
  attribute?: string[];
}): Promise<{ items: CatalogProduct[]; meta: ApiMeta | null }> {
  const { data, meta } = await apiGet<CatalogProduct[]>("/api/catalog/products", {
    query: {
      page: params.page,
      per_page: params.per_page,
      category_id: params.category_id,
      search: params.search,
      active_only: true,
      min_price_idr: params.min_price_idr,
      max_price_idr: params.max_price_idr,
      sort: params.sort,
      attribute: params.attribute,
    },
  });
  return { items: data, meta };
}

export async function getCatalogProductDetail(idOrSlug: string): Promise<CatalogProductDetail> {
  const { data } = await apiGet<CatalogProductDetail | CatalogProductDetailFlattened>(
    `/api/catalog/products/${encodeURIComponent(idOrSlug)}`,
    {
    revalidate: 30,
    }
  );

  // Backend uses #[serde(flatten)] on ProductDetail, so it returns product fields at
  // the top-level alongside `variants` + `media`. Normalize to { product, variants, media }.
  if (data && typeof data === "object" && "product" in data) {
    return data as CatalogProductDetail;
  }

  const flat = data as CatalogProductDetailFlattened;
  const { variants, media, ...product } = flat;
  return { product, variants: variants ?? [], media: media ?? [] };
}

