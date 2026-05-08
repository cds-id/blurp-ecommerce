"use client";

import Link from "next/link";
import {
  User,
  Package,
  Heart,
  MapPin,
  Bell,
  ShieldCheck,
  HelpCircle,
  LogIn,
  LogOut,
  ChevronRight,
  ShoppingBag,
} from "lucide-react";
import { StorefrontLayout } from "@/src/components/storefront-layout";
import { Button } from "@/src/components/ui/button";
import { useLastOrder } from "@/src/data/mock-orders";
import { formatPrice } from "@/src/lib/utils";
import { useAuth } from "@/src/hooks/use-auth";

interface ProfileSection {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  badge?: string;
}

const accountSections: ProfileSection[] = [
  {
    href: "/store/tracker",
    icon: Package,
    title: "Pesanan saya",
    description: "Lacak status & lihat riwayat pesanan kamu.",
  },
  {
    href: "/wishlist",
    icon: Heart,
    title: "Wishlist",
    description: "Produk yang kamu simpan untuk dilihat lagi.",
  },
  {
    href: "/profile/addresses",
    icon: MapPin,
    title: "Alamat",
    description: "Atur alamat pengiriman default kamu.",
  },
  {
    href: "/profile/notifications",
    icon: Bell,
    title: "Notifikasi",
    description: "Email & WhatsApp update pesanan dan promo.",
  },
  {
    href: "/profile/edit",
    icon: User,
    title: "Edit profil",
    description: "Ubah nama, username, atau no. HP.",
  },
  {
    href: "/profile/password",
    icon: ShieldCheck,
    title: "Ganti password",
    description: "Ganti password akun kamu.",
  },
];

const helpSections: ProfileSection[] = [
  {
    href: "/kontak",
    icon: HelpCircle,
    title: "Bantuan & FAQ",
    description: "Jawaban cepat seputar pesanan dan pengembalian.",
  },
  {
    href: "/about",
    icon: ShieldCheck,
    title: "Privasi & keamanan",
    description: "Pelajari bagaimana kami menjaga data kamu.",
  },
];

export default function ProfilePage() {
  return (
    <StorefrontLayout mobileTitle="Akun saya">
      <ProfileView />
    </StorefrontLayout>
  );
}

function ProfileView() {
  const lastOrder = useLastOrder();
  const { user, profile, isAuthenticated, isLoading, logout } = useAuth();
  const displayName =
    profile?.name?.trim() ||
    profile?.username ||
    profile?.email?.split("@")[0] ||
    user?.email?.split("@")[0] ||
    "Tamu";

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 md:px-6 py-6 md:py-10 max-w-3xl">
        {/* Header (guest or user) */}
        <div className="rounded-2xl border border-hairline bg-white p-5 md:p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-surface-soft border border-hairline flex items-center justify-center shrink-0">
              <User className="w-6 h-6 text-ink/70" />
            </div>
            <div className="min-w-0 flex-1">
              {isLoading ? (
                <p className="text-base md:text-lg font-semibold text-ink">Memuat...</p>
              ) : isAuthenticated ? (
                <>
                  <p className="text-base md:text-lg font-semibold text-ink truncate">
                    Halo, {displayName}
                  </p>
                  <p className="text-sm text-muted truncate">
                    {profile?.email ?? user?.email}
                    {profile?.is_admin && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5">
                        Admin
                      </span>
                    )}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-base md:text-lg font-semibold text-ink">Halo, Tamu</p>
                  <p className="text-sm text-muted">
                    Masuk untuk menyimpan alamat & pantau pesanan lebih cepat.
                  </p>
                </>
              )}
            </div>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            {isAuthenticated ? (
              <>
                <Button
                  onClick={() => logout()}
                  variant="outline"
                  className="rounded-full h-11 border-hairline flex-1 sm:flex-none"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Keluar
                </Button>
                <Button asChild className="rounded-full h-11 font-semibold flex-1">
                  <Link href="/store/catalog">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Belanja
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild className="rounded-full h-11 font-semibold flex-1">
                  <Link href="/login">
                    <LogIn className="w-4 h-4 mr-2" />
                    Masuk / Daftar
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-full h-11 border-hairline flex-1 sm:flex-none"
                >
                  <Link href="/store/catalog">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Belanja
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Last order shortcut */}
        {lastOrder && (
          <div className="mt-4 rounded-2xl border border-hairline bg-white p-4 md:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider text-muted">Pesanan terakhir</p>
                <p className="font-mono font-semibold text-ink mt-0.5 truncate">
                  {lastOrder.id}
                </p>
                <p className="text-xs text-muted mt-0.5">
                  {formatPrice(lastOrder.total)} ·{" "}
                  {new Date(lastOrder.createdAt).toLocaleDateString("id-ID")}
                </p>
              </div>
              <Button
                asChild
                size="sm"
                className="rounded-full h-9 shrink-0"
              >
                <Link href="/store/tracker">
                  Lacak
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Account sections */}
        <SectionList title="Akun" items={accountSections} />

        {/* Help */}
        <SectionList title="Bantuan" items={helpSections} />

        <p className="text-center text-xs text-muted mt-8 mb-4">
          SoraStore demo · halaman akun versi tamu.
        </p>
      </div>
    </div>
  );
}

function SectionList({ title, items }: { title: string; items: ProfileSection[] }) {
  return (
    <div className="mt-6">
      <h2 className="text-xs uppercase tracking-wider text-muted font-medium px-1 mb-2">
        {title}
      </h2>
      <ul className="rounded-2xl border border-hairline bg-white overflow-hidden divide-y divide-hairline">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={`${title}-${item.title}`}>
              <Link
                href={item.href}
                className="flex items-center gap-4 px-4 py-3.5 hover:bg-surface-soft transition-colors"
              >
                <div className="h-10 w-10 rounded-full bg-surface-soft flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-ink" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-ink truncate">{item.title}</p>
                    {item.badge && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider rounded-full bg-surface-soft text-muted border border-hairline px-2 py-0.5">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted truncate">{item.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted shrink-0" />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
