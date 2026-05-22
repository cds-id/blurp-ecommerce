"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ChevronRight, Trash2, ShoppingBag, ShieldCheck, Truck, Tag } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { QuantityPicker } from "@/src/components/shared";
import { useCart } from "@/src/components/shared/cart-provider";
import { formatPrice } from "@/src/lib/utils";
import { SafeImage } from "@/src/components/shared/safe-image";
import { Skeleton, CartItemSkeleton } from "@/src/components/shared/skeleton";
import { useSimulatedLoading } from "@/src/hooks/use-simulated-loading";

export function DesktopCart() {
  const cart = useCart();
  const isLoading = useSimulatedLoading(700);

  const items = useMemo(() => {
    return cart.lineItems.map((li) => ({
      key: li.cart_item_id,
      li,
    }));
  }, [cart.lineItems]);

  const subtotal = cart.subtotal;
  const totalUnits = cart.count;

  const updateQuantity = (cartItemId: string, quantity: number) => {
    void cart.setItemQuantity(cartItemId, quantity);
  };

  const removeItem = (cartItemId: string) => {
    void cart.removeItem(cartItemId);
  };

  const showSkeleton = !cart.isHydrated || isLoading;

  if (showSkeleton) {
    return (
      <div className="bg-background min-h-screen">
        <div className="store-container pt-6">
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="store-container pt-4 pb-12">
          <div className="flex items-end justify-between mb-6">
            <div className="space-y-2">
              <Skeleton className="h-9 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="grid grid-cols-[1fr_380px] gap-8">
            <div className="rounded-2xl border border-hairline bg-card p-5 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <CartItemSkeleton key={i} />
              ))}
            </div>
            <aside className="space-y-4">
              <div className="rounded-2xl border border-hairline bg-card p-6 space-y-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-px w-full" />
                <Skeleton className="h-9 w-1/2 ml-auto" />
                <Skeleton className="h-12 w-full rounded-full" />
              </div>
            </aside>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-background min-h-screen">
        <div className="store-container pt-6">
          <nav className="flex items-center text-sm text-muted">
            <Link href="/" className="hover:text-ink transition-colors">Beranda</Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-ink font-medium">Keranjang</span>
          </nav>
        </div>
        <div className="store-container py-20 text-center">
          <div className="mx-auto mb-5 h-20 w-20 rounded-full bg-surface-soft flex items-center justify-center">
            <ShoppingBag className="h-9 w-9 text-muted" />
          </div>
          <h1 className="text-2xl font-semibold mb-2">Keranjang masih kosong</h1>
          <p className="text-muted mb-6 max-w-md mx-auto">
            Yuk pilih produk favorit kamu. Kami juga punya rekomendasi best seller untuk kamu mulai.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button asChild size="lg" className="rounded-full px-6">
              <Link href="/store/catalog">Mulai belanja</Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="rounded-full">
              <Link href="/wishlist">Lihat wishlist</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="store-container pt-6">
        <nav className="flex items-center text-sm text-muted">
          <Link href="/" className="hover:text-ink transition-colors">Beranda</Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-ink font-medium">Keranjang</span>
        </nav>
      </div>

      <div className="store-container pt-4 pb-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Keranjang</h1>
            <p className="text-sm text-muted mt-1">
              {totalUnits > 0
                ? `${totalUnits} barang siap dibawa pulang`
                : "Belum ada barang"}
            </p>
          </div>
          <Link
            href="/store/catalog"
            className="text-sm font-medium text-ink/70 hover:text-ink transition-colors"
          >
            ← Lanjut belanja
          </Link>
        </div>

        <div className="grid grid-cols-[1fr_380px] gap-8">
          {/* Cart Items */}
          <div className="rounded-2xl border border-hairline bg-card overflow-hidden">
            <ul className="divide-y divide-hairline">
              {items.map((item) => (
                <li key={item.key} className="p-5 flex gap-5">
                  <Link
                    href={`/store/product/${item.li.product_id}`}
                    className="h-28 w-28 rounded-xl overflow-hidden bg-surface-soft flex-shrink-0"
                  >
                    <SafeImage
                      src={item.li.image_url ?? ""}
                      alt={item.li.product_name ?? "Produk"}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </Link>

                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-start gap-4">
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/store/product/${item.li.product_id}`}
                          className="text-base font-semibold text-ink hover:underline underline-offset-2 line-clamp-2"
                        >
                          {item.li.product_name}
                        </Link>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-soft border border-hairline text-ink/70">
                            {item.li.variant_name}
                          </span>
                          <span className="text-muted">
                            SKU {item.li.sku}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-semibold text-ink tabular-nums">
                          {formatPrice(item.li.subtotal_idr)}
                        </div>
                        {item.li.quantity > 1 && (
                          <div className="text-xs text-muted tabular-nums mt-0.5">
                            {formatPrice(item.li.price_idr)} × {item.li.quantity}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-auto pt-4 flex items-center justify-between">
                      <QuantityPicker
                        value={item.li.quantity}
                        onChange={(qty) => updateQuantity(item.li.cart_item_id, qty)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted hover:text-destructive rounded-full"
                        onClick={() => removeItem(item.li.cart_item_id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1.5" />
                        Hapus
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Order Summary */}
          <aside className="h-fit sticky top-24 space-y-4">
            <div className="rounded-2xl border border-hairline bg-card p-6">
              <h2 className="font-semibold text-lg">Ringkasan</h2>

              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted">Subtotal ({totalUnits} barang)</dt>
                  <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Ongkir</dt>
                  <dd className="text-muted">Dihitung di checkout</dd>
                </div>
              </dl>

              <div className="my-4 h-px bg-hairline" />

              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted">Total</span>
                <span className="text-2xl font-semibold tabular-nums">
                  {formatPrice(subtotal)}
                </span>
              </div>

              <Button
                className="w-full mt-5 rounded-full h-12 text-sm font-semibold"
                disabled={items.length === 0}
                asChild
              >
                <Link href="/store/checkout">
                  Lanjut ke checkout
                </Link>
              </Button>

              <p className="mt-3 text-caption-2xs text-muted text-center leading-relaxed">
                Harga sudah termasuk pajak. Ongkir & promo dihitung di langkah berikutnya.
              </p>
            </div>

            <div className="rounded-2xl border border-hairline bg-surface-soft p-5">
              <ul className="space-y-3 text-sm text-ink/80">
                <li className="flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 mt-0.5 text-ink/70" />
                  <div>
                    <div className="font-medium text-ink">Pembayaran aman</div>
                    <div className="text-xs text-muted">Diproses melalui Xendit, terenkripsi.</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Truck className="w-4 h-4 mt-0.5 text-ink/70" />
                  <div>
                    <div className="font-medium text-ink">Gratis ongkir</div>
                    <div className="text-xs text-muted">Otomatis untuk pembelian Rp 200rb+.</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Tag className="w-4 h-4 mt-0.5 text-ink/70" />
                  <div>
                    <div className="font-medium text-ink">Punya kode promo?</div>
                    <div className="text-xs text-muted">Bisa dipakai di langkah pembayaran.</div>
                  </div>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
