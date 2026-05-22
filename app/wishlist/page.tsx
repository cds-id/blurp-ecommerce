"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { StorefrontLayout } from "@/src/components/storefront-layout";
import { Button } from "@/src/components/ui/button";
import { ProductCard } from "@/src/components/shared/product-card";
import { products } from "@/src/data/products";
import { useSimulatedLoading } from "@/src/hooks/use-simulated-loading";
import { ProductCardSkeleton } from "@/src/components/shared/skeleton";

const WISHLIST_STORAGE_KEY = "sorastore.wishlist.v1";

function readWishlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((s) => typeof s === "string")) {
      return parsed as string[];
    }
    return [];
  } catch {
    return [];
  }
}

function writeWishlist(ids: string[]) {
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(ids));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new StorageEvent("storage", { key: WISHLIST_STORAGE_KEY }));
    }
  } catch {
    // ignore
  }
}

function subscribeToWishlist(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (e: StorageEvent) => {
    if (e.key === null || e.key === WISHLIST_STORAGE_KEY) callback();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

let cachedSerialized: string | null = null;
let cachedValue: string[] = [];

function getWishlistSnapshot(): string[] {
  if (typeof window === "undefined") return cachedValue;
  try {
    const raw = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (raw === cachedSerialized) return cachedValue;
    cachedSerialized = raw;
    cachedValue = readWishlist();
    return cachedValue;
  } catch {
    return cachedValue;
  }
}

const getServerSnapshot = (): string[] | null => null;

function useWishlistIds(): string[] | null {
  return useSyncExternalStore(subscribeToWishlist, getWishlistSnapshot, getServerSnapshot);
}

export default function WishlistPage() {
  return (
    <StorefrontLayout mobileTitle="Wishlist">
      <WishlistView />
    </StorefrontLayout>
  );
}

function WishlistView() {
  const storedIds = useWishlistIds();
  const isLoading = useSimulatedLoading(700);

  useEffect(() => {
    const current = readWishlist();
    if (current.length === 0) {
      const seedIds = products.slice(0, 4).map((p) => p.id);
      writeWishlist(seedIds);
    }
  }, []);

  const items = useMemo(() => {
    if (storedIds === null) return [];
    return storedIds
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is (typeof products)[number] => Boolean(p));
  }, [storedIds]);

  const handleClear = () => {
    writeWishlist([]);
  };

  const showSkeleton = storedIds === null || isLoading;

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 md:px-6 py-6 md:py-10 max-w-6xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Wishlist</h1>
            <p className="text-sm text-muted mt-1">
              {showSkeleton
                ? "Memuat wishlist kamu…"
                : items.length === 0
                ? "Kamu belum menyimpan produk."
                : `${items.length} produk tersimpan.`}
            </p>
          </div>
          {!showSkeleton && items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full text-ink/70 hover:text-ink hidden md:inline-flex"
              onClick={handleClear}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Bersihkan semua
            </Button>
          )}
        </div>

        {showSkeleton ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyWishlist />
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            <div className="mt-6 sm:hidden flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full text-ink/70"
                onClick={handleClear}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Bersihkan semua
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function EmptyWishlist() {
  return (
    <div className="rounded-2xl border border-dashed border-hairline bg-surface-soft p-8 md:p-12 text-center">
      <div className="h-14 w-14 rounded-full bg-white border border-hairline flex items-center justify-center mx-auto mb-4">
        <Heart className="w-6 h-6 text-ink/60" />
      </div>
      <p className="text-base md:text-lg font-semibold text-ink">
        Wishlist kamu masih kosong
      </p>
      <p className="text-sm text-muted mt-1 max-w-sm mx-auto">
        Tap ikon hati pada produk untuk menyimpannya. Wishlist kamu tersimpan otomatis di
        browser ini.
      </p>
      <div className="mt-5">
        <Button asChild className="rounded-full h-11 px-6 font-semibold">
          <Link href="/store/catalog">
            <ShoppingBag className="w-4 h-4 mr-2" />
            Mulai belanja
          </Link>
        </Button>
      </div>
    </div>
  );
}
