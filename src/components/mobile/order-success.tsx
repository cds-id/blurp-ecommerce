"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Copy,
  ArrowRight,
  Package,
  MessageCircle,
  ShieldCheck,
  AlertTriangle,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { formatPrice } from "@/src/lib/utils";
import { useLastOrder, type MockOrder } from "@/src/data/mock-orders";

interface MobileOrderSuccessProps {
  orderId: string;
}

const STATUS_STEPS: Array<{ key: MockOrder["status"]; label: string; description: string }> = [
  { key: "paid", label: "Pembayaran diterima", description: "Pembayaran sudah dikonfirmasi." },
  { key: "packed", label: "Sedang dikemas", description: "Tim gudang menyiapkan pesanan." },
  { key: "shipped", label: "Dikirim", description: "Paket dalam perjalanan." },
  { key: "delivered", label: "Sampai tujuan", description: "Pesanan diterima." },
];

const STATUS_INDEX: Record<MockOrder["status"], number> = {
  created: 0,
  paid: 0,
  packed: 1,
  shipped: 2,
  delivered: 3,
  cancelled: -1,
};

export function MobileOrderSuccess({ orderId }: MobileOrderSuccessProps) {
  const order = useLastOrder();

  const total = order?.total ?? 0;
  const status: MockOrder["status"] = order?.status ?? "paid";
  const currentIdx = STATUS_INDEX[status];
  const isCancelled = status === "cancelled";
  const trackerHref =
    order?.guest_tracking_token
      ? `/store/tracker?token=${encodeURIComponent(order.guest_tracking_token)}`
      : "/store/tracker";

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="bg-background pb-12">
      <div className="text-center pt-8 pb-6 px-6 border-b border-hairline">
        {isCancelled ? (
          <>
            <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3 ring-4 ring-red-100">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-xl font-semibold mb-1">Pesanan dibatalkan</h1>
            <p className="text-sm text-muted">Stok sudah dikembalikan.</p>
          </>
        ) : (
          <>
            <div className="h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3 ring-4 ring-emerald-100">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <h1 className="text-xl font-semibold mb-1">Pesanan berhasil!</h1>
            <p className="text-sm text-muted">
              Konfirmasi pembayaran sudah masuk.
            </p>
          </>
        )}
      </div>

      <div className="p-4 space-y-4">
        <div className="rounded-2xl border border-hairline bg-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-caption-2xs uppercase tracking-wider text-muted mb-0.5">No. pesanan</p>
              <p className="font-mono font-semibold text-base text-ink">{orderId}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-11 w-11 p-0 rounded-full"
              onClick={() => copyToClipboard(orderId)}
              aria-label="Salin nomor pesanan"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-3 pt-3 border-t border-hairline flex items-center justify-between">
            <span className="text-xs text-muted">Total dibayar</span>
            <div className="text-right">
              <div className="text-base font-semibold tabular-nums">
                {total ? formatPrice(total) : "—"}
              </div>
              {!isCancelled && (
                <p className="text-caption-2xs text-emerald-600 inline-flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Lunas via Xendit
                </p>
              )}
            </div>
          </div>
        </div>

        {isCancelled ? (
          <div className="rounded-2xl border border-hairline bg-card p-4">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-full bg-red-50 ring-4 ring-red-100/60 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">Pesanan dibatalkan</p>
                <p className="text-caption-2xs text-muted mt-0.5">
                  Stok sudah dikembalikan. Jika sudah bayar, dana akan direfund.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button asChild variant="outline" size="sm" className="rounded-full border-hairline h-10 text-xs min-h-11">
                    <Link href="/store/catalog">
                      <ShoppingBag className="w-3 h-3 mr-1" />
                      Belanja lagi
                    </Link>
                  </Button>
                  <Button asChild size="sm" className="rounded-full h-10 text-xs min-h-11">
                    <Link href="/kontak">
                      <MessageCircle className="w-3 h-3 mr-1" />
                      Hubungi CS
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
        <div className="rounded-2xl border border-hairline bg-card p-4">
          <h2 className="font-semibold text-sm mb-1">Status pesanan</h2>
          <p className="text-caption-2xs text-muted mb-4">
            Update dikirim via email & WhatsApp.
          </p>
          <ol className="space-y-4">
            {STATUS_STEPS.map((s, idx) => {
              const isDone = idx < currentIdx;
              const isCurrent = idx === currentIdx;
              return (
                <li key={s.key} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={
                        "h-9 w-9 rounded-full flex items-center justify-center text-caption-2xs font-semibold transition-colors " +
                        (isDone
                          ? "bg-ink text-white"
                          : isCurrent
                          ? "bg-primary text-primary-foreground"
                          : "bg-surface-soft text-muted border border-hairline")
                      }
                    >
                      {isDone ? <CheckCircle2 className="h-3.5 w-3.5" /> : idx + 1}
                    </div>
                    {idx < STATUS_STEPS.length - 1 && (
                      <div
                        className={
                          "w-px flex-1 mt-1 " + (isDone ? "bg-ink" : "bg-hairline")
                        }
                      />
                    )}
                  </div>
                  <div className="pb-2">
                    <p
                      className={
                        "text-sm font-medium " +
                        (isCurrent ? "text-ink" : isDone ? "text-ink/80" : "text-muted")
                      }
                    >
                      {s.label}
                    </p>
                    <p className="text-caption-2xs text-muted">{s.description}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
        )}

        <div className="rounded-2xl border border-hairline bg-surface-soft p-4">
          <h2 className="font-semibold text-sm mb-3">Apa selanjutnya?</h2>
          <div className="space-y-2">
            <Link
              href={trackerHref}
              className="flex items-center gap-3 p-3 rounded-xl bg-white border border-hairline"
            >
              <div className="h-9 w-9 rounded-full bg-surface-soft flex items-center justify-center">
                <Package className="w-4 h-4 text-ink" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink">Lacak pesanan</p>
                <p className="text-caption-2xs text-muted">Pantau status & estimasi tiba</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted" />
            </Link>
            <Link
              href="/kontak"
              className="flex items-center gap-3 p-3 rounded-xl bg-white border border-hairline"
            >
              <div className="h-9 w-9 rounded-full bg-surface-soft flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-ink" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink">Tanya CS</p>
                <p className="text-caption-2xs text-muted">WA balas dalam 15 menit</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted" />
            </Link>
          </div>
        </div>

        {order?.guest_tracking_token && (
          <div className="rounded-2xl border border-hairline bg-card p-4">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-full bg-emerald-50 ring-4 ring-emerald-100/60 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">Simpan link pelacakan</p>
                <p className="text-caption-2xs text-muted mt-0.5">
                  Tanpa akun, link inilah cara cek status pesanan kapan saja.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      typeof window !== "undefined"
                        ? `${window.location.origin}${trackerHref}`
                        : trackerHref,
                    )
                  }
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-ink rounded-full border border-hairline px-3 py-1.5"
                >
                  <Copy className="w-3 h-3" />
                  Salin link
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2 pt-2">
          <Button className="w-full h-12 rounded-full text-sm font-semibold" asChild>
            <Link href={trackerHref}>
              Lacak pesanan
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
          <Button
            variant="outline"
            className="w-full h-12 rounded-full text-sm font-medium border-hairline"
            asChild
          >
            <Link href="/store/catalog">Lanjut belanja</Link>
          </Button>
        </div>

        <p className="text-center text-xs text-muted mt-4">
          Butuh bantuan?{" "}
          <Link href="/kontak" className="text-ink font-medium underline underline-offset-2">
            Hubungi CS
          </Link>
        </p>
      </div>
    </div>
  );
}
