"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  LogIn,
  LogOut,
  Menu,
  Package,
  ShieldCheck,
  User,
} from "lucide-react";
import { useAuth } from "@/src/hooks/use-auth";

function initialsFor(name?: string | null, email?: string | null): string {
  const src = (name?.trim() || email?.split("@")[0] || "").trim();
  if (!src) return "U";
  const parts = src.split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/**
 * Desktop account control. Acts as a small popover when logged in.
 * Shows initials + email; menu has Profil, Pesanan, Wishlist, Logout.
 * When logged out, renders the original "Masuk" button shape.
 */
export function DesktopNavbarAccount() {
  const { isAuthenticated, isLoading, profile, user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  if (isLoading) {
    return (
      <div className="ml-1 h-10 w-20 rounded-full border border-hairline animate-pulse bg-surface-soft" />
    );
  }

  if (!isAuthenticated) {
    return (
      <Link href="/login" className="ml-1">
        <button className="flex items-center gap-2 pl-3 pr-4 py-2 rounded-full border border-hairline hover:border-ink hover:shadow-md transition-all">
          <Menu className="w-4 h-4 text-muted" />
          <div className="w-7 h-7 rounded-full bg-ink flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-white" />
          </div>
        </button>
      </Link>
    );
  }

  const displayName = profile?.name?.trim() || profile?.username || user?.email?.split("@")[0] || "Akun";
  const email = profile?.email ?? user?.email ?? "";
  const initials = initialsFor(profile?.name ?? profile?.username, email);
  const isAdmin = !!profile?.is_admin;

  return (
    <div className="relative ml-1" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-hairline hover:border-ink hover:shadow-md transition-all"
      >
        <div className="w-7 h-7 rounded-full bg-ink text-white flex items-center justify-center text-[11px] font-semibold">
          {initials}
        </div>
        <span className="hidden lg:inline text-sm font-medium text-ink max-w-[120px] truncate">
          {displayName}
        </span>
        <ChevronDown className={`w-4 h-4 text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] w-64 rounded-2xl border border-hairline bg-white shadow-xl z-50 overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-hairline">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-ink truncate">{displayName}</p>
              {isAdmin && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5">
                  <ShieldCheck className="w-3 h-3" />
                  Admin
                </span>
              )}
            </div>
            <p className="text-xs text-muted truncate mt-0.5">{email}</p>
          </div>

          <ul className="py-1">
            <MenuItem href="/profile" icon={User} label="Profil saya" onClick={() => setOpen(false)} />
            <MenuItem href="/store/tracker" icon={Package} label="Pesanan saya" onClick={() => setOpen(false)} />
            <MenuItem href="/profile/addresses" icon={Package} label="Alamat" onClick={() => setOpen(false)} />
            {isAdmin && (
              <MenuItem href="/admin" icon={ShieldCheck} label="Panel admin" onClick={() => setOpen(false)} />
            )}
          </ul>

          <div className="border-t border-hairline">
            <button
              type="button"
              onClick={async () => {
                setOpen(false);
                await logout();
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-surface-soft transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Keluar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuItem({
  href,
  icon: Icon,
  label,
  onClick,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
}) {
  return (
    <li>
      <Link
        href={href}
        onClick={onClick}
        className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink hover:bg-surface-soft transition-colors"
      >
        <Icon className="w-4 h-4 text-muted" />
        {label}
      </Link>
    </li>
  );
}

/**
 * Mobile drawer footer block — replaces the static "Akun saya" footer.
 * Caller passes a closeMenu callback (drawer onClick handler).
 */
export function MobileNavbarAccount({ closeMenu }: { closeMenu: () => void }) {
  const { isAuthenticated, isLoading, profile, user, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface-soft animate-pulse">
        <div className="w-9 h-9 rounded-full bg-hairline" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 w-24 bg-hairline rounded" />
          <div className="h-2.5 w-32 bg-hairline rounded" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Link
        href="/login"
        onClick={closeMenu}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface-soft hover:bg-surface-strong transition-colors"
      >
        <div className="w-9 h-9 rounded-full bg-ink text-white flex items-center justify-center">
          <LogIn className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-ink">Masuk / Daftar</div>
          <div className="text-xs text-muted line-clamp-1">Simpan alamat & lacak pesanan</div>
        </div>
      </Link>
    );
  }

  const displayName = profile?.name?.trim() || profile?.username || user?.email?.split("@")[0] || "Akun";
  const email = profile?.email ?? user?.email ?? "";
  const initials = initialsFor(profile?.name ?? profile?.username, email);
  const isAdmin = !!profile?.is_admin;

  return (
    <div className="space-y-2">
      <Link
        href="/profile"
        onClick={closeMenu}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface-soft hover:bg-surface-strong transition-colors"
      >
        <div className="w-9 h-9 rounded-full bg-ink text-white flex items-center justify-center text-xs font-semibold">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold text-ink truncate">{displayName}</div>
            {isAdmin && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5">
                Admin
              </span>
            )}
          </div>
          <div className="text-xs text-muted truncate">{email}</div>
        </div>
      </Link>

      <button
        type="button"
        onClick={async () => {
          closeMenu();
          await logout();
        }}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-hairline text-sm font-medium text-red-600 hover:bg-surface-soft transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Keluar
      </button>
    </div>
  );
}
