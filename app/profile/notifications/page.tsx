"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { StorefrontLayout } from "@/src/components/storefront-layout";
import { Button } from "@/src/components/ui/button";
import { useAuth } from "@/src/hooks/use-auth";
import {
  getNotificationPrefs,
  updateNotificationPrefs,
  type NotificationPreferences,
} from "@/src/lib/api/users";
import { ApiError } from "@/src/lib/api/types";

export default function NotificationsPage() {
  return (
    <StorefrontLayout mobileTitle="Notifikasi">
      <NotificationsView />
    </StorefrontLayout>
  );
}

function NotificationsView() {
  const { isAuthenticated, isLoading } = useAuth();
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (isLoading) return;
      if (!isAuthenticated) {
        if (!cancelled) setLoading(false);
        return;
      }
      try {
        const p = await getNotificationPrefs();
        if (!cancelled) setPrefs(p);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Gagal memuat preferensi.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isLoading]);

  if (!isLoading && !isAuthenticated) {
    return <NotLoggedIn />;
  }

  async function toggle(key: keyof Pick<NotificationPreferences, "order_updates" | "promotions" | "security_alerts" | "newsletter">) {
    if (!prefs) return;
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    setSaving(true);
    setError(null);
    try {
      const updated = await updateNotificationPrefs({ [key]: next[key] });
      setPrefs(updated);
      setSavedAt(Date.now());
    } catch (err) {
      // revert
      setPrefs(prefs);
      setError(err instanceof ApiError ? err.message : "Gagal menyimpan preferensi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 md:px-6 py-6 md:py-10 max-w-xl">
        <Link href="/profile" className="inline-flex items-center text-sm text-muted hover:text-ink mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Kembali
        </Link>

        <div className="rounded-2xl border border-hairline bg-white p-5 md:p-6 shadow-sm">
          <h1 className="text-xl font-semibold tracking-tight">Preferensi notifikasi</h1>
          <p className="text-sm text-muted mt-1">
            Pilih jenis pesan yang ingin kamu terima.
          </p>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-5 h-5 animate-spin text-muted" />
            </div>
          ) : prefs ? (
            <ul className="mt-5 divide-y divide-hairline">
              <ToggleRow
                title="Update pesanan"
                description="Konfirmasi, pengiriman, status pengantaran."
                checked={prefs.order_updates}
                onChange={() => toggle("order_updates")}
                disabled={saving}
              />
              <ToggleRow
                title="Promosi"
                description="Diskon, voucher, kampanye spesial."
                checked={prefs.promotions}
                onChange={() => toggle("promotions")}
                disabled={saving}
              />
              <ToggleRow
                title="Keamanan akun"
                description="Login baru, perubahan password."
                checked={prefs.security_alerts}
                onChange={() => toggle("security_alerts")}
                disabled={saving}
              />
              <ToggleRow
                title="Newsletter"
                description="Update mingguan & artikel pilihan."
                checked={prefs.newsletter}
                onChange={() => toggle("newsletter")}
                disabled={saving}
              />
            </ul>
          ) : null}

          {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
          {savedAt && !error && (
            <p className="text-xs text-emerald-600 mt-4">Tersimpan.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  onChange,
  disabled,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <li className="flex items-center justify-between gap-4 py-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-ink">{title}</p>
        <p className="text-xs text-muted mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 ${
          checked ? "bg-primary" : "bg-surface-soft border border-hairline"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          } mt-0.5`}
        />
      </button>
    </li>
  );
}

function NotLoggedIn() {
  return (
    <div className="container mx-auto px-6 py-12 max-w-md text-center">
      <p className="text-sm text-muted mb-4">Masuk untuk mengatur notifikasi.</p>
      <Button asChild className="rounded-full h-11">
        <Link href="/login">Masuk</Link>
      </Button>
    </div>
  );
}
