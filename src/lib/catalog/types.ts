export type CatalogCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parent_id?: string | null;
};

export type CatalogProduct = {
  id: string;
  category_id?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  base_price_idr: number;
  weight_grams?: number;
  sku: string;
  is_active?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type CatalogProductMedia = {
  id: string;
  media_id: string;
  position: number;
  is_primary: boolean;
  alt_text?: string | null;
  cdn_url?: string | null;
  content_type: string;
};

export type CatalogVariantAttribute = {
  id: string;
  variant_id: string;
  key: string;
  value: string;
};

export type CatalogVariant = {
  id: string;
  product_id: string;
  name: string;
  sku: string;
  price_idr: number;
  stock: number;
};

export type CatalogVariantDetail = {
  variant: CatalogVariant;
  attributes: CatalogVariantAttribute[];
};

export type CatalogProductDetail = {
  product: CatalogProduct;
  variants: CatalogVariantDetail[];
  media: CatalogProductMedia[];
};

