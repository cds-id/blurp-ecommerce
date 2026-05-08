"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MailCheck } from "lucide-react";
import { StorefrontLayout } from "@/src/components/storefront-layout";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { useAuth } from "@/src/hooks/use-auth";
import { ApiError } from "@/src/lib/api/types";

export default function ForgotPasswordPage() {
  return (
    <StorefrontLayout mobileTitle="Lupa password">
      <ForgotPasswordView />
    </StorefrontLayout>
  );
}

function ForgotPasswordView() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal mengirim email reset.");
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
        {sent ? (
          <div className="text-center">
            <div className="h-14 w-14 rounded-full bg-emerald-50 ring-4 ring-emerald-100 flex items-center justify-center mx-auto mb-4">
              <MailCheck className="h-7 w-7 text-emerald-600" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">Cek email kamu</h1>
            <p className="text-sm text-muted mt-1">
              Jika email terdaftar, kami sudah mengirim link reset password yang berlaku 60 menit.
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-semibold tracking-tight">Lupa password</h1>
            <p className="text-sm text-muted mt-1 mb-5">
              Masukkan email akun. Kami kirim link untuk reset password.
            </p>
            <form onSubmit={onSubmit} className="space-y-4">
              <label className="block">
                <span className="text-xs font-semibold text-ink mb-1.5 block">Email</span>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="h-11 rounded-xl border-hairline"
                />
              </label>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button
                type="submit"
                disabled={submitting || !email}
                className="w-full h-11 rounded-full font-semibold"
              >
                {submitting ? "Mengirim..." : "Kirim link reset"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
