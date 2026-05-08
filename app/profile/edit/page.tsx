"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { StorefrontLayout } from "@/src/components/storefront-layout";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { useAuth } from "@/src/hooks/use-auth";
import { ApiError } from "@/src/lib/api/types";

export default function EditProfilePage() {
  return (
    <StorefrontLayout mobileTitle="Edit profil">
      <EditProfileView />
    </StorefrontLayout>
  );
}

function EditProfileView() {
  const { profile, isAuthenticated, isLoading, updateProfile, refreshProfile } = useAuth();
  const [name, setName] = useState(() => profile?.name ?? "");
  const [username, setUsername] = useState(() => profile?.username ?? "");
  const [phone, setPhone] = useState(() => profile?.phone ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Sync once when profile first arrives (id changes only).
  const seededFor = useRef<string | null>(profile?.id ?? null);
  useEffect(() => {
    if (!profile) return;
    if (seededFor.current === profile.id) return;
    seededFor.current = profile.id;
    setName(profile.name ?? "");
    setUsername(profile.username ?? "");
    setPhone(profile.phone ?? "");
  }, [profile]);

  if (!isLoading && !isAuthenticated) {
    return <NotLoggedIn />;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await updateProfile({
        name: name.trim() || undefined,
        username: username.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      await refreshProfile();
      setSuccess("Profil berhasil diperbarui.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal memperbarui profil.");
    } finally {
      setSubmitting(false);
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
          <h1 className="text-xl font-semibold tracking-tight">Edit profil</h1>
          <p className="text-sm text-muted mt-1">
            {profile?.email ?? "Memuat..."}
          </p>

          <form onSubmit={onSubmit} className="space-y-4 mt-5">
            <Field label="Nama">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama lengkap"
                className="h-11 rounded-xl border-hairline"
              />
            </Field>
            <Field label="Username">
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                className="h-11 rounded-xl border-hairline"
                minLength={3}
                maxLength={50}
                pattern="[A-Za-z0-9_-]+"
              />
            </Field>
            <Field label="No. HP">
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08xxxxxxxxxx"
                inputMode="tel"
                className="h-11 rounded-xl border-hairline"
              />
            </Field>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-emerald-600">{success}</p>}

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-11 rounded-full font-semibold"
            >
              {submitting ? "Menyimpan..." : "Simpan perubahan"}
            </Button>
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

function NotLoggedIn() {
  return (
    <div className="container mx-auto px-6 py-12 max-w-md text-center">
      <p className="text-sm text-muted mb-4">Kamu harus masuk untuk mengubah profil.</p>
      <Button asChild className="rounded-full h-11">
        <Link href="/login">Masuk</Link>
      </Button>
    </div>
  );
}
