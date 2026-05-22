"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { AdminSidebar } from "./sidebar";
import { Button } from "@/src/components/ui/button";

export function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-admin-canvas font-handwritten text-admin-ink">
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex h-14 items-center gap-3 border-b border-admin-ink bg-admin-sidebar px-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11 shrink-0"
          onClick={() => setMenuOpen(true)}
          aria-label="Buka menu admin"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <span className="font-cursive font-bold text-lg">Admin</span>
      </div>

      {menuOpen ? (
        <div className="md:hidden fixed inset-0 z-[60]">
          <button
            type="button"
            className="absolute inset-0 bg-admin-ink/30"
            aria-label="Tutup menu"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-[min(280px,85vw)] shadow-xl">
            <AdminSidebar onNavigate={() => setMenuOpen(false)} showClose />
          </div>
        </div>
      ) : null}

      <aside className="hidden md:block shrink-0">
        <AdminSidebar />
      </aside>

      <main className="flex-1 min-w-0 pt-14 md:pt-0">{children}</main>
    </div>
  );
}
