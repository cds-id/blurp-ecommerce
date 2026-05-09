"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  MapPin,
  Truck,
  CreditCard,
  Check,
  ShieldCheck,
  Lock,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group";
import { cn, formatPrice } from "@/src/lib/utils";
import { LocationPicker, type LocationPickerValue } from "@/src/components/shared/location-picker";
import { useCart } from "@/src/components/shared/cart-provider";
import { SafeImage } from "@/src/components/shared/safe-image";
import { saveLastOrder } from "@/src/data/mock-orders";
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
  { num: 1, label: "Alamat", icon: MapPin, description: "Kemana kami kirim?" },
  { num: 2, label: "Pengiriman", icon: Truck, description: "Pilih kurir" },
  { num: 3, label: "Pembayaran", icon: CreditCard, description: "Konfirmasi & bayar" },
] as const;

export function DesktopCheckout() {
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
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [shippingChoices, setShippingChoices] = useState<ShippingOption[]>([]);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);

  const isSummaryLoading = useSimulatedLoading(700);
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
        // Logged-in: backend resolves origin + cart weight.
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
      void loadShippingOptions();
      return;
    }
    if (step === 2) {
      setStep(3);
      return;
    }

    // step 3
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
        // Create payment + redirect to Xendit
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
      // Guest (or payment failed): land on order page.
      router.push(`/store/order/${order.id}`);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (cart.isHydrated && items.length === 0) {
    return (
      <div className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-2xl font-semibold mb-2">Checkout</h1>
        <p className="text-muted mb-6">Keranjang kamu masih kosong.</p>
        <Button asChild size="lg" className="rounded-full px-6">
          <Link href="/store/catalog">Mulai belanja</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-6 pt-6">
        <nav className="flex items-center text-sm text-muted">
          <Link href="/" className="hover:text-ink transition-colors">Beranda</Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <Link href="/store/keranjang" className="hover:text-ink transition-colors">Keranjang</Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-ink font-medium">Checkout</span>
        </nav>
      </div>

      <div className="container mx-auto px-6 pt-4 pb-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Checkout</h1>
            <p className="text-sm text-muted mt-1">
              {STEPS[step - 1]?.description}
            </p>
          </div>
          <Link
            href="/store/keranjang"
            className="text-sm font-medium text-ink/70 hover:text-ink transition-colors inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Kembali ke keranjang
          </Link>
        </div>

        {/* Step header */}
        <div className="rounded-2xl border border-hairline bg-white p-4 mb-6">
          <ol className="grid grid-cols-3 gap-2">
            {STEPS.map((s, idx) => {
              const isDone = step > s.num;
              const isCurrent = step === s.num;
              const Icon = s.icon;
              return (
                <li key={s.num} className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full border transition-colors",
                      isDone && "bg-ink text-white border-ink",
                      isCurrent && "bg-primary text-primary-foreground border-primary",
                      !isDone && !isCurrent && "bg-surface-soft text-muted border-hairline"
                    )}
                  >
                    {isDone ? (
                      <Check className="h-4 w-4 text-white stroke-white" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div
                      className={cn(
                        "text-[11px] uppercase tracking-wider",
                        isCurrent ? "text-primary" : "text-muted"
                      )}
                    >
                      Langkah {s.num}
                    </div>
                    <div
                      className={cn(
                        "text-sm font-semibold truncate",
                        isCurrent ? "text-ink" : isDone ? "text-ink/80" : "text-muted"
                      )}
                    >
                      {s.label}
                    </div>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div
                      className={cn(
                        "hidden md:block h-px flex-1 max-w-12",
                        isDone ? "bg-ink" : "bg-hairline"
                      )}
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        <div className="grid grid-cols-[1fr_400px] gap-8">
          {/* Main Form */}
          <div className="space-y-6">
            {step === 1 && (
              <section className="rounded-2xl border border-hairline bg-white">
                <header className="p-6 border-b border-hairline">
                  <h2 className="font-semibold text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Alamat pengiriman
                  </h2>
                  <p className="text-sm text-muted mt-1">
                    Tidak perlu daftar akun. Cukup isi alamat untuk lanjut.
                  </p>
                </header>

                <div className="p-6 grid grid-cols-2 gap-5">
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
                  <Field
                    label="Email"
                    required
                    helper="Konfirmasi & link pembayaran dikirim ke email ini."
                    className="col-span-2"
                  >
                    <Input
                      type="email"
                      className="h-11 rounded-xl border-hairline focus-visible:ring-ink"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="kamu@email.com"
                    />
                  </Field>
                  <div className="col-span-2">
                    <LocationPicker value={location} onChange={setLocation} />
                  </div>
                  <Field label="Kode pos" helper="Terisi otomatis dari pilihan lokasi (boleh diubah).">
                    <Input
                      className="h-11 rounded-xl border-hairline focus-visible:ring-ink"
                      placeholder="40123"
                      inputMode="numeric"
                      value={location.postal_code}
                      onChange={(e) =>
                        setLocation((v) => ({ ...v, postal_code: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label="Alamat lengkap" required className="col-span-2">
                    <Input
                      className="h-11 rounded-xl border-hairline focus-visible:ring-ink"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Jl. Contoh No. 123, RT/RW, Kelurahan, Kecamatan"
                    />
                  </Field>
                </div>
              </section>
            )}

            {step === 2 && (
              <section className="rounded-2xl border border-hairline bg-white">
                <header className="p-6 border-b border-hairline">
                  <h2 className="font-semibold text-lg flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Pilih pengiriman
                  </h2>
                  <p className="text-sm text-muted mt-1">
                    Estimasi sampai untuk {location.city || "kota tujuan"}.
                  </p>
                </header>

                <div className="p-6">
                  {isLoadingShipping ? (
                    <div className="text-sm text-muted">Memuat opsi pengiriman...</div>
                  ) : shippingError ? (
                    <div className="rounded-xl border border-hairline bg-surface-soft p-4 text-sm text-ink/80">
                      {shippingError}
                    </div>
                  ) : shippingChoices.length === 0 ? (
                    <div className="text-sm text-muted">Tidak ada opsi pengiriman tersedia.</div>
                  ) : (
                    <RadioGroup value={selectedShipping} onValueChange={setSelectedShipping}>
                      <div className="space-y-3">
                        {shippingChoices.map((opt) => {
                          const key = shippingKey(opt);
                          const isActive = selectedShipping === key;
                          return (
                            <label
                              key={key}
                              className={cn(
                                "flex items-center justify-between gap-4 p-4 border rounded-2xl cursor-pointer transition-all",
                                isActive
                                  ? "border-ink bg-surface-soft shadow-sm"
                                  : "border-hairline hover:border-ink/40"
                              )}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <RadioGroupItem value={key} />
                                <div className="min-w-0">
                                  <p className="font-semibold text-ink">
                                    {opt.courier_name} · {opt.service_code}
                                  </p>
                                  <p className="text-xs text-muted truncate">
                                    {opt.service_name} · Estimasi {opt.etd}
                                  </p>
                                </div>
                              </div>
                              <span className="font-semibold tabular-nums">
                                {formatPrice(opt.cost_idr)}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </RadioGroup>
                  )}
                </div>
              </section>
            )}

            {step === 3 && (
              <section className="rounded-2xl border border-hairline bg-white">
                <header className="p-6 border-b border-hairline">
                  <h2 className="font-semibold text-lg flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Pembayaran
                  </h2>
                  <p className="text-sm text-muted mt-1">
                    Pilih metode pembayaran. Pembayaran ini masih dummy untuk demo.
                  </p>
                </header>

                <div className="p-6 space-y-4">
                  <div className="rounded-2xl border-2 border-ink bg-surface-soft p-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-ink text-white flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-white stroke-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-ink">Bayar via Xendit</p>
                      <p className="text-xs text-muted">
                        Kartu kredit, virtual account, e-wallet, & QRIS.
                      </p>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-bold bg-ink text-white px-2 py-1 rounded-full">
                      Direkomendasikan
                    </span>
                  </div>

                  <div className="rounded-2xl border border-hairline bg-surface-soft p-4 text-sm text-ink/80">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="h-5 w-5 text-ink/70 mt-0.5" />
                      <div>
                        <p className="font-medium text-ink">Apa yang terjadi setelah ini</p>
                        <p className="text-xs text-muted mt-1 leading-relaxed">
                          Setelah klik bayar, kamu akan diarahkan ke halaman konfirmasi pesanan.
                          Demo ini tidak menarik biaya sungguhan.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-hairline bg-white p-4">
                    <p className="text-xs uppercase tracking-wider text-muted mb-2">Kirim ke</p>
                    <p className="text-sm font-medium text-ink">{name || "—"}</p>
                    <p className="text-xs text-muted">
                      {phone || "—"} • {email || "—"}
                    </p>
                    <p className="text-xs text-muted mt-1">
                      {address || "—"}
                      {location.city && `, ${location.city}, ${location.province}`}
                    </p>
                  </div>
                </div>
              </section>
            )}

            <div className="flex gap-3">
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setStep((step - 1) as 1 | 2 | 3)}
                  className="rounded-full px-6 h-11 border-hairline"
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  Kembali
                </Button>
              )}
              <Button
                onClick={() => void handleNext()}
                disabled={!canProceed() || isPlacingOrder || cart.isSyncing}
                className="flex-1 rounded-full h-12 text-sm font-semibold"
              >
                {step === 3 ? (
                  <>
                    <Lock className="w-4 h-4 mr-2 text-white stroke-white" />
                    {isPlacingOrder ? "Membuat pesanan..." : `Bayar ${formatPrice(total)}`}
                  </>
                ) : (
                  <>
                    Lanjutkan
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <aside className="h-fit sticky top-24 space-y-4">
            <div className="rounded-2xl border border-hairline bg-white overflow-hidden">
              <header className="p-5 border-b border-hairline">
                <h2 className="font-semibold text-base">Ringkasan pesanan</h2>
                <p className="text-xs text-muted mt-0.5">{totalUnits} barang</p>
              </header>

              {isSummaryLoading ? (
                <div className="p-4 space-y-3" aria-busy="true">
                  {Array.from({ length: Math.min(items.length || 2, 3) }).map((_, i) => (
                    <SummaryRowSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <ul className="divide-y divide-hairline max-h-72 overflow-y-auto">
                  {items.map((item) => (
                    <li
                      key={item.cart_item_id}
                      className="p-4 flex gap-3"
                    >
                      <div className="relative h-14 w-14 bg-surface-soft rounded-xl overflow-hidden flex-shrink-0">
                        <SafeImage
                          src={item.image_url ?? ""}
                          alt={item.product_name ?? "Produk"}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-ink text-white text-[10px] font-bold flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink line-clamp-1">
                          {item.product_name ?? "Produk"}
                        </p>
                        <p className="text-xs text-muted line-clamp-1">
                          {item.variant_name || "—"}
                        </p>
                      </div>
                      <span className="text-sm font-semibold tabular-nums text-ink">
                        {formatPrice(item.subtotal_idr)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="p-5 space-y-2 text-sm">
                {isSummaryLoading ? (
                  <>
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-3 w-1/2" />
                    <div className="my-3 h-px bg-hairline" />
                    <Skeleton className="h-7 w-1/3 ml-auto" />
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted">Subtotal</span>
                      <span className="tabular-nums">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Ongkos kirim</span>
                      <span className="tabular-nums">
                        {shippingCost ? formatPrice(shippingCost) : "—"}
                      </span>
                    </div>
                    <div className="my-3 h-px bg-hairline" />
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm text-muted">Total</span>
                      <span className="text-2xl font-semibold tabular-nums">
                        {formatPrice(total)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-surface-soft border border-hairline p-4 flex items-start gap-3 text-sm text-ink/80">
              <ShieldCheck className="w-4 h-4 mt-0.5 text-ink/70" />
              <div>
                <div className="font-medium text-ink">Pembayaran terenkripsi</div>
                <div className="text-xs text-muted">
                  Transaksi dilindungi oleh Xendit & TLS 1.3.
                </div>
              </div>
            </div>
          </aside>
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
  className,
}: {
  label: string;
  required?: boolean;
  helper?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="text-xs font-medium text-ink/80">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
      {helper && <p className="text-xs text-muted">{helper}</p>}
    </div>
  );
}
