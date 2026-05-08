"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { StorefrontLayout } from "@/src/components/storefront-layout";
import { Button } from "@/src/components/ui/button";
import { useAuth } from "@/src/hooks/use-auth";
import {
  AddressForm,
  toCreatePayload,
  type AddressFormValues,
} from "@/src/components/shared/address-form";
import { getAddress, setDefaultAddress, updateAddress, type UserAddress } from "@/src/lib/api/users";
import { ApiError } from "@/src/lib/api/types";

type Params = { id: string };

export default function EditAddressPage({ params }: { params: Promise<Params> }) {
  const { id } = use(params);
  return (
    <StorefrontLayout mobileTitle="Edit alamat">
      <EditAddressView id={id} />
    </StorefrontLayout>
  );
}

function EditAddressView({ id }: { id: string }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [addr, setAddr] = useState<UserAddress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (isLoading) return;
      if (!isAuthenticated) {
        if (!cancelled) setLoading(false);
        return;
      }
      try {
        const a = await getAddress(id);
        if (!cancelled) setAddr(a);
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Alamat tidak ditemukan.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, isAuthenticated, isLoading]);

  if (!isLoading && !isAuthenticated) {
    return (
      <div className="container mx-auto px-6 py-12 max-w-md text-center">
        <p className="text-sm text-muted mb-4">Masuk untuk mengedit alamat.</p>
        <Button asChild className="rounded-full h-11">
          <Link href="/login">Masuk</Link>
        </Button>
      </div>
    );
  }

  async function onSubmit(v: AddressFormValues) {
    const payload = toCreatePayload(v);
    // is_default isn't a column on update endpoint — set via dedicated route.
    const wantDefault = v.is_default;
    const { is_default: _, ...rest } = payload;
    void _;
    await updateAddress(id, rest);
    if (wantDefault && addr && !addr.is_default) {
      await setDefaultAddress(id);
    }
    router.push("/profile/addresses");
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 md:px-6 py-6 md:py-10 max-w-xl">
        <Link
          href="/profile/addresses"
          className="inline-flex items-center text-sm text-muted hover:text-ink mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Kembali
        </Link>

        <div className="rounded-2xl border border-hairline bg-white p-5 md:p-6 shadow-sm">
          <h1 className="text-xl font-semibold tracking-tight">Edit alamat</h1>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-5 h-5 animate-spin text-muted" />
            </div>
          ) : error ? (
            <p className="text-sm text-red-600 mt-4">{error}</p>
          ) : addr ? (
            <div className="mt-5">
              <AddressForm initial={addr} submitLabel="Simpan perubahan" onSubmit={onSubmit} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
