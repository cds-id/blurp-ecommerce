"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Truck,
  CreditCard,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Lock,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group";
import { cn, formatPrice } from "@/src/lib/utils";
import { LocationPicker, type LocationPickerValue } from "@/src/components/shared/location-picker";
import Link from "next/link";
import { useCart } from "@/src/components/shared/cart-provider";
import { saveLastOrder } from "@/src/data/mock-orders";
import { SafeImage } from "@/src/components/shared/safe-image";
import { SummaryRowSkeleton, Skeleton } from "@/src/components/shared/skeleton";
import { useSimulatedLoading } from "@/src/hooks/use-simulated-loading";
import { ordersApi, paymentsApi, shippingApi } from "@/src/lib/api";
import type { ShippingOption } from "@/src/lib/api/orders";
import { useAuth } from "@/src/hooks/use-auth";

function normalizePhone(input: string) {
  return input.replace(/[^\d]/g, "");
}

function shippingKey(opt: ShippingOption): string {
  return `${opt.courier_code}:${opt.service_code}`;
}

const STEPS = [
  { num: 1, label: "Alamat", icon: MapPin },
  { num: 2, label: "Kirim", icon: Truck },
  { num: 3, label: "Bayar", icon: CreditCard },
] as const;

export function MobileCheckout() {
  const router = useRouter();
  const cart = useCart();
  const { isAuthenticated } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedShipping, setSelectedShipping] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState<LocationPickerValue>({
    district_id: null,
    province: "",
    city: "",
    district: "",
    postal_code: "",
  });
  const [showSummary, setShowSummary] = useState(false);
  const isSummaryLoading = useSimulatedLoading(700);
  const [shippingChoices, setShippingChoices] = useState<ShippingOption[]>([]);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const items = cart.lineItems;
  const subtotal = cart.subtotal;
  const totalUnits = cart.count;
  const shippingOpt = shippingChoices.find((s) => shippingKey(s) === selectedShipping) ?? null;
  const shippingCost = shippingOpt?.cost_idr ?? 0;
  const total = subtotal + shippingCost;

  const canProceed = () => {
    if (step === 1)
      return Boolean(name && phone && email && address && location.district_id);
    if (step === 2) return Boolean(selectedShipping);
    if (step === 3) return true;
    return false;
  };

  const loadShippingOptions = async () => {
    if (!location.district_id) return;
    setIsLoadingShipping(true);
    setShippingError(null);
    try {
      if (isAuthenticated) {
        const quote = await ordersApi.shippingQuote({
          shipping_address: {
            name,
            email,
            phone: normalizePhone(phone),
            street: address,
            city: location.city,
            province: location.province,
            postal_code: location.postal_code || "00000",
            country: "ID",
            district_id: location.district_id,
          },
        });
        setShippingChoices(quote.shipping_options);
      } else {
        const cfg = await shippingApi.getConfig();
        const weight = cart.summary?.total_weight_grams ?? 0;
        if (!cfg?.origin_district_id || weight <= 0) {
          setShippingChoices([]);
          setShippingError("Guest shipping gagal: origin atau total_weight_grams kosong.");
          return;
        }
        const res = await shippingApi.shippingCost({
          origin_district_id: cfg.origin_district_id,
          destination_district_id: location.district_id,
          weight_grams: weight,
          couriers: ["jne", "jnt", "sicepat"],
        });

        const opts: ShippingOption[] = [];
        for (const c of res.costs ?? []) {
          for (const s of c.services ?? []) {
            opts.push({
              courier_code: c.courier_code,
              courier_name: c.courier_name,
              service_code: s.service_code,
              service_name: s.service_name,
              cost_idr: s.cost_idr,
              etd: s.etd,
            });
          }
        }
        setShippingChoices(opts);
      }
    } catch (e) {
      setShippingChoices([]);
      setShippingError(e instanceof Error ? e.message : "Gagal memuat ongkir");
    } finally {
      setIsLoadingShipping(false);
    }
  };

  const handleNext = async () => {
    if (step === 1) {
      setStep(2);
      setShowSummary(false);
      void loadShippingOptions();
      return;
    }
    if (step === 2) {
      setStep(3);
      setShowSummary(false);
      return;
    }

    if (!location.district_id || !shippingOpt) return;

    setIsPlacingOrder(true);
    try {
      const order = await ordersApi.checkout({
        shipping_address: {
          name,
          email,
          phone: normalizePhone(phone),
          street: address,
          city: location.city,
          province: location.province,
          postal_code: location.postal_code || "00000",
          country: "ID",
          district_id: location.district_id,
        },
        courier_code: shippingOpt.courier_code,
        service_code: shippingOpt.service_code,
      });

      saveLastOrder({
        id: order.id,
        phone: normalizePhone(phone),
        createdAt: new Date().toISOString(),
        total: order.total_idr ?? total,
        status: "paid",
        guest_tracking_token: order.guest_tracking_token,
      });
      await cart.clear();

      if (order.payment_url) {
        window.location.href = order.payment_url;
        return;
      }

      if (isAuthenticated) {
        try {
          const payment = await paymentsApi.createPayment({
            order_id: order.id,
            payment_method: "BANK_TRANSFER",
          });
          if (payment.payment_url) {
            window.location.href = payment.payment_url;
            return;
          }
        } catch (e) {
          console.error("create payment failed", e);
        }
      }
      router.push(`/store/order/${order.id}`);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (cart.isHydrated && items.length === 0) {
    return (
      <div className="px-6 py-16 text-center">
        <h1 className="text-xl font-semibold mb-2">Checkout</h1>
        <p className="text-sm text-muted mb-4">Keranjang kamu masih kosong.</p>
        <Button asChild size="lg" className="rounded-full px-6">
          <Link href="/store/catalog">Mulai belanja</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-background pb-44">
      {/* Progress header */}
      <div className="bg-card border-b border-hairline px-4 pt-3 pb-4">
        <div className="flex items-center gap-2 mb-3">
          {step > 1 ? (
            <button
              onClick={() => setStep((step - 1) as 1 | 2 | 3)}
              className="text-ink/70 -ml-1 p-1"
              aria-label="Kembali"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          ) : (
            <Link href="/store/keranjang" className="text-ink/70 -ml-1 p-1" aria-label="Kembali">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted">Langkah {step} dari 3</p>
            <p className="text-sm font-semibold text-ink">{STEPS[step - 1]?.label}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {STEPS.map((s, idx) => {
            const isDone = step > s.num;
            const isCurrent = step === s.num;
            return (
              <div key={s.num} className="flex-1 flex items-center gap-2">
                <div
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-colors",
                    isDone ? "bg-ink" : isCurrent ? "bg-primary" : "bg-surface-soft"
                  )}
                />
                {idx === STEPS.length - 1 && (
                  <span className="text-micro font-semibold text-muted tabular-nums">
                    {step}/3
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {step === 1 && (
          <section className="rounded-2xl border border-hairline bg-card p-4 space-y-3">
            <header className="pb-1">
              <h2 className="font-semibold text-ink flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Alamat pengiriman
              </h2>
              <p className="text-xs text-muted mt-0.5">
                Tidak perlu daftar — cukup isi alamat.
              </p>
            </header>

            <Field label="Nama lengkap" required>
              <Input
                className="h-11 rounded-xl border-hairline focus-visible:ring-ink"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama sesuai KTP"
              />
            </Field>
            <Field label="No. HP (WhatsApp)" required>
              <Input
                className="h-11 rounded-xl border-hairline focus-visible:ring-ink"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08xxxxxxxxxx"
                inputMode="tel"
              />
            </Field>
            <Field label="Email" required helper="Konfirmasi & pembayaran dikirim ke email ini.">
              <Input
                type="email"
                className="h-11 rounded-xl border-hairline focus-visible:ring-ink"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kamu@email.com"
              />
            </Field>
            <LocationPicker value={location} onChange={setLocation} />
            <Field label="Kode pos" helper="Terisi otomatis dari pilihan lokasi (boleh diubah).">
              <Input
                className="h-11 rounded-xl border-hairline focus-visible:ring-ink"
                value={location.postal_code}
                onChange={(e) =>
                  setLocation((v) => ({ ...v, postal_code: e.target.value }))
                }
                placeholder="40123"
                inputMode="numeric"
              />
            </Field>
            <Field label="Alamat lengkap" required>
              <Input
                className="h-11 rounded-xl border-hairline focus-visible:ring-ink"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Jl. Contoh No. 123, RT/RW, Kelurahan"
              />
            </Field>
          </section>
        )}

        {step === 2 && (
          <section className="rounded-2xl border border-hairline bg-card p-4">
            <header className="pb-3">
              <h2 className="font-semibold text-ink flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Pilih pengiriman
              </h2>
              <p className="text-xs text-muted mt-0.5">
                Estimasi tiba ke {location.city || "kota tujuan"}.
              </p>
            </header>
            {isLoadingShipping ? (
              <div className="text-sm text-muted">Memuat opsi pengiriman...</div>
            ) : shippingError ? (
              <div className="rounded-xl border border-hairline bg-surface-soft p-3 text-sm text-ink/80">
                {shippingError}
              </div>
            ) : shippingChoices.length === 0 ? (
              <div className="text-sm text-muted">Tidak ada opsi pengiriman tersedia.</div>
            ) : (
              <RadioGroup value={selectedShipping} onValueChange={setSelectedShipping}>
                <div className="space-y-2">
                  {shippingChoices.map((opt) => {
                    const key = shippingKey(opt);
                    const isActive = selectedShipping === key;
                    return (
                      <label
                        key={key}
                        className={cn(
                          "flex items-center justify-between gap-3 p-3.5 rounded-xl border transition-all",
                          isActive ? "border-ink bg-surface-soft" : "border-hairline"
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <RadioGroupItem value={key} />
                          <div className="min-w-0">
                            <p className="font-medium text-sm text-ink">
                              {opt.courier_name} · {opt.service_code}
                            </p>
                            <p className="text-caption-2xs text-muted truncate">
                              {opt.service_name} · {opt.etd}
                            </p>
                          </div>
                        </div>
                        <span className="font-semibold text-sm tabular-nums">
                          {formatPrice(opt.cost_idr)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </RadioGroup>
            )}
          </section>
        )}

        {step === 3 && (
          <>
            <section className="rounded-2xl border-2 border-ink bg-surface-soft p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-ink text-white flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-white stroke-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink">Bayar via Xendit</p>
                  <p className="text-caption-2xs text-muted">
                    VA, e-wallet, kartu, & QRIS.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-hairline bg-card p-4 text-sm">
              <p className="text-caption-2xs uppercase tracking-wider text-muted mb-1">Kirim ke</p>
              <p className="font-medium text-ink">{name || "—"}</p>
              <p className="text-xs text-muted">
                {phone || "—"} • {email || "—"}
              </p>
              <p className="text-xs text-muted mt-1">
                {address || "—"}
                {location.city && `, ${location.city}`}
              </p>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="mt-2 text-xs font-medium text-ink underline underline-offset-2"
              >
                Edit alamat
              </button>
            </section>

            <section className="rounded-2xl bg-surface-soft border border-hairline p-3 flex items-start gap-2 text-xs text-ink/80">
              <ShieldCheck className="w-4 h-4 mt-0.5 text-ink/70 shrink-0" />
              <p>
                Setelah klik bayar kamu akan diarahkan ke halaman konfirmasi pesanan.
                Demo ini tidak menarik biaya sungguhan.
              </p>
            </section>
          </>
        )}
      </div>

      {/* Sticky bottom action bar with collapsible summary */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-hairline z-40 shadow-sticky-bar">
        {showSummary && (
          <div className="px-4 py-3 border-b border-hairline max-h-72 overflow-y-auto">
            {isSummaryLoading ? (
              <div className="space-y-3" aria-busy="true">
                {Array.from({ length: Math.min(items.length || 2, 3) }).map((_, i) => (
                  <SummaryRowSkeleton key={i} />
                ))}
                <div className="space-y-1.5 pt-2 border-t border-hairline">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ) : (
              <>
                <ul className="divide-y divide-hairline">
                  {items.map((item) => (
                    <li
                      key={item.cart_item_id}
                      className="py-2.5 flex gap-3"
                    >
                      <div className="relative h-12 w-12 bg-surface-soft rounded-lg overflow-hidden flex-shrink-0">
                        <SafeImage
                          src={item.image_url ?? ""}
                          alt={item.product_name ?? "Produk"}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-ink text-white text-micro font-bold flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-ink line-clamp-1">
                          {item.product_name ?? "Produk"}
                        </p>
                        <p className="text-caption-2xs text-muted line-clamp-1">
                          {item.variant_name || "—"}
                        </p>
                      </div>
                      <span className="text-xs font-semibold tabular-nums">
                        {formatPrice(item.subtotal_idr)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-2 pt-2 border-t border-hairline space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted">Subtotal</span>
                    <span className="tabular-nums">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Ongkir</span>
                    <span className="tabular-nums">
                      {shippingCost ? formatPrice(shippingCost) : "—"}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        <div className="px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={() => setShowSummary((v) => !v)}
            className="w-full flex items-center justify-between mb-2"
            aria-expanded={showSummary}
          >
            <span className="text-xs text-muted">
              Total ({totalUnits} barang)
            </span>
            <span className="inline-flex items-center text-lg font-semibold tabular-nums">
              {formatPrice(total)}
              {showSummary ? (
                <ChevronDown className="w-4 h-4 ml-1 text-muted" />
              ) : (
                <ChevronUp className="w-4 h-4 ml-1 text-muted" />
              )}
            </span>
          </button>

          <Button
            onClick={() => void handleNext()}
            disabled={!canProceed() || isPlacingOrder || cart.isSyncing}
            className="w-full h-12 rounded-full text-sm font-semibold"
          >
            {step === 3 ? (
              <>
                <Lock className="w-4 h-4 mr-2 text-white stroke-white" />
                {isPlacingOrder ? "Memproses..." : "Bayar sekarang"}
              </>
            ) : (
              <>
                Lanjut
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  helper,
  children,
}: {
  label: string;
  required?: boolean;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-ink/80">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
      {helper && <p className="text-caption-2xs text-muted">{helper}</p>}
    </div>
  );
}
