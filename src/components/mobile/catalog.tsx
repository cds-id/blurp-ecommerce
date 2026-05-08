"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Checkbox } from "@/src/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/src/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Separator } from "@/src/components/ui/separator";
import { ProductCard, ProductCardSkeleton } from "@/src/components/shared";
import type { Category } from "@/src/data/categories";
import type { Product } from "@/src/data/products";
import type { ApiMeta } from "@/src/lib/api/types";

const sortOptions = [
  { value: "popular", label: "Terpopuler" },
  { value: "newest", label: "Terbaru" },
  { value: "price-asc", label: "Harga ↑" },
  { value: "price-desc", label: "Harga ↓" },
];

const sizes = ["S", "M", "L", "XL", "XXL"];

interface MobileCatalogProps {
  categories: Category[];
  products: Product[];
  selectedCategory?: string;
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

export function MobileCatalog({
  categories,
  products,
  selectedCategory,
  meta,
}: MobileCatalogProps) {
  const [sortBy, setSortBy] = useState("popular");
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const category = selectedCategory;

  const filtersDisabled = true;
  const activeFilterCount = category ? 1 : 0;
  const totalLabel = useMemo(() => {
    const total = meta?.total;
    if (typeof total === "number") return `${total} produk`;
    return `${products.length} produk`;
  }, [meta?.total, products.length]);

  return (
    <div className="bg-background">
      {/* Filter & Sort Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-hairline">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filter
              {activeFilterCount > 0 && (
                <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px]">
            <SheetHeader>
              <SheetTitle>Filter</SheetTitle>
            </SheetHeader>
            
            <div className="py-6 space-y-6">
              <div>
                <h4 className="font-medium mb-3">Kategori</h4>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <label
                      key={cat.id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Checkbox
                        checked={category === cat.slug}
                        onCheckedChange={() => {
                          const nextCategory = category === cat.slug ? undefined : cat.slug;
                          const next = setQueryParam(new URLSearchParams(sp), "category", nextCategory);
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
                <h4 className="font-medium mb-3">Ukuran</h4>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <Button
                      key={size}
                      variant={"outline"}
                      size="sm"
                      className="h-8 w-10"
                      onClick={() => {}}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
                {filtersDisabled && (
                  <p className="text-xs text-muted-foreground mt-2">Filter ukuran menunggu dukungan backend.</p>
                )}
              </div>
            </div>

            <SheetFooter className="flex-row gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  const next = new URLSearchParams(sp);
                  next.delete("category");
                  next.delete("page");
                  router.push(`${pathname}?${next.toString()}`);
                }}
              >
                Reset
              </Button>
              <SheetClose asChild>
                <Button className="flex-1">Terapkan</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        <Select value={sortBy} onValueChange={setSortBy} disabled>
          <SelectTrigger className="w-[130px] h-9">
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
      </div>

      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="px-4 py-2 flex flex-wrap gap-2 border-b border-hairline">
          {category ? (
            <Button
              key={category}
              variant="secondary"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={() => {
                const next = new URLSearchParams(sp);
                next.delete("category");
                next.delete("page");
                router.push(`${pathname}?${next.toString()}`);
              }}
            >
              {categories.find((c) => c.slug === category)?.name ?? category}
              <X className="h-3 w-3" />
            </Button>
          ) : null}
        </div>
      )}

      {/* Results Count */}
      <div className="px-4 py-2 text-xs text-muted-foreground">
        {totalLabel}
      </div>

      {/* Product Grid */}
      <div className="px-4 pb-4">
        {false ? (
          <div className="grid grid-cols-2 gap-3" aria-busy="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm">
              Tidak ada produk yang sesuai.
            </p>
            <Button
              variant="link"
              size="sm"
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
      </div>
    </div>
  );
}
