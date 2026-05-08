"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Menu,
  ShoppingCart,
  X,
  Search,
  Heart,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { CartBadge } from "@/src/components/shared/cart-badge";
import { products } from "@/src/data/products";
import { formatPrice } from "@/src/lib/utils";
import { SafeImage } from "@/src/components/shared/safe-image";
import {
  storefrontMegaCategories,
  type StorefrontMegaCategoryId,
} from "@/src/data/storefront-nav";
import { MobileNavbarAccount } from "@/src/components/shared/navbar-account";

interface MobileNavbarProps {
  title?: string;
}

export function MobileNavbar({ title }: MobileNavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] =
    useState<StorefrontMegaCategoryId | null>(null);

  const closeMenu = () => {
    setIsMenuOpen(false);
    setActiveCategory(null);
  };

  useEffect(() => {
    const shouldLock = isMenuOpen || isSearchOpen;
    if (!shouldLock) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMenuOpen, isSearchOpen]);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter((p) => p.name.toLowerCase().includes(q))
      .slice(0, 6);
  }, [searchQuery]);

  const activeCategoryDef = activeCategory
    ? storefrontMegaCategories.find((c) => c.id === activeCategory) ?? null
    : null;

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white border-b border-hairline">
        <div className="flex h-14 items-center justify-between px-4">
          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(true)} aria-label="Buka menu">
            <Menu className="h-5 w-5" />
          </Button>

          <Link href="/" className="flex items-center gap-1.5" onClick={closeMenu}>
            <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="font-semibold text-ink">{title || "SoraStore"}</span>
          </Link>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="relative" asChild aria-label="Keranjang">
              <Link href="/store/keranjang">
                <ShoppingCart className="h-5 w-5" />
                <CartBadge size="sm" placement="corner" offsetClassName="-top-0.5 -right-0.5" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="px-4 pb-3">
          <button
            className="w-full flex items-center gap-2 px-4 py-2.5 bg-surface-soft rounded-full text-sm text-muted border border-transparent hover:border-hairline transition-colors"
            onClick={() => setIsSearchOpen(true)}
          >
            <Search className="w-4 h-4" />
            <span>Cari produk...</span>
          </button>
        </div>
      </header>

      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="flex items-center gap-3 p-4 border-b border-hairline">
            <button
              onClick={() => {
                setIsSearchOpen(false);
                setSearchQuery("");
              }}
              aria-label="Tutup pencarian"
            >
              <X className="h-5 w-5" />
            </button>
            <Input
              type="search"
              placeholder="Cari produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border-0 bg-transparent focus:ring-0"
              autoFocus
            />
            <button
              className="w-10 h-10 bg-primary rounded-full flex items-center justify-center"
              onClick={() => {}}
              aria-label="Cari"
            >
              <Search className="w-5 h-5 text-white" />
            </button>
          </div>
          <div className="p-4">
            {searchQuery.trim() ? (
              <>
                <p className="text-xs uppercase tracking-wider text-muted mb-3">Hasil</p>
                {searchResults.length > 0 ? (
                  <div className="space-y-2">
                    {searchResults.map((p) => (
                      <Link
                        key={p.id}
                        href={`/store/product/${p.slug}`}
                        className="flex items-center gap-3 p-3 rounded-xl border border-hairline hover:bg-surface-soft transition-colors"
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchQuery("");
                        }}
                      >
                        <div className="h-12 w-12 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                          <SafeImage
                            src={p.images?.[0] ?? `https://picsum.photos/seed/${p.slug}/120/120`}
                            alt={p.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-ink line-clamp-1">{p.name}</div>
                          <div className="text-xs text-muted-foreground">{p.category}</div>
                        </div>
                        <div className="text-sm font-semibold">{formatPrice(p.price)}</div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">Tidak ada hasil.</div>
                )}
              </>
            ) : (
              <>
                <p className="text-sm text-muted mb-4">Pencarian populer</p>
                <div className="flex flex-wrap gap-2">
                  {["Skincare", "Makeup", "Fragrance", "Hair", "Body"].map((term) => (
                    <button
                      key={term}
                      className="px-4 py-2 bg-surface-soft rounded-full text-sm hover:bg-hairline transition-colors"
                      onClick={() => setSearchQuery(term)}
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Mobile Menu Drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-ink/30"
            onClick={closeMenu}
          />
          <div
            className="absolute left-0 top-0 bottom-0 z-[1] bg-white shadow-xl flex flex-col"
            style={{ width: "88%", maxWidth: 384 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 h-14 border-b border-hairline shrink-0">
              {activeCategoryDef ? (
                <button
                  className="flex items-center gap-2 text-sm font-medium text-ink"
                  onClick={() => setActiveCategory(null)}
                  aria-label="Kembali ke menu utama"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {activeCategoryDef.label}
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="currentColor">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <span className="font-semibold">SoraStore</span>
                </div>
              )}
              <Button variant="ghost" size="icon" onClick={closeMenu} aria-label="Tutup menu">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {activeCategoryDef ? (
                <div className="p-4">
                  <Link
                    href={`/store/catalog?category=${activeCategoryDef.id}`}
                    className="block rounded-2xl border border-hairline overflow-hidden bg-surface-soft mb-4"
                    onClick={closeMenu}
                  >
                    <div className="relative h-32">
                      <SafeImage
                        src={`https://picsum.photos/seed/${activeCategoryDef.imageSeed}/900/600`}
                        alt={activeCategoryDef.label}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                      <div className="absolute bottom-3 left-4 text-white">
                        <div className="text-[11px] uppercase tracking-wider opacity-80">Explore</div>
                        <div className="text-xl font-semibold">{activeCategoryDef.label}</div>
                        <div className="text-xs opacity-90 mt-0.5">{activeCategoryDef.description}</div>
                      </div>
                    </div>
                  </Link>
                  <div className="grid gap-2">
                    {activeCategoryDef.links.map((link) => (
                      <Link
                        key={link.label}
                        href={link.href}
                        className="flex items-center justify-between rounded-xl px-4 py-3 bg-surface-soft hover:bg-surface-strong transition-colors"
                        onClick={closeMenu}
                      >
                        <span className="text-sm font-semibold text-ink">{link.label}</span>
                        <ChevronRight className="w-4 h-4 text-muted" />
                      </Link>
                    ))}
                    <Link
                      href={`/store/catalog?category=${activeCategoryDef.id}`}
                      className="flex items-center justify-between rounded-xl px-4 py-3 border border-hairline hover:bg-surface-soft transition-colors mt-1"
                      onClick={closeMenu}
                    >
                      <span className="text-sm font-medium text-ink/80">
                        Lihat semua {activeCategoryDef.label}
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted" />
                    </Link>
                  </div>
                </div>
              ) : (
                <nav className="p-3">
                  <p className="px-2 pt-1 pb-2 text-[11px] uppercase tracking-wider text-muted">
                    Kategori
                  </p>
                  <div className="grid gap-0.5">
                    {storefrontMegaCategories.map((c) => (
                      <button
                        key={c.id}
                        className="flex items-center justify-between gap-3 px-3 py-3 rounded-xl text-left hover:bg-surface-soft transition-colors"
                        onClick={() => setActiveCategory(c.id)}
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-ink">{c.label}</div>
                          <div className="text-xs text-muted line-clamp-1">{c.description}</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted shrink-0" />
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-hairline my-3" />

                  <p className="px-2 pt-1 pb-2 text-[11px] uppercase tracking-wider text-muted">
                    Untuk kamu
                  </p>
                  <div className="grid gap-0.5">
                    <Link
                      href="/store/catalog"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-surface-soft transition-colors"
                      onClick={closeMenu}
                    >
                      <span>Semua produk</span>
                      <span className="ml-auto text-[10px] font-bold tracking-wider uppercase text-muted">
                        NEW
                      </span>
                    </Link>
                    <Link
                      href="/wishlist"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-surface-soft transition-colors"
                      onClick={closeMenu}
                    >
                      <Heart className="w-5 h-5 text-muted" />
                      <span>Wishlist</span>
                    </Link>
                    <Link
                      href="/store/keranjang"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-surface-soft transition-colors"
                      onClick={closeMenu}
                    >
                      <ShoppingCart className="w-5 h-5 text-muted" />
                      <span>Keranjang</span>
                      <CartBadge size="md" placement="inline" className="ml-auto" />
                    </Link>
                    <Link
                      href="/store/tracker"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-surface-soft transition-colors"
                      onClick={closeMenu}
                    >
                      <span className="w-5 h-5 inline-flex items-center justify-center text-muted">
                        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                          <line x1="12" y1="22.08" x2="12" y2="12" />
                        </svg>
                      </span>
                      <span>Lacak pesanan</span>
                    </Link>
                  </div>
                </nav>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-hairline p-4 shrink-0">
              <MobileNavbarAccount closeMenu={closeMenu} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
