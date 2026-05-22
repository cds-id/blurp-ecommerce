"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/src/components/ui/button";

const menuItems = [
  ["Dashboard", "⌂", "/admin"],
  ["Produk", "◧", "/admin/products"],
  ["Stok", "▦", "/admin/stock"],
  ["Pesanan", "✉", "/admin/orders"],
  ["Pengiriman", "📦", "/admin/shipping"],
  ["Pembayaran", "₱", "/admin/payments"],
  ["Rekonsiliasi", "⇄", "/admin/reconciliation"],
  ["Laporan", "📊", "/admin/reports"],
  ["Konten", "✎", "/admin/content"],
  ["Pengaturan", "⚙", "/admin/settings"],
] as const;

interface AdminSidebarProps {
  onNavigate?: () => void;
  showClose?: boolean;
}

export function AdminSidebar({ onNavigate, showClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-50 border-r border-admin-ink p-3.5 bg-admin-sidebar min-h-screen md:min-h-0">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-cursive font-bold text-lg">◆ Admin</div>
          <div className="text-micro text-admin-muted mt-0.5">SoraStore Backoffice</div>
        </div>
        {showClose ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 shrink-0 md:hidden"
            onClick={onNavigate}
            aria-label="Tutup menu"
          >
            <X className="h-5 w-5" />
          </Button>
        ) : null}
      </div>

      <div className="border-t border-dashed border-admin-ink my-3" />

      <nav aria-label="Menu admin">
        {menuItems.map(([name, icon, href]) => (
          <Link
            key={name}
            href={href}
            onClick={onNavigate}
            className={`flex items-center gap-2 min-h-11 py-2.5 px-2.5 mb-0.5 rounded-sm ${
              pathname === href
                ? "bg-admin-ink text-admin-on-dark font-bold border border-admin-ink"
                : "hover:bg-admin-hover"
            }`}
          >
            <span className="w-3.5 shrink-0" aria-hidden>
              {icon}
            </span>
            {name}
          </Link>
        ))}
      </nav>

      <div className="border-t border-dashed border-admin-ink my-3" />

      <div className="text-sm text-admin-muted">
        <div>👤 Admin Toko</div>
        <div className="text-micro mt-0.5">admin@sorastore.id</div>
        <div className="text-micro mt-1.5">Keluar →</div>
      </div>
    </aside>
  );
}
