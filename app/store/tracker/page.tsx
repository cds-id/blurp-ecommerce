"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  CreditCard,
  ClipboardList,
  ShoppingBag,
  ArrowRight,
  MessageCircle,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { cn, formatPrice } from "@/src/lib/utils";
import {
  mockOrders,
  useLastOrder,
  type MockOrder,
  type MockOrderStatus,
} from "@/src/data/mock-orders";
import { TimelineStepSkeleton, Skeleton } from "@/src/components/shared/skeleton";
import { ordersApi } from "@/src/lib/api";
import type { OrderDetail } from "@/src/lib/api/orders";
import { ApiError } from "@/src/lib/api/types";

/** Map backend order.status → tracker timeline step. */
function mapBackendStatus(s: string): MockOrderStatus {
  switch (s) {
    case "pending":
      return "created";
    case "processing":
    case "paid":
      return "paid";
    case "packed":
      return "packed";
    case "shipped":
      return "shipped";
    case "completed":
    case "delivered":
      return "delivered";
    case "cancelled":
    case "canceled":
    case "failed":
    case "refunded":
      return "cancelled";
    default:
      return "created";
  }
}

function normalizePhone(input: string) {
  return input.replace(/[^\d]/g, "");
}

const statusSteps: Array<{
  id: MockOrderStatus;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    id: "created",
    label: "Pesanan dibuat",
    description: "Order ID sudah terbentuk dan menunggu pembayaran.",
    icon: ClipboardList,
  },
  {
    id: "paid",
    label: "Pembayaran diterima",
    description: "Pembayaran kamu sudah kami konfirmasi.",
    icon: CreditCard,
  },
  {
    id: "packed",
    label: "Sedang dikemas",
    description: "Tim gudang sedang menyiapkan pesanan.",
    icon: Package,
  },
  {
    id: "shipped",
    label: "Dikirim",
    description: "Paket dalam perjalanan menuju alamat.",
    icon: Truck,
  },
  {
    id: "delivered",
    label: "Sampai tujuan",
    description: "Pesanan kamu telah diterima.",
    icon: CheckCircle2,
  },
];

const statusRank: Record<MockOrderStatus, number> = {
  created: 0,
  paid: 1,
  packed: 2,
  shipped: 3,
  delivered: 4,
  cancelled: -1, // not on the timeline; renders distinct banner
};

function findOrder(
  orderId: string,
  phone: string,
  lastOrder: MockOrder | null
): MockOrder | null {
  const id = orderId.trim().toUpperCase();
  const p = normalizePhone(phone);
  if (!id || !p) return null;

  if (lastOrder && lastOrder.id.toUpperCase() === id && normalizePhone(lastOrder.phone) === p) {
    return lastOrder;
  }

  return (
    mockOrders.find((o) => o.id.toUpperCase() === id && normalizePhone(o.phone) === p) ?? null
  );
}

export default function TrackerPage() {
  return (
    <Suspense fallback={<TrackerLoading />}>
      <TrackerInner />
    </Suspense>
  );
}

function TrackerLoading() {
  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 md:px-6 py-10 max-w-3xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
    </div>
  );
}

function TrackerInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  if (token) return <TokenTracker token={token} />;
  return <ManualTracker />;
}

