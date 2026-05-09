/** One purchasable SKU from the catalog API (for detail variant picker + cart). */
export type ProductVariantOption = {
  id: string;
  name: string;
  sku: string;
  priceIdr: number;
  stock: number;
  attributes: { key: string; value: string }[];
  /** Optional cover image for this SKU (from catalog API). */
  imageUrl?: string;
};

export interface Product {
  id: string;
  slug: string;
  name: string;
  sku: string;
  category: string;
  categorySlug: string;
  price: number;
  originalPrice?: number;
  images: string[];
  colors: { name: string; value: string }[];
  sizes: string[];
  /** When set (catalog detail), prefer this for add-to-cart and price/stock. */
  variantOptions?: ProductVariantOption[];
  stock: number;
  rating: number;
  reviewCount: number;
  description: string;
  specs: { label: string; value: string }[];
  isNew?: boolean;
}

export const products: Product[] = [
  {
    id: "1",
    slug: "serum-vitamin-c-bright-glow",
    name: "Serum Vitamin C Bright Glow 30ml",
    sku: "SR-C-30",
    category: "Skincare",
    categorySlug: "skincare",
    price: 189000,
    originalPrice: 229000,
    images: ["https://picsum.photos/id/159/600/600", "https://picsum.photos/id/160/600/600"],
    colors: [
      { name: "Amber", value: "#c08a58" },
      { name: "Clear", value: "#f7f5f2" },
    ],
    sizes: [],
    stock: 48,
    rating: 4.9,
    reviewCount: 1824,
    description: "Serum vitamin C untuk tampilan kulit lebih cerah, halus, dan glowing—ringan, cepat menyerap.",
    specs: [
      { label: "Tekstur", value: "Water-gel, cepat menyerap" },
      { label: "Skin type", value: "All skin types" },
    ],
    isNew: true,
  },
  {
    id: "2",
    slug: "hydrating-cleanser-milk-foam",
    name: "Hydrating Cleanser Milk Foam 120ml",
    sku: "CL-MF-120",
    category: "Skincare",
    categorySlug: "skincare",
    price: 109000,
    images: ["https://picsum.photos/id/161/600/600"],
    colors: [{ name: "Milk", value: "#f4f1ed" }],
    sizes: [],
    stock: 90,
    rating: 4.8,
    reviewCount: 1044,
    description: "Cleanser lembut untuk membersihkan sunscreen dan makeup ringan tanpa membuat kulit ketarik.",
    specs: [
      { label: "pH", value: "5.5" },
      { label: "Skin type", value: "Normal • Dry • Sensitive" },
    ],
    isNew: true,
  },
  {
    id: "3",
    slug: "lip-tint-rose-collection",
    name: "Lip Tint Rose Collection (4 Shades)",
    sku: "LT-RS-4",
    category: "Makeup",
    categorySlug: "makeup",
    price: 159000,
    originalPrice: 199000,
    images: ["https://picsum.photos/id/162/600/600", "https://picsum.photos/id/163/600/600"],
    colors: [
      { name: "Rose", value: "#e06b7d" },
      { name: "Coral", value: "#ff7b6b" },
      { name: "Berry", value: "#b3476f" },
    ],
    sizes: [],
    stock: 120,
    rating: 4.8,
    reviewCount: 954,
    description: "Tint ringan dengan finish velvet-glossy dan stain tahan lama. Cocok untuk daily look.",
    specs: [
      { label: "Finish", value: "Velvet glossy" },
      { label: "Ketahanan", value: "6–8 jam" },
    ],
    isNew: true,
  },
  {
    id: "4",
    slug: "soft-matte-cushion-foundation",
    name: "Soft Matte Cushion Foundation SPF 40",
    sku: "CU-SM-01",
    category: "Makeup",
    categorySlug: "makeup",
    price: 219000,
    originalPrice: 269000,
    images: ["https://picsum.photos/id/164/600/600"],
    colors: [
      { name: "01 Ivory", value: "#f1e6d7" },
      { name: "02 Beige", value: "#e6d0b8" },
    ],
    sizes: [],
    stock: 70,
    rating: 4.7,
    reviewCount: 723,
    description: "Coverage buildable dengan hasil soft matte. Ringan dan nyaman untuk cuaca tropis.",
    specs: [
      { label: "Finish", value: "Soft matte" },
      { label: "SPF", value: "SPF 40 PA+++" },
    ],
  },
  {
    id: "5",
    slug: "eau-de-parfum-vanilla-musk",
    name: "Eau de Parfum Vanilla Musk 50ml",
    sku: "EDP-VM-50",
    category: "Fragrance",
    categorySlug: "fragrance",
    price: 349000,
    originalPrice: 429000,
    images: ["https://picsum.photos/id/165/600/600", "https://picsum.photos/id/166/600/600"],
    colors: [{ name: "Gold", value: "#d6b36c" }],
    sizes: [],
    stock: 36,
    rating: 4.7,
    reviewCount: 611,
    description: "Aroma hangat vanilla dengan musk lembut. Sillage elegan, cocok untuk day-to-night.",
    specs: [
      { label: "Notes", value: "Vanilla • Musk • Amber" },
      { label: "Ketahanan", value: "6–10 jam" },
    ],
  },
  {
    id: "6",
    slug: "shampoo-repair-silk-bloom",
    name: "Shampoo Repair Silk Bloom 300ml",
    sku: "SH-RP-300",
    category: "Hair",
    categorySlug: "hair",
    price: 129000,
    originalPrice: 159000,
    images: ["https://picsum.photos/id/167/600/600", "https://picsum.photos/id/168/600/600"],
    colors: [{ name: "Pearl", value: "#f6f2ee" }],
    sizes: [],
    stock: 64,
    rating: 4.6,
    reviewCount: 402,
    description: "Membersihkan lembut tanpa membuat rambut kering. Membantu rambut terasa halus dan berkilau.",
    specs: [
      { label: "Manfaat", value: "Repair • Shine • Soft" },
      { label: "Aroma", value: "Soft floral" },
    ],
  },
  {
    id: "7",
    slug: "body-lotion-soft-peony",
    name: "Body Lotion Soft Peony 250ml",
    sku: "BL-SP-250",
    category: "Body",
    categorySlug: "body",
    price: 99000,
    originalPrice: 129000,
    images: ["https://picsum.photos/id/169/600/600"],
    colors: [{ name: "Blush", value: "#f3d7d7" }],
    sizes: [],
    stock: 150,
    rating: 4.8,
    reviewCount: 1333,
    description: "Lotion ringan yang melembapkan, cepat meresap, dengan aroma peony yang clean dan soft.",
    specs: [
      { label: "Tekstur", value: "Light lotion, non-sticky" },
      { label: "Manfaat", value: "Hydration • Smooth" },
    ],
  },
  {
    id: "8",
    slug: "silk-blender-sponge-set",
    name: "Silk Blender Sponge Set (2 pcs)",
    sku: "TL-SP-2",
    category: "Tools",
    categorySlug: "tools",
    price: 69000,
    images: ["https://picsum.photos/id/170/600/600"],
    colors: [{ name: "Nude", value: "#e8d5c4" }],
    sizes: [],
    stock: 200,
    rating: 4.7,
    reviewCount: 877,
    description: "Sponge super lembut untuk base yang halus. Bisa dipakai kering atau basah.",
    specs: [
      { label: "Isi", value: "2 pcs" },
      { label: "Material", value: "Latex-free" },
    ],
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(categorySlug: string): Product[] {
  return products.filter((p) => p.categorySlug === categorySlug);
}

export function getFeaturedProducts(limit = 4): Product[] {
  return products.slice(0, limit);
}

export function getNewProducts(): Product[] {
  return products.filter((p) => p.isNew);
}
