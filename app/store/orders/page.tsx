"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Package, ChevronRight, ArrowRight } from "lucide-react";
import { StorefrontLayout } from "@/src/components/storefront-layout";
import { Button } from "@/src/components/ui/button";
import { ordersApi } from "@/src/lib/api";
import type { OrderDetail } from "@/src/lib/api/orders";
import { useAuth } from "@/src/hooks/use-auth";
import { formatPrice } from "@/src/lib/utils";

export default function MyOrdersPage() {
  return (
    <StorefrontLayout mobileTitle="Pesanan saya">
      <MyOrdersView />
    </StorefrontLayout>
  );
}

function MyOrdersView() {
  const { isAuthenticated, isLoading } = useAuth();
  const [orders, setOrders] = useState<OrderDetail[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    (async () => {
      try {
        setError(null);
        const res = await ordersApi.listMyOrders();
        if (!cancelled) setOrders(res);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Gagal memuat pesanan");
          setOrders([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const rows = useMemo(() => orders ?? [], [orders]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-8 max-w-3xl">
        <div className="rounded-2xl border border-hairline bg-white p-6">Memuat...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-10 max-w-3xl">
        <div className="rounded-2xl border border-hairline bg-white p-6">
          <h1 className="text-xl font-semibold text-ink">Pesanan saya</h1>
          <p className="text-sm text-muted mt-1">
            Halaman ini khusus user login. Untuk guest, gunakan menu <b>Lacak pesanan</b>.
          </p>
          <div className="mt-4 flex gap-2">
            <Button asChild className="rounded-full h-11">
              <Link href="/login">Masuk</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full h-11 border-hairline">
              <Link href="/store/tracker">Lacak pesanan</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 max-w-3xl">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Pesanan saya</h1>
          <p className="text-sm text-muted mt-1">Daftar pesanan milik akun kamu.</p>
        </div>
        <Button asChild variant="outline" className="rounded-full h-11 border-hairline">
          <Link href="/store/tracker">
            Lacak pesanan
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-hairline bg-white p-5 text-sm text-red-600">{error}</div>
      ) : null}

      {orders === null ? (
        <div className="rounded-2xl border border-hairline bg-white p-6">Memuat pesanan...</div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-hairline bg-white p-8 text-center">
          <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-surface-soft flex items-center justify-center">
            <Package className="w-6 h-6 text-muted" />
          </div>
          <div className="text-lg font-semibold text-ink">Belum ada pesanan</div>
          <p className="text-sm text-muted mt-1">Yuk mulai belanja dulu.</p>
          <Button asChild className="mt-4 rounded-full h-11">
            <Link href="/store/catalog">Belanja</Link>
          </Button>
        </div>
      ) : (
        <ul className="rounded-2xl border border-hairline bg-white overflow-hidden divide-y divide-hairline">
          {rows.map((o) => (
            <li key={o.id} className="p-4 md:p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-wider text-muted">Order</div>
                  <div className="font-mono font-semibold text-ink truncate">{o.order_number || o.id}</div>
                  <div className="text-xs text-muted mt-1">
                    Status: <span className="text-ink/80 font-medium">{o.status}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs uppercase tracking-wider text-muted">Total</div>
                  <div className="text-base font-semibold tabular-nums text-ink">{formatPrice(o.total_idr ?? 0)}</div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="text-xs text-muted">
                  {o.items?.length ? `${o.items.length} item` : "—"}
                </div>
                <Link
                  href={`/store/order/${o.id}`}
                  className="text-sm font-semibold text-ink inline-flex items-center hover:underline underline-offset-2"
                >
                  Detail
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

