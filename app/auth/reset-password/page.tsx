"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { StorefrontLayout } from "@/src/components/storefront-layout";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { useAuth } from "@/src/hooks/use-auth";
import { ApiError } from "@/src/lib/api/types";

export default function ResetPasswordPage() {
  return (
    <StorefrontLayout mobileTitle="Reset password">
      <Suspense fallback={<div className="p-8 text-center text-sm text-muted">Memuat...</div>}>
        <ResetPasswordView />
      </Suspense>
    </StorefrontLayout>
  );
}

function ResetPasswordView() {
  const params = useSearchParams();
  const router = useRouter();
  const { resetPassword } = useAuth();
  const token = params.get("token") ?? "";
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!token) {
      setError("Token reset tidak ditemukan di URL.");
      return;
    }
    if (next !== confirm) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }
    setSubmitting(true);
    try {
      await resetPassword(token, next);
      setDone(true);
      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal reset password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-6 md:py-12 max-w-md">
      <Link href="/login" className="inline-flex items-center text-sm text-muted hover:text-ink mb-4">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Ke halaman masuk
      </Link>

      <div className="rounded-2xl border border-hairline bg-white p-6 md:p-8 shadow-sm">
        {done ? (
          <div className="text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
            <h1 className="text-xl font-semibold tracking-tight">Password diubah</h1>
            <p className="text-sm text-muted mt-1">Mengarahkan ke halaman masuk...</p>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-semibold tracking-tight">Reset password</h1>
            <p className="text-sm text-muted mt-1 mb-5">Masukkan password baru kamu.</p>
            <form onSubmit={onSubmit} className="space-y-4">
              <label className="block">
                <span className="text-xs font-semibold text-ink mb-1.5 block">Password baru</span>
                <Input
                  type="password"
                  value={next}
                  onChange={(e) => setNext(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="h-11 rounded-xl border-hairline"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-ink mb-1.5 block">Konfirmasi</span>
                <Input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="h-11 rounded-xl border-hairline"
                />
              </label>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-11 rounded-full font-semibold"
              >
                {submitting ? "Menyimpan..." : "Reset password"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
