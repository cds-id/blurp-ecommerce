"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, Grid3X3, List } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Separator } from "@/src/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { ProductCard, ProductCardSkeleton } from "@/src/components/shared";
import type { Category } from "@/src/data/categories";
import type { Product } from "@/src/data/products";
import type { ApiMeta } from "@/src/lib/api/types";

const sortOptions = [
  { value: "popular", label: "Terpopuler" },
  { value: "newest", label: "Terbaru" },
  { value: "price_asc", label: "Harga: Rendah ke Tinggi" },
  { value: "price_desc", label: "Harga: Tinggi ke Rendah" },
];

const sizes = ["S", "M", "L", "XL", "XXL"];

interface DesktopCatalogProps {
  categories: Category[];
  products: Product[];
  selectedCategory?: string;
  selectedCategories?: string[];
  searchQuery?: string;
  meta?: ApiMeta | null;
}

function setQueryParam(
  params: URLSearchParams,
  key: string,
  value: string | undefined,
): URLSearchParams {
  const next = new URLSearchParams(params);
  if (!value) next.delete(key);
  else next.set(key, value);
  return next;
}

export function DesktopCatalog({
  categories,
  products,
  selectedCategory,
  selectedCategories,
  meta,
}: DesktopCatalogProps) {
  const sp = useSearchParams();
  const sortBy = sp.get("sort") ?? "popular";
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const router = useRouter();
  const pathname = usePathname();
  const category = selectedCategory;
  const categorySet = useMemo(() => new Set(selectedCategories ?? (category ? [category] : [])), [category, selectedCategories]);

  const selectedSize = sp.get("size") ?? "";
  const minPrice = sp.get("min_price_idr") ?? "";
  const maxPrice = sp.get("max_price_idr") ?? "";

  const totalLabel = useMemo(() => {
    const total = meta?.total;
    if (typeof total === "number") return `${total} produk ditemukan`;
    return `${products.length} produk ditemukan`;
  }, [meta?.total, products.length]);

  const filtersDisabled = false;

  return (
    <div className="bg-background min-h-screen">
      {/* Breadcrumb */}
      <div className="container mx-auto px-6 py-4">
        <nav className="flex items-center text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            Beranda
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-foreground font-medium">Katalog</span>
        </nav>
      </div>

      <div className="container mx-auto px-6 pb-12">
        <div className="grid grid-cols-[240px_1fr] gap-8">
          {/* Sidebar Filters */}
          <aside className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Kategori</h3>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <label
                    key={cat.id}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Checkbox
                      checked={categorySet.has(cat.slug)}
                      onCheckedChange={() => {
                        const next = new URLSearchParams(sp);
                        const existing = next.getAll("category");
                        const has = existing.includes(cat.slug);
                        next.delete("category");
                        const after = has ? existing.filter((x) => x !== cat.slug) : [...existing, cat.slug];
                        for (const slug of after) next.append("category", slug);
                        next.delete("page");
                        router.push(`${pathname}?${next.toString()}`);
                      }}
                    />
                    <span className="text-sm">{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <Separator />

            <div className={filtersDisabled ? "opacity-50 pointer-events-none" : ""}>
              <h3 className="font-semibold mb-3">Ukuran</h3>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? "secondary" : "outline"}
                    size="sm"
                    className="h-8 w-10"
                    onClick={() => {
                      const next = new URLSearchParams(sp);
                      if (selectedSize === size) next.delete("size");
                      else next.set("size", size);
                      next.delete("page");
                      // backend expects repeated `attribute=key:value`
                      next.delete("attribute");
                      const sz = next.get("size");
                      if (sz) next.append("attribute", `size:${sz}`);
                      router.push(`${pathname}?${next.toString()}`);
                    }}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            <div className={filtersDisabled ? "opacity-50 pointer-events-none" : ""}>
              <h3 className="font-semibold mb-3">Harga</h3>
              <div className="space-y-2 text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={minPrice === "" && maxPrice === "100000"}
                    onCheckedChange={() => {
                      const next = new URLSearchParams(sp);
                      const isOn = minPrice === "" && maxPrice === "100000";
                      next.delete("min_price_idr");
                      next.delete("max_price_idr");
                      if (!isOn) next.set("max_price_idr", "100000");
                      next.delete("page");
                      router.push(`${pathname}?${next.toString()}`);
                    }}
                  />
                  <span>Di bawah Rp 100rb</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={minPrice === "100000" && maxPrice === "300000"}
                    onCheckedChange={() => {
                      const next = new URLSearchParams(sp);
                      const isOn = minPrice === "100000" && maxPrice === "300000";
                      next.delete("min_price_idr");
                      next.delete("max_price_idr");
                      if (!isOn) {
                        next.set("min_price_idr", "100000");
                        next.set("max_price_idr", "300000");
                      }
                      next.delete("page");
                      router.push(`${pathname}?${next.toString()}`);
                    }}
                  />
                  <span>Rp 100rb - 300rb</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={minPrice === "300000" && maxPrice === "500000"}
                    onCheckedChange={() => {
                      const next = new URLSearchParams(sp);
                      const isOn = minPrice === "300000" && maxPrice === "500000";
                      next.delete("min_price_idr");
                      next.delete("max_price_idr");
                      if (!isOn) {
                        next.set("min_price_idr", "300000");
                        next.set("max_price_idr", "500000");
                      }
                      next.delete("page");
                      router.push(`${pathname}?${next.toString()}`);
                    }}
                  />
                  <span>Rp 300rb - 500rb</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={minPrice === "500000" && maxPrice === ""}
                    onCheckedChange={() => {
                      const next = new URLSearchParams(sp);
                      const isOn = minPrice === "500000" && maxPrice === "";
                      next.delete("min_price_idr");
                      next.delete("max_price_idr");
                      if (!isOn) next.set("min_price_idr", "500000");
                      next.delete("page");
                      router.push(`${pathname}?${next.toString()}`);
                    }}
                  />
                  <span>Di atas Rp 500rb</span>
                </label>
              </div>
            </div>

            <Separator />

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                const next = new URLSearchParams(sp);
                next.delete("category");
                next.delete("size");
                next.delete("attribute");
                next.delete("min_price_idr");
                next.delete("max_price_idr");
                next.delete("sort");
                next.delete("page");
                router.push(`${pathname}?${next.toString()}`);
              }}
            >
              Reset Filter
            </Button>
          </aside>

          {/* Product Grid */}
          <main>
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                {totalLabel}
              </p>
              <div className="flex items-center gap-4">
                <Select
                  value={sortBy}
                  onValueChange={(v) => {
                    const next = setQueryParam(new URLSearchParams(sp), "sort", v);
                    next.delete("page");
                    router.push(`${pathname}?${next.toString()}`);
                  }}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex border rounded-md">
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="icon"
                    className="rounded-none rounded-l-md"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="icon"
                    className="rounded-none rounded-r-md"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Products */}
            {false ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-3 gap-6"
                    : "grid grid-cols-1 gap-4"
                }
                aria-busy="true"
              >
                {Array.from({ length: 9 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-3 gap-6"
                    : "grid grid-cols-1 gap-4"
                }
              >
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Tidak ada produk yang sesuai filter.
                </p>
                <Button
                  variant="link"
                  onClick={() => {
                    const next = new URLSearchParams(sp);
                    next.delete("category");
                    next.delete("page");
                    router.push(`${pathname}?${next.toString()}`);
                  }}
                >
                  Reset filter
                </Button>
              </div>
            )}

            {/* Pagination */}
            {typeof meta?.page === "number" &&
              typeof meta?.total_pages === "number" &&
              meta.total_pages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={meta.page <= 1}
                    onClick={() => {
                      const nextPage = Math.max(1, (meta.page ?? 1) - 1);
                      const next = setQueryParam(new URLSearchParams(sp), "page", String(nextPage));
                      router.push(`${pathname}?${next.toString()}`);
                    }}
                  >
                    ‹
                  </Button>
                  <Button variant="default" size="sm" disabled>
                    {meta.page}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={meta.page >= meta.total_pages}
                    onClick={() => {
                      const nextPage = Math.min(meta.total_pages ?? 1, (meta.page ?? 1) + 1);
                      const next = setQueryParam(new URLSearchParams(sp), "page", String(nextPage));
                      router.push(`${pathname}?${next.toString()}`);
                    }}
                  >
                    ›
                  </Button>
                </div>
              )}
          </main>
        </div>
      </div>
    </div>
  );
}