function ManualTracker() {
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [searchToken, setSearchToken] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const lastOrder = useLastOrder();

  useEffect(() => {
    if (searchToken === 0) return;
    const t = setTimeout(() => setIsSearching(false), 800);
    return () => clearTimeout(t);
  }, [searchToken]);

  const result = useMemo(() => {
    if (!submitted) return null;
    return findOrder(orderId, phone, lastOrder);
  }, [orderId, phone, submitted, lastOrder]);

  const handleSearch = () => {
    setSubmitted(true);
    setIsSearching(true);
    setSearchToken((n) => n + 1);
  };

  const handleReset = () => {
    setSubmitted(false);
    setIsSearching(false);
    setOrderId("");
    setPhone("");
  };

  const showSearching = submitted && isSearching;
  const showNotFound = submitted && !isSearching && !result;

  const onPrefillLast = () => {
    if (!lastOrder) return;
    setOrderId(lastOrder.id);
    setPhone(lastOrder.phone);
    setSubmitted(true);
    setIsSearching(true);
    setSearchToken((n) => n + 1);
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 md:px-6 py-6 md:py-10 max-w-3xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              Lacak Pesanan
            </h1>
            <p className="text-sm text-muted mt-1">
              Masukkan <span className="font-medium text-ink">Order ID</span> dan{" "}
              <span className="font-medium text-ink">No. HP</span> yang kamu pakai saat checkout.
            </p>
          </div>
          <Button
            asChild
            variant="outline"
            className="rounded-full border-hairline shrink-0 hidden md:inline-flex"
          >
            <Link href="/store/catalog">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Belanja
            </Link>
          </Button>
        </div>

        {/* Search card */}
        <div className="rounded-2xl border border-hairline bg-white p-5 md:p-6 space-y-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider text-muted font-medium">
                Order ID
              </label>
              <Input
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="ORD-12345"
                className="h-11 rounded-xl border-hairline"
              />
              <p className="text-caption-2xs text-muted">Diawali dengan ORD-.</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider text-muted font-medium">
                No. HP (WhatsApp)
              </label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08123456789"
                inputMode="numeric"
                className="h-11 rounded-xl border-hairline"
              />
              <p className="text-caption-2xs text-muted">Sama dengan saat checkout.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              className="flex-1 rounded-full h-11 font-semibold"
              onClick={handleSearch}
              disabled={!orderId.trim() || !normalizePhone(phone)}
            >
              <Search className="h-4 w-4 mr-2" />
              Cari pesanan
            </Button>
            <Button
              variant="outline"
              className="rounded-full h-11 border-hairline sm:w-32"
              onClick={handleReset}
            >
              Reset
            </Button>
          </div>

          {lastOrder && (
            <button
              type="button"
              onClick={onPrefillLast}
              className="w-full text-left rounded-xl border border-hairline bg-surface-soft px-4 py-3 hover:bg-surface-strong transition-colors flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="text-xs text-muted">Pesanan terakhir kamu</p>
                <p className="text-sm font-semibold text-ink truncate">
                  {lastOrder.id} · {formatPrice(lastOrder.total)}
                </p>
              </div>
              <span className="inline-flex items-center text-xs font-medium text-ink shrink-0">
                Pakai ini
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </span>
            </button>
          )}

          <p className="text-xs text-muted">
            Ini tracker demo (mock). Untuk alur checkout demo, Order ID dan nomor HP terakhir
            tersimpan di browser kamu.
          </p>
        </div>

        {/* Searching skeleton */}
        {showSearching && (
          <div className="mt-6 space-y-4" aria-busy="true">
            <div className="rounded-2xl border border-hairline bg-white p-5 md:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-6 w-32" />
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-3 w-12 ml-auto" />
                  <Skeleton className="h-6 w-24 ml-auto" />
                </div>
              </div>
              <Skeleton className="h-3 w-40 mt-3" />
            </div>
            <div className="rounded-2xl border border-hairline bg-white p-5 md:p-6 space-y-5">
              <Skeleton className="h-5 w-40" />
              {Array.from({ length: 4 }).map((_, i) => (
                <TimelineStepSkeleton key={i} />
              ))}
            </div>
          </div>
        )}

        {/* Not found */}
        {showNotFound && (
          <div className="mt-6 rounded-2xl border border-hairline bg-white p-5 md:p-6">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-50 ring-4 ring-amber-100/60 flex items-center justify-center shrink-0">
                <Search className="w-5 h-5 text-amber-600" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-ink">Pesanan tidak ditemukan</p>
                <p className="text-sm text-muted mt-1">
                  Periksa kembali Order ID dan nomor HP. Jika baru saja checkout, pastikan kamu
                  pakai nomor HP yang sama.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="rounded-full border-hairline"
                  >
                    <Link href="/kontak">
                      <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                      Hubungi CS
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Result */}
        {result && !showSearching && (
          <div className="mt-6 space-y-4">
            {/* Summary */}
            <div className="rounded-2xl border border-hairline bg-white p-5 md:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wider text-muted mb-1">
                    Nomor pesanan
                  </p>
                  <p className="font-mono font-semibold text-lg md:text-xl text-ink">
                    {result.id}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs uppercase tracking-wider text-muted mb-1">Total</p>
                  <p className="font-semibold tabular-nums text-lg md:text-xl text-ink">
                    {formatPrice(result.total)}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted mt-3">
                Dibuat: {new Date(result.createdAt).toLocaleString("id-ID")}
              </p>
            </div>

            {/* Status: cancelled banner OR timeline */}
            {result.status === "cancelled" ? (
              <CancelledBanner />
            ) : (
            <div className="rounded-2xl border border-hairline bg-white p-5 md:p-6">
              <h2 className="font-semibold text-base md:text-lg mb-1">Status pesanan</h2>
              <p className="text-xs text-muted mb-5">
                Update otomatis akan dikirim ke email & WhatsApp kamu.
              </p>
              <ol className="space-y-5">
                {statusSteps.map((s, idx) => {
                  const Icon = s.icon;
                  const currentIdx = statusRank[result.status];
                  const isDone = idx < currentIdx;
                  const isCurrent = idx === currentIdx;
                  const isLast = idx === statusSteps.length - 1;
                  return (
                    <li key={s.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={cn(
                            "h-9 w-9 rounded-full flex items-center justify-center transition-colors",
                            isDone
                              ? "bg-ink text-white"
                              : isCurrent
                              ? "bg-primary text-primary-foreground"
                              : "bg-surface-soft text-muted border border-hairline"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        {!isLast && (
                          <div
                            className={cn(
                              "w-px flex-1 mt-1",
                              isDone ? "bg-ink" : "bg-hairline"
                            )}
                          />
                        )}
                      </div>
                      <div className="pb-3 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p
                            className={cn(
                              "text-sm font-semibold",
                              isCurrent
                                ? "text-ink"
                                : isDone
                                ? "text-ink/80"
                                : "text-muted"
                            )}
                          >
                            {s.label}
                          </p>
                          {isCurrent && (
                            <span className="text-micro font-semibold uppercase tracking-wider rounded-full bg-primary/10 text-primary px-2 py-0.5">
                              Saat ini
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted mt-0.5">{s.description}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-full h-11 border-hairline"
                asChild
              >
                <Link href="/store/catalog">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Lanjut belanja
                </Link>
              </Button>
              <Button className="flex-1 rounded-full h-11" asChild>
                <Link href="/kontak">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Tanya CS
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Empty state when not submitted */}
        {!submitted && !result && (
          <div className="mt-6 rounded-2xl border border-dashed border-hairline bg-surface-soft p-6 text-center">
            <div className="h-12 w-12 rounded-full bg-white border border-hairline flex items-center justify-center mx-auto mb-3">
              <Package className="w-5 h-5 text-ink/60" />
            </div>
            <p className="text-sm text-ink font-medium">Belum ada pesanan dilacak</p>
            <p className="text-xs text-muted mt-1">
              Status & timeline akan muncul di sini setelah kamu cari pesanan.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Shared status renderers ────────────────────────────────────

function CancelledBanner({ note }: { note?: string | null }) {
  return (
    <div className="rounded-2xl border border-hairline bg-white p-5 md:p-6">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-full bg-red-50 ring-4 ring-red-100/60 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5 text-red-600" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-ink">Pesanan dibatalkan</p>
          <p className="text-sm text-muted mt-1">
            {note ??
              "Pesanan ini sudah dibatalkan. Stok telah dikembalikan. Jika kamu sudah membayar, dana akan direfund sesuai kebijakan."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-full border-hairline"
            >
              <Link href="/store/catalog">
                <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
                Belanja lagi
              </Link>
            </Button>
            <Button asChild size="sm" className="rounded-full">
              <Link href="/kontak">
                <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                Hubungi CS
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Token-mode tracker (real backend) ──────────────────────────

type TokenState =
  | { kind: "loading" }
  | { kind: "ok"; order: OrderDetail }
  | { kind: "error"; message: string; status?: number };

function TokenTracker({ token }: { token: string }) {
  const [state, setState] = useState<TokenState>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await ordersApi.guestOrderLookup(token);
        if (!cancelled) setState({ kind: "ok", order: res });
      } catch (e) {
        if (cancelled) return;
        if (e instanceof ApiError) {
          setState({ kind: "error", message: e.message, status: e.status });
        } else {
          setState({
            kind: "error",
            message: e instanceof Error ? e.message : "Gagal memuat pesanan.",
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const loading = state.kind === "loading";
  const error = state.kind === "error" ? state : null;
  const order = state.kind === "ok" ? state.order : null;

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 md:px-6 py-6 md:py-10 max-w-3xl">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              Lacak Pesanan
            </h1>
            <p className="text-sm text-muted mt-1">
              Mengakses pesanan via link pelacakan.
            </p>
          </div>
          <Button
            asChild
            variant="outline"
            className="rounded-full border-hairline shrink-0 hidden md:inline-flex"
          >
            <Link href="/store/catalog">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Belanja
            </Link>
          </Button>
        </div>

        {loading && (
          <div className="space-y-4" aria-busy="true">
            <div className="rounded-2xl border border-hairline bg-white p-5 md:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-6 w-32" />
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-3 w-12 ml-auto" />
                  <Skeleton className="h-6 w-24 ml-auto" />
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-hairline bg-white p-5 md:p-6 space-y-5">
              <Skeleton className="h-5 w-40" />
              {Array.from({ length: 4 }).map((_, i) => (
                <TimelineStepSkeleton key={i} />
              ))}
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-hairline bg-white p-5 md:p-6">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-50 ring-4 ring-amber-100/60 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-ink">
                  {error.status === 404
                    ? "Link pelacakan tidak valid"
                    : error.status === 401 || error.status === 403
                    ? "Link sudah kedaluwarsa"
                    : "Gagal memuat pesanan"}
                </p>
                <p className="text-sm text-muted mt-1">
                  {error.status === 404
                    ? "Token pelacakan tidak ditemukan. Periksa ulang link dari email."
                    : error.status === 401 || error.status === 403
                    ? "Link pelacakan kedaluwarsa setelah 30 hari. Hubungi CS untuk bantuan."
                    : error.message}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="rounded-full border-hairline"
                  >
                    <Link href="/store/tracker">
                      Cari manual
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    className="rounded-full"
                  >
                    <Link href="/kontak">
                      <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                      Hubungi CS
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && order && <TokenOrderDetail order={order} />}
      </div>
    </div>
  );
}

function TokenOrderDetail({ order }: { order: OrderDetail }) {
  const status = mapBackendStatus(order.status);
  const currentIdx = statusRank[status];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-hairline bg-white p-5 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wider text-muted mb-1">Nomor pesanan</p>
            <p className="font-mono font-semibold text-lg md:text-xl text-ink">
              {order.order_number}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs uppercase tracking-wider text-muted mb-1">Total</p>
            <p className="font-semibold tabular-nums text-lg md:text-xl text-ink">
              {formatPrice(order.total_idr)}
            </p>
          </div>
        </div>
        {order.created_at && (
          <p className="text-xs text-muted mt-3">
            Dibuat: {new Date(order.created_at).toLocaleString("id-ID")}
          </p>
        )}
        <p className="text-caption-2xs text-muted mt-1">
          Status backend: <span className="font-medium text-ink/70">{order.status}</span>
        </p>
      </div>

      {status === "cancelled" ? (
        <CancelledBanner note={order.notes ?? null} />
      ) : (
      <div className="rounded-2xl border border-hairline bg-white p-5 md:p-6">
        <h2 className="font-semibold text-base md:text-lg mb-1">Status pesanan</h2>
        <p className="text-xs text-muted mb-5">
          Update otomatis akan dikirim ke email kamu.
        </p>
        <ol className="space-y-5">
          {statusSteps.map((s, idx) => {
            const Icon = s.icon;
            const isDone = idx < currentIdx;
            const isCurrent = idx === currentIdx;
            const isLast = idx === statusSteps.length - 1;
            return (
              <li key={s.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "h-9 w-9 rounded-full flex items-center justify-center transition-colors",
                      isDone
                        ? "bg-ink text-white"
                        : isCurrent
                        ? "bg-primary text-primary-foreground"
                        : "bg-surface-soft text-muted border border-hairline",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  {!isLast && (
                    <div
                      className={cn(
                        "w-px flex-1 mt-1",
                        isDone ? "bg-ink" : "bg-hairline",
                      )}
                    />
                  )}
                </div>
                <div className="pb-3 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        isCurrent
                          ? "text-ink"
                          : isDone
                          ? "text-ink/80"
                          : "text-muted",
                      )}
                    >
                      {s.label}
                    </p>
                    {isCurrent && (
                      <span className="text-micro font-semibold uppercase tracking-wider rounded-full bg-primary/10 text-primary px-2 py-0.5">
                        Saat ini
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted mt-0.5">{s.description}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
      )}

      {order.items.length > 0 && (
        <div className="rounded-2xl border border-hairline bg-white p-5 md:p-6">
          <h2 className="font-semibold text-base md:text-lg mb-3">Item</h2>
          <ul className="divide-y divide-hairline">
            {order.items.map((it) => (
              <li key={it.id} className="py-3 flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink line-clamp-1">
                    {it.product_name}
                  </p>
                  <p className="text-caption-2xs text-muted">
                    {it.variant_name} · {it.quantity}×
                  </p>
                </div>
                <span className="text-sm font-semibold tabular-nums">
                  {formatPrice(it.subtotal_idr)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          className="flex-1 rounded-full h-11 border-hairline"
          asChild
        >
          <Link href="/store/catalog">
            <ShoppingBag className="w-4 h-4 mr-2" />
            Lanjut belanja
          </Link>
        </Button>
        <Button className="flex-1 rounded-full h-11" asChild>
          <Link href="/kontak">
            <MessageCircle className="w-4 h-4 mr-2" />
            Tanya CS
          </Link>
        </Button>
      </div>
    </div>
  );
}
