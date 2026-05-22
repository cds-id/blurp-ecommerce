"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Trash2, ShoppingBag, ChevronRight, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { QuantityPicker } from "@/src/components/shared";
import { useCart } from "@/src/components/shared/cart-provider";
import { formatPrice } from "@/src/lib/utils";
import { SafeImage } from "@/src/components/shared/safe-image";
import { CartItemSkeleton, Skeleton } from "@/src/components/shared/skeleton";
import { useSimulatedLoading } from "@/src/hooks/use-simulated-loading";

export function MobileCart() {
  const cart = useCart();
  const isLoading = useSimulatedLoading(700);

  const items = useMemo(() => {
    return cart.lineItems.map((li) => ({ key: li.cart_item_id, li }));
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
      <div className="bg-background pb-44">
        <div className="px-4 pt-3 pb-2 flex items-center justify-between">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <ul className="px-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <li key={i}>
              <CartItemSkeleton />
            </li>
          ))}
        </ul>
        <div className="mx-4 mt-4 rounded-2xl border border-hairline bg-surface-soft p-4 space-y-2">
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="px-6 pt-12 pb-20 text-center">
        <div className="mx-auto mb-5 h-20 w-20 rounded-full bg-surface-soft flex items-center justify-center">
          <ShoppingBag className="h-9 w-9 text-muted" />
        </div>
        <h1 className="text-xl font-semibold mb-2">Keranjang masih kosong</h1>
        <p className="text-sm text-muted mb-6">
          Yuk pilih produk favorit kamu di katalog.
        </p>
        <Button asChild className="rounded-full px-6 h-11" size="lg">
          <Link href="/store/catalog">Mulai belanja</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-background pb-44">
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Keranjang</h1>
        <span className="text-xs text-muted">
          {totalUnits} barang
        </span>
      </div>

      <ul className="px-4 space-y-3">
        {items.map((item) => (
          <li
            key={item.key}
            className="rounded-2xl border border-hairline bg-card p-3"
          >
            <div className="flex gap-3">
              <Link
                href={`/store/product/${item.li.product_id}`}
                className="h-20 w-20 bg-surface-soft rounded-xl overflow-hidden flex-shrink-0"
              >
                <SafeImage
                  src={item.li.image_url ?? ""}
                  alt={item.li.product_name ?? "Produk"}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </Link>

              <div className="flex-1 min-w-0">
                <Link
                  href={`/store/product/${item.li.product_id}`}
                  className="text-sm font-medium text-ink line-clamp-2"
                >
                  {item.li.product_name}
                </Link>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-caption-2xs text-muted">
                  <span className="px-1.5 py-0.5 rounded-full bg-surface-soft border border-hairline text-ink/70">
                    {item.li.variant_name}
                  </span>
                </div>
                <div className="mt-1 text-sm font-semibold tabular-nums">
                  {formatPrice(item.li.subtotal_idr)}
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                className="h-10 min-h-11 rounded-full text-muted hover:text-destructive px-3"
                onClick={() => removeItem(item.li.cart_item_id)}
              >
                <Trash2 className="h-4 w-4 mr-1.5" />
                Hapus
              </Button>
              <QuantityPicker
                value={item.li.quantity}
                onChange={(qty) => updateQuantity(item.li.cart_item_id, qty)}
              />
            </div>
          </li>
        ))}
      </ul>

      <div className="mx-4 mt-4 rounded-2xl border border-hairline bg-surface-soft p-4">
        <div className="grid grid-cols-2 gap-3 text-xs text-ink/80">
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 mt-0.5 text-ink/70" />
            <div>
              <div className="font-medium text-ink">Pembayaran aman</div>
              <div className="text-muted">Via Xendit</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Truck className="w-4 h-4 mt-0.5 text-ink/70" />
            <div>
              <div className="font-medium text-ink">Gratis ongkir</div>
              <div className="text-muted">Min. Rp 200rb</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-4 mt-4">
        <Link
          href="/store/catalog"
          className="block text-center text-sm font-medium text-ink/70 hover:text-ink py-3"
        >
          ← Lanjut belanja
        </Link>
      </div>

      {/* Sticky Bottom Checkout Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-hairline px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] z-40 shadow-sticky-bar">
        <div className="flex items-baseline justify-between mb-3">
          <span className="text-xs text-muted">Total ({totalUnits} barang)</span>
          <span className="text-lg font-semibold tabular-nums">{formatPrice(subtotal)}</span>
        </div>
        <Button
          className="w-full h-12 rounded-full text-sm font-semibold"
          disabled={items.length === 0}
          asChild
        >
          <Link href="/store/checkout">
            Checkout
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
