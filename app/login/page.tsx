"use client";

import { useState } from "react";
import Link from "next/link";
import { StorefrontLayout } from "@/src/components/storefront-layout";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Mail, ArrowRight, ArrowLeft, ShoppingBag, MailCheck } from "lucide-react";
import { SafeImage } from "@/src/components/shared/safe-image";
import { useAuth } from "@/src/hooks/use-auth";
import { ApiError } from "@/src/lib/api/types";

function LoginContent() {
  const { requestMagicLink } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await requestMagicLink(email);
      setSent(true);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Gagal mengirim magic link. Coba lagi.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <StorefrontLayout
      mobileTitle="Masuk"
      desktopContent={
        <DesktopLoginView
          email={email}
          setEmail={setEmail}
          sent={sent}
          setSent={setSent}
          onSubmit={handleSubmit}
          submitting={submitting}
          error={error}
        />
      }
      mobileContent={
        <MobileLoginView
          email={email}
          setEmail={setEmail}
          sent={sent}
          setSent={setSent}
          onSubmit={handleSubmit}
          submitting={submitting}
          error={error}
        />
      }
    >
      {/* unused: we render desktopContent/mobileContent above */}
      <div />
    </StorefrontLayout>
  );
}

interface ViewProps {
  email: string;
  setEmail: (v: string) => void;
  sent: boolean;
  setSent: (v: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  error: string | null;
}

function DesktopLoginView({ email, setEmail, sent, setSent, onSubmit, submitting, error }: ViewProps) {
  if (sent) {
    return (
      <div className="min-h-[calc(100vh-4rem)] relative overflow-hidden">
        <div className="absolute inset-0">
          <SafeImage
            src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=2200&auto=format&fit=crop&q=80"
            alt="Beauty background"
            className="h-full w-full object-cover"
            loading="lazy"
            fallbackSrcs={[
              "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=2200&auto=format&fit=crop&q=80",
              "https://picsum.photos/seed/login-hero/2200/1400",
            ]}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/95 via-ink/70 to-transparent" />
        </div>

        <div className="relative container mx-auto px-6 lg:px-8 min-h-[calc(100vh-4rem)] flex items-center py-5 lg:py-6">
          <div className="w-full max-w-[1240px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_408px] gap-10 lg:gap-14 items-center">
            <div className="text-white space-y-4 max-w-lg">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3 py-1 mb-4">
                  <span className="text-[11px] font-semibold uppercase tracking-wider">Magic link terkirim</span>
                </div>
                <h1 className="text-4xl xl:text-5xl font-bold tracking-tight leading-[1.05] mb-3">
                  Cek inbox email kamu
                </h1>
                <p className="text-sm lg:text-base text-white/90 leading-relaxed">
                  Kami sudah mengirim magic link ke <strong className="text-white">{email}</strong>. Klik tautan di email untuk masuk.
                </p>
              </div>
            </div>

            <div className="w-full">
              <div className="rounded-3xl border border-white/20 bg-white p-7 shadow-2xl backdrop-blur-sm text-center">
                <div className="h-16 w-16 rounded-full bg-emerald-50 ring-4 ring-emerald-100 flex items-center justify-center mx-auto mb-5">
                  <MailCheck className="h-8 w-8 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight mb-2 text-ink">
                  Email terkirim
                </h2>
                <p className="text-sm text-muted mb-6 leading-relaxed">
                  Buka email & klik tautan untuk masuk.
                  <br />
                  Link berlaku 15 menit.
                </p>

                <div className="flex flex-col gap-2.5">
                  <Button
                    className="rounded-full h-11 text-sm font-semibold"
                    onClick={() => setSent(false)}
                  >
                    Kirim ulang
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full h-11 border-hairline text-sm font-medium"
                    onClick={() => setSent(false)}
                  >
                    Ganti email
                  </Button>
                </div>

                <div className="mt-6 pt-5 border-t border-hairline">
                  <Link
                    href="/store/catalog"
                    className="block text-center text-sm font-medium text-ink/70 hover:text-ink transition-colors"
                  >
                    ← Lanjut sebagai tamu
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] relative overflow-hidden">
      <div className="absolute inset-0">
        <SafeImage
          src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=2200&auto=format&fit=crop&q=80"
          alt="Beauty background"
          className="h-full w-full object-cover"
          loading="lazy"
          fallbackSrcs={[
            "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=2200&auto=format&fit=crop&q=80",
            "https://picsum.photos/seed/login-hero/2200/1400",
          ]}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/95 via-ink/70 to-transparent" />
      </div>

        <div className="relative container mx-auto px-6 lg:px-8 min-h-[calc(100vh-4rem)] flex items-center py-4 lg:py-5">
          <div className="w-full max-w-[1240px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_408px] gap-8 lg:gap-12 items-center">
          <div className="text-white space-y-3 lg:pr-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3 py-1 mb-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Magic link</span>
              </div>
              <h1 className="text-4xl xl:text-5xl font-bold tracking-tight leading-[1.05] mb-2">
                Masuk ke SoraStore
              </h1>
              <p className="text-sm lg:text-base text-white/90 leading-relaxed">
                Login cepat tanpa password. Kami kirim magic link ke email kamu.
              </p>
            </div>

            <div className="space-y-2 pt-1 w-full">
              <div className="flex items-start gap-2 w-full min-w-0">
                <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm text-white/90 leading-snug">Tanpa password</span>
              </div>
              <div className="flex items-start gap-2 w-full min-w-0">
                <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm text-white/90 leading-snug">Aman & cepat</span>
              </div>
              <div className="flex items-start gap-2 w-full min-w-0">
                <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm text-white/90 leading-snug">Cocok untuk checkout tamu</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                variant="outline"
                className="rounded-full border-white/30 bg-white/10 text-white hover:bg-white/20 hover:border-white/40 hover:text-white h-10 px-5 text-sm backdrop-blur-sm"
              >
                <Link href="/store/catalog">
                  Lanjut belanja
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="rounded-full text-white/90 hover:text-white hover:bg-white/10 h-10 px-5 text-sm"
              >
                <Link href="/store/tracker">
                  Lacak pesanan
                </Link>
              </Button>
            </div>
          </div>

          <div className="w-full">
            <div className="rounded-3xl border border-white/20 bg-white p-7 shadow-2xl backdrop-blur-sm">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary text-white mb-4">
                  <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-ink mb-1.5">Masuk</h2>
                <p className="text-sm text-muted">Kami kirim magic link ke email kamu.</p>
              </div>

              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ink">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="kamu@email.com"
                      className="h-11 pl-10 text-sm rounded-xl border-hairline focus-visible:ring-2 focus-visible:ring-primary"
                      required
                      autoComplete="email"
                      inputMode="email"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 rounded-full text-sm font-semibold"
                  size="lg"
                  disabled={submitting || !email}
                >
                  {submitting ? "Mengirim..." : "Kirim magic link"}
                  {!submitting && <ArrowRight className="h-4 w-4 ml-2" />}
                </Button>
                {error && (
                  <p className="text-xs text-red-600 text-center">{error}</p>
                )}
              </form>

              <div className="relative my-5 flex items-center">
                <div className="flex-1 h-px bg-hairline" />
                <span className="px-3 text-[10px] uppercase tracking-wider text-muted font-semibold">atau</span>
                <div className="flex-1 h-px bg-hairline" />
              </div>

              <Button
                variant="outline"
                className="w-full h-10 rounded-full border-hairline text-sm font-medium hover:bg-surface-soft"
                disabled
              >
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Lanjut dengan Google
              </Button>

              <div className="mt-6 pt-5 border-t border-hairline space-y-3">
                <div className="flex items-center justify-center gap-3 text-sm">
                  <Link
                    href="/login/password"
                    className="font-medium text-ink hover:underline underline-offset-2"
                  >
                    Masuk dengan password
                  </Link>
                  <span className="text-muted">·</span>
                  <Link
                    href="/auth/forgot-password"
                    className="font-medium text-ink/70 hover:text-ink underline-offset-2 hover:underline"
                  >
                    Lupa password?
                  </Link>
                </div>
                <Link
                  href="/store/catalog"
                  className="block text-center text-sm font-medium text-ink/70 hover:text-ink transition-colors"
                >
                  ← Lanjut sebagai tamu
                </Link>
                <p className="text-center text-[10px] text-muted leading-relaxed">
                  Dengan masuk, kamu menyetujui{" "}
                  <Link href="/terms" className="text-ink hover:underline underline-offset-2 font-medium">
                    Syarat
                  </Link>{" "}
                  dan{" "}
                  <Link href="/privacy" className="text-ink hover:underline underline-offset-2 font-medium">
                    Privasi
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileLoginView({ email, setEmail, sent, setSent, onSubmit, submitting, error }: ViewProps) {
  if (sent) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex flex-col px-6 pt-12 pb-8 bg-white">
        <Link href="/store/catalog" className="self-start text-ink/70 -ml-1 mb-6 inline-flex items-center text-sm">
          <ArrowLeft className="w-5 h-5 mr-1" />
          Kembali
        </Link>

        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="h-20 w-20 rounded-full bg-emerald-50 ring-4 ring-emerald-100 flex items-center justify-center mb-5">
            <MailCheck className="h-10 w-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight mb-2">Cek email kamu</h1>
          <p className="text-sm text-muted mb-1">
            Magic link sudah dikirim ke
          </p>
          <p className="text-sm font-medium text-ink mb-8 break-all">{email}</p>

          <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
            <Button
              variant="outline"
              className="rounded-full h-11 border-hairline text-sm"
              onClick={() => setSent(false)}
            >
              Ganti email
            </Button>
            <Button
              className="rounded-full h-11 text-sm"
              onClick={() => setSent(false)}
            >
              Kirim ulang
            </Button>
          </div>

          <p className="mt-6 text-xs text-muted">
            Tidak ketemu emailnya? Cek folder Spam/Promotions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col bg-white">
      <div className="px-6 pt-8 pb-6">
        <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-primary text-white mb-5">
          <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight mb-1">Selamat datang</h1>
        <p className="text-sm text-muted">
          Masuk dengan magic link — tanpa password.
        </p>
      </div>

      <div className="px-6 flex-1">
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-ink/80">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kamu@email.com"
                className="h-12 pl-10 rounded-xl border-hairline focus-visible:ring-ink text-base"
                required
                autoComplete="email"
                inputMode="email"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 rounded-full text-sm font-semibold mt-2"
            size="lg"
            disabled={submitting || !email}
          >
            {submitting ? "Mengirim..." : "Kirim magic link"}
            {!submitting && <ArrowRight className="h-4 w-4 ml-2" />}
          </Button>
          {error && (
            <p className="text-xs text-red-600 text-center mt-2">{error}</p>
          )}
        </form>

        <div className="relative my-5 flex items-center">
          <div className="flex-1 h-px bg-hairline" />
          <span className="px-3 text-[11px] uppercase tracking-wider text-muted">atau</span>
          <div className="flex-1 h-px bg-hairline" />
        </div>

        <Button
          variant="outline"
          className="w-full h-11 rounded-full border-hairline text-sm font-medium"
          disabled
        >
          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Lanjut dengan Google
        </Button>

        <div className="flex items-center justify-center gap-3 text-sm mt-5">
          <Link
            href="/login/password"
            className="font-medium text-ink hover:underline underline-offset-2"
          >
            Masuk dengan password
          </Link>
          <span className="text-muted">·</span>
          <Link
            href="/auth/forgot-password"
            className="font-medium text-ink/70 hover:text-ink underline-offset-2 hover:underline"
          >
            Lupa password?
          </Link>
        </div>

        <p className="text-[11px] text-muted text-center mt-5 leading-relaxed">
          Dengan masuk, kamu menyetujui{" "}
          <Link href="/terms" className="text-ink underline underline-offset-2">
            Syarat
          </Link>{" "}
          dan{" "}
          <Link href="/privacy" className="text-ink underline underline-offset-2">
            Kebijakan Privasi
          </Link>
          .
        </p>
      </div>

      <div className="border-t border-hairline px-6 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] mt-6">
        <Link
          href="/store/catalog"
          className="flex items-center justify-center gap-2 w-full h-12 rounded-full border border-hairline text-sm font-medium text-ink/80 hover:bg-surface-soft transition-colors"
        >
          <ShoppingBag className="w-4 h-4" />
          Lanjut sebagai tamu
        </Link>
        <p className="text-center text-[11px] text-muted mt-3">
          Belanja tanpa akun tetap bisa dilacak via halaman pelacakan.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <LoginContent />;
}
