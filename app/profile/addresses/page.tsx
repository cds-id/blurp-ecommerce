"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Plus, Star, Trash2, Loader2, Pencil } from "lucide-react";
import { StorefrontLayout } from "@/src/components/storefront-layout";
import { Button } from "@/src/components/ui/button";
import { useAuth } from "@/src/hooks/use-auth";
import {
  deleteAddress,
  listAddresses,
  setDefaultAddress,
  type UserAddress,
} from "@/src/lib/api/users";
import { ApiError } from "@/src/lib/api/types";

export default function AddressesPage() {
  return (
    <StorefrontLayout mobileTitle="Alamat saya">
      <AddressesView />
    </StorefrontLayout>
  );
}

function AddressesView() {
  const { isAuthenticated, isLoading } = useAuth();
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const list = await listAddresses();
      setAddresses(list);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal memuat alamat.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (isLoading) return;
      if (!isAuthenticated) {
        if (!cancelled) setLoading(false);
        return;
      }
      if (!cancelled) await refresh();
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isLoading]);

  async function handleDelete(id: string) {
    if (!confirm("Hapus alamat ini?")) return;
    setBusyId(id);
    setError(null);
    try {
      await deleteAddress(id);
      setAddresses((xs) => xs.filter((a) => a.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal menghapus alamat.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleSetDefault(id: string) {
    setBusyId(id);
    setError(null);
    try {
      await setDefaultAddress(id);
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal menjadikan default.");
    } finally {
      setBusyId(null);
    }
  }

  if (!isLoading && !isAuthenticated) return <NotLoggedIn />;

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 md:px-6 py-6 md:py-10 max-w-xl">
        <Link href="/profile" className="inline-flex items-center text-sm text-muted hover:text-ink mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Kembali
        </Link>

        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold tracking-tight">Alamat saya</h1>
          <Button asChild size="sm" className="rounded-full">
            <Link href="/profile/addresses/new">
              <Plus className="w-4 h-4 mr-1" />
              Tambah
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-muted" />
          </div>
        ) : addresses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-hairline bg-white p-8 text-center">
            <MapPin className="w-8 h-8 text-muted mx-auto mb-3" />
            <p className="text-sm font-medium text-ink mb-1">Belum ada alamat</p>
            <p className="text-xs text-muted mb-4">
              Tambah alamat agar checkout lebih cepat.
            </p>
            <Button asChild size="sm" className="rounded-full">
              <Link href="/profile/addresses/new">Tambah alamat</Link>
            </Button>
          </div>
        ) : (
          <ul className="space-y-3">
            {addresses.map((a) => (
              <li
                key={a.id}
                className="rounded-2xl border border-hairline bg-white p-4 md:p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-ink truncate">
                        {a.label || a.name}
                      </p>
                      {a.is_default && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5">
                          <Star className="w-3 h-3" />
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-ink mt-1">{a.name}</p>
                    <p className="text-xs text-muted">{a.phone}</p>
                    <p className="text-xs text-muted mt-1.5 leading-relaxed">
                      {a.street}, {a.city}, {a.province} {a.postal_code}
                      <br />
                      {a.country}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-hairline">
                  {!a.is_default && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full border-hairline"
                      onClick={() => handleSetDefault(a.id)}
                      disabled={busyId === a.id}
                    >
                      <Star className="w-3.5 h-3.5 mr-1" />
                      Jadikan default
                    </Button>
                  )}
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="rounded-full border-hairline"
                  >
                    <Link href={`/profile/addresses/${a.id}`}>
                      <Pencil className="w-3.5 h-3.5 mr-1" />
                      Edit
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full border-hairline text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(a.id)}
                    disabled={busyId === a.id}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Hapus
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
      </div>
    </div>
  );
}

function NotLoggedIn() {
  return (
    <div className="container mx-auto px-6 py-12 max-w-md text-center">
      <p className="text-sm text-muted mb-4">Masuk untuk mengatur alamat.</p>
      <Button asChild className="rounded-full h-11">
        <Link href="/login">Masuk</Link>
      </Button>
    </div>
  );
}
