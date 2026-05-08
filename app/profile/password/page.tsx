"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { StorefrontLayout } from "@/src/components/storefront-layout";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { useAuth } from "@/src/hooks/use-auth";
import { ApiError } from "@/src/lib/api/types";

export default function ChangePasswordPage() {
  return (
    <StorefrontLayout mobileTitle="Ganti password">
      <ChangePasswordView />
    </StorefrontLayout>
  );
}

function ChangePasswordView() {
  const { isAuthenticated, isLoading, changePassword } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isLoading && !isAuthenticated) {
    return (
      <div className="container mx-auto px-6 py-12 max-w-md text-center">
        <p className="text-sm text-muted mb-4">Kamu harus masuk untuk mengganti password.</p>
        <Button asChild className="rounded-full h-11">
          <Link href="/login">Masuk</Link>
        </Button>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (next !== confirm) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }
    setSubmitting(true);
    try {
      await changePassword({ current_password: current, new_password: next });
      setSuccess(true);
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal mengganti password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 md:px-6 py-6 md:py-10 max-w-md">
        <Link href="/profile" className="inline-flex items-center text-sm text-muted hover:text-ink mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Kembali
        </Link>

        <div className="rounded-2xl border border-hairline bg-white p-5 md:p-6 shadow-sm">
          <h1 className="text-xl font-semibold tracking-tight">Ganti password</h1>
          <p className="text-sm text-muted mt-1">
            Masukkan password saat ini lalu password baru.
          </p>

          <form onSubmit={onSubmit} className="space-y-4 mt-5">
            <Field label="Password saat ini">
              <Input
                type="password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                required
                autoComplete="current-password"
                className="h-11 rounded-xl border-hairline"
              />
            </Field>
            <Field label="Password baru">
              <Input
                type="password"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="h-11 rounded-xl border-hairline"
              />
            </Field>
            <Field label="Konfirmasi password baru">
              <Input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="h-11 rounded-xl border-hairline"
              />
            </Field>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && (
              <p className="text-sm text-emerald-600">
                Password berhasil diganti.
              </p>
            )}

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-11 rounded-full font-semibold"
            >
              {submitting ? "Menyimpan..." : "Ganti password"}
            </Button>

            <p className="text-center text-xs text-muted">
              Lupa password?{" "}
              <Link href="/auth/forgot-password" className="text-ink underline underline-offset-2">
                Reset via email
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-ink mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}
