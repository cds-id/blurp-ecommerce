"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { StorefrontLayout } from "@/src/components/storefront-layout";
import { Button } from "@/src/components/ui/button";
import { useAuth } from "@/src/hooks/use-auth";
import { ApiError } from "@/src/lib/api/types";

type Status = "verifying" | "success" | "error";

function CallbackInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { completeMagicLink } = useAuth();
  const [status, setStatus] = useState<Status>("verifying");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const email = params.get("email");
      const token = params.get("token");
      if (!email || !token) {
        if (cancelled) return;
        setStatus("error");
        setMessage("Link tidak valid. Coba minta magic link baru.");
        return;
      }
      try {
        await completeMagicLink(email, token);
        if (cancelled) return;
        setStatus("success");
        setTimeout(() => router.replace("/profile"), 800);
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof ApiError ? err.message : "Verifikasi gagal.";
        setStatus("error");
        setMessage(msg);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params, completeMagicLink, router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-3xl border border-hairline bg-white p-8 shadow-sm text-center">
        {status === "verifying" && (
          <>
            <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-semibold tracking-tight">Memverifikasi...</h1>
            <p className="text-sm text-muted mt-1">Sebentar, kami sedang memvalidasi magic link.</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
            <h1 className="text-xl font-semibold tracking-tight">Berhasil masuk</h1>
            <p className="text-sm text-muted mt-1">Mengarahkan ke akun kamu...</p>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h1 className="text-xl font-semibold tracking-tight">Verifikasi gagal</h1>
            <p className="text-sm text-muted mt-1">{message}</p>
            <div className="mt-6 flex flex-col gap-2">
              <Button asChild className="rounded-full h-11">
                <Link href="/login">Coba lagi</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full h-11 border-hairline">
                <Link href="/store/catalog">Lanjut belanja</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function MagicLinkCallbackPage() {
  return (
    <StorefrontLayout mobileTitle="Verifikasi">
      <Suspense fallback={<div className="p-8 text-center text-sm text-muted">Memuat...</div>}>
        <CallbackInner />
      </Suspense>
    </StorefrontLayout>
  );
}
