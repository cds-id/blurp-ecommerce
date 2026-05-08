"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Lock, User } from "lucide-react";
import { StorefrontLayout } from "@/src/components/storefront-layout";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { useAuth } from "@/src/hooks/use-auth";
import { ApiError } from "@/src/lib/api/types";

export default function PasswordLoginPage() {
  return (
    <StorefrontLayout mobileTitle="Masuk dengan password">
      <PasswordLoginView />
    </StorefrontLayout>
  );
}

function PasswordLoginView() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login({ username, password });
      router.push("/profile");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Login gagal. Periksa username & password.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-6 md:py-12 max-w-md">
      <Link href="/login" className="inline-flex items-center text-sm text-muted hover:text-ink mb-4">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Kembali
      </Link>

      <div className="rounded-2xl border border-hairline bg-white p-6 md:p-8 shadow-sm">
        <h1 className="text-xl font-semibold tracking-tight">Masuk dengan password</h1>
        <p className="text-sm text-muted mt-1 mb-5">
          Gunakan username & password akun kamu.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <span className="text-xs font-semibold text-ink mb-1.5 block">Username</span>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                className="h-11 pl-10 rounded-xl border-hairline"
              />
            </div>
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-ink mb-1.5 block">Password</span>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="h-11 pl-10 rounded-xl border-hairline"
              />
            </div>
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button
            type="submit"
            disabled={submitting || !username || !password}
            className="w-full h-11 rounded-full font-semibold"
          >
            {submitting ? "Memeriksa..." : (
              <>
                Masuk
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>

          <div className="flex items-center justify-between text-xs">
            <Link href="/login" className="text-ink/70 hover:text-ink underline-offset-2 hover:underline">
              Pakai magic link
            </Link>
            <Link href="/auth/forgot-password" className="text-ink/70 hover:text-ink underline-offset-2 hover:underline">
              Lupa password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
