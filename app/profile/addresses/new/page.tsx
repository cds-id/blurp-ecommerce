"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { StorefrontLayout } from "@/src/components/storefront-layout";
import { Button } from "@/src/components/ui/button";
import { useAuth } from "@/src/hooks/use-auth";
import { AddressForm, toCreatePayload } from "@/src/components/shared/address-form";
import { createAddress } from "@/src/lib/api/users";

export default function NewAddressPage() {
  return (
    <StorefrontLayout mobileTitle="Tambah alamat">
      <NewAddressView />
    </StorefrontLayout>
  );
}

function NewAddressView() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  if (!isLoading && !isAuthenticated) {
    return (
      <div className="container mx-auto px-6 py-12 max-w-md text-center">
        <p className="text-sm text-muted mb-4">Masuk untuk menambah alamat.</p>
        <Button asChild className="rounded-full h-11">
          <Link href="/login">Masuk</Link>
        </Button>
      </div>
    );
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
          <h1 className="text-xl font-semibold tracking-tight">Tambah alamat</h1>
          <p className="text-sm text-muted mt-1 mb-5">
            Alamat akan dipakai untuk checkout & ongkos kirim.
          </p>
          <AddressForm
            submitLabel="Simpan alamat"
            onSubmit={async (v) => {
              await createAddress(toCreatePayload(v));
              router.push("/profile/addresses");
            }}
          />
        </div>
      </div>
    </div>
  );
}
