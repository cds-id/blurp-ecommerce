"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Search, Heart, User, ShoppingCart, Menu, X, LogIn, LogOut, Package } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { cn, formatPrice } from "@/src/lib/utils";
import { SafeImage } from "@/src/components/shared/safe-image";
import { Dialog, DialogContent, DialogTitle } from "@/src/components/ui/dialog";
import { CartBadge } from "@/src/components/shared/cart-badge";
import { products } from "@/src/data/products";
import { storefrontMegaCategories, type StorefrontMegaCategoryId } from "@/src/data/storefront-nav";
import { DesktopNavbarAccount } from "@/src/components/shared/navbar-account";
import { useAuth } from "@/src/hooks/use-auth";

export function DesktopNavbar() {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMega, setActiveMega] = useState<null | StorefrontMegaCategoryId>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const megaCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearMegaCloseTimer = () => {
    if (megaCloseTimer.current) {
      clearTimeout(megaCloseTimer.current);
      megaCloseTimer.current = null;
    }
  };

  const scheduleMegaClose = () => {
    clearMegaCloseTimer();
    megaCloseTimer.current = setTimeout(() => setActiveMega(null), 120);
  };

  useEffect(() => {
    return () => clearMegaCloseTimer();
  }, []);

  const renderLogo = () => (
    <Link href="/" className="flex items-center gap-1.5 shrink-0">
      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      </div>
      <span className="text-xl font-semibold text-ink">SoraStore</span>
    </Link>
  );

  const renderMegaItem = (id: NonNullable<typeof activeMega>, label: string) => (
    <button
      type="button"
      className={cn(
        "px-3 py-2 rounded-full text-sm font-medium transition-colors",
        activeMega === id ? "bg-surface-soft text-ink" : "text-ink/70 hover:text-ink hover:bg-surface-soft"
      )}
      onMouseEnter={() => {
        clearMegaCloseTimer();
        setActiveMega(id);
      }}
      onFocus={() => setActiveMega(id)}
      onClick={() => setActiveMega((v) => (v === id ? null : id))}
      aria-expanded={activeMega === id}
      aria-haspopup="true"
    >
      {label}
    </button>
  );

  const renderDesktopCenterMenu = () => (
    <nav className="hidden md:flex items-center justify-center gap-1">
      {storefrontMegaCategories.map((c) => (
        <span key={c.id} className="contents">
          {renderMegaItem(c.id, c.label)}
        </span>
      ))}
    </nav>
  );

  const renderRightIcons = () => (
    <div className="flex items-center gap-1 relative">
      {/* Search icon -> expands */}
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full hover:bg-surface-soft"
        aria-label="Buka pencarian"
        aria-expanded={isSearchOpen}
        onClick={() => {
          setIsSearchOpen((v) => !v);
          setIsWishlistOpen(false);
        }}
      >
        <Search className="w-5 h-5 text-ink" />
      </Button>

      {/* Wishlist icon -> expands */}
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full hover:bg-surface-soft"
        aria-label="Buka wishlist"
        aria-expanded={isWishlistOpen}
        onClick={() => {
          setIsWishlistOpen((v) => !v);
          setIsSearchOpen(false);
        }}
      >
        <Heart className="w-5 h-5 text-ink" />
      </Button>

      <Link href="/store/keranjang">
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-surface-soft relative">
          <ShoppingCart className="w-5 h-5 text-ink" />
          <CartBadge size="md" placement="corner" />
        </Button>
      </Link>
      <DesktopNavbarAccount />
    </div>
  );

  const renderMegaPanel = () => {
    if (!activeMega) return null;

    const t = storefrontMegaCategories.find((c) => c.id === activeMega);
    if (!t) return null;
    const links = t.links;

    return (
      <div
        className="absolute left-0 right-0 top-full z-50 border-b border-hairline bg-white/95 backdrop-blur"
        onMouseEnter={clearMegaCloseTimer}
        onMouseLeave={scheduleMegaClose}
      >
        <div className="container mx-auto px-6 py-6">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-4">
              <div className="text-xs uppercase tracking-wider text-muted">Explore</div>
              <div className="text-2xl font-bold text-ink mt-2">{t.label}</div>
              <div className="text-sm text-muted mt-2">{t.description}</div>
              <div className="mt-4 grid gap-2">
                {links.map((l) => (
                  <Link
                    key={l.label}
                    href={l.href}
                    className="group flex items-center justify-between rounded-xl px-3 py-2 bg-surface-soft hover:bg-surface-strong transition-colors"
                  >
                    <span className="text-sm font-semibold text-ink">{l.label}</span>
                    <span className="text-sm text-muted group-hover:text-ink transition-colors">→</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="col-span-8 grid grid-cols-3 gap-4">
              {[
                { title: "Glow Essentials", subtitle: "Set simpel untuk kulit fresh", seed: `${t.imageSeed}-1` },
                { title: "Texture Lovers", subtitle: "Creamy to gel, ringan", seed: `${t.imageSeed}-2` },
                { title: "Signature Notes", subtitle: "Clean musk mood", seed: `${t.imageSeed}-3` },
              ].map((c) => (
                <Link
                  key={c.seed}
                  href={`/store/catalog?category=${activeMega}`}
                  className="group rounded-2xl overflow-hidden border border-hairline bg-surface-soft hover:bg-surface-strong transition-colors"
                >
                  <div className="relative h-32 overflow-hidden">
                    <SafeImage
                      src={`https://picsum.photos/seed/${c.seed}/900/600`}
                      alt={c.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                      fallbackSrcs={[
                        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1600&h=900&fit=crop&q=80",
                      ]}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-transparent" />
                  </div>
                  <div className="p-4">
                    <div className="text-sm font-semibold text-ink">{c.title}</div>
                    <div className="text-xs text-muted mt-1">{c.subtitle}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white border-b border-hairline relative">
        {/* Desktop: logo | center menu | icons */}
        <div
          className="hidden md:grid grid-cols-[auto_1fr_auto] items-center px-6 h-16 gap-4"
          onMouseEnter={clearMegaCloseTimer}
          onMouseLeave={scheduleMegaClose}
        >
          {renderLogo()}
          <div className="flex justify-center">
            {renderDesktopCenterMenu()}
          </div>
          {renderRightIcons()}
        </div>

        {/* Mobile/Tablet: flex row logo + hamburger */}
        <div className="flex md:hidden items-center justify-between px-4 h-14">
          {renderLogo()}
          <div className="flex items-center gap-1">
            <Link href="/store/keranjang">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-surface-soft relative">
                <ShoppingCart className="w-5 h-5 text-ink" />
                <CartBadge size="sm" placement="corner" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-surface-soft"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5 text-ink" />
            </Button>
          </div>
        </div>

        {/* Mega menu panel */}
        {renderMegaPanel()}
      </header>

      {/* Fullscreen search dialog (closes on ESC / backdrop / X) */}
      <Dialog
        open={isSearchOpen}
        onOpenChange={(open) => {
          setIsSearchOpen(open);
          if (open) setIsWishlistOpen(false);
          if (!open) setSearchQuery("");
        }}
      >
        <DialogContent className="max-w-2xl rounded-2xl p-0 overflow-hidden">
          <div className="p-6 border-b border-hairline bg-white">
            <DialogTitle className="text-base font-semibold text-ink">Search</DialogTitle>
            <div className="mt-4">
              <div
                className={cn(
                  "flex items-center gap-3 bg-surface-soft border border-hairline rounded-full px-5 h-12 w-full transition-all duration-200",
                  "shadow-sm hover:shadow-md",
                  isSearchFocused && "ring-2 ring-ink border-ink shadow-md"
                )}
              >
                <Search className="w-4 h-4 text-muted shrink-0" />
                <input
                  type="text"
                  placeholder="Cari skincare, makeup, fragrance..."
                  className="flex-1 bg-transparent outline-none text-sm text-ink placeholder:text-muted"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  autoFocus
                />
                <button
                  className="h-9 px-4 bg-primary rounded-full flex items-center justify-center hover:bg-primary-active transition-colors shrink-0 shadow-sm"
                  aria-label="Cari"
                >
                  <Search className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
            {searchQuery.trim() ? (
              <div className="mt-5">
                <div className="text-xs uppercase tracking-wider text-muted mb-3">Hasil</div>
                <div className="grid grid-cols-1 gap-2">
                  {products
                    .filter((p) => p.name.toLowerCase().includes(searchQuery.trim().toLowerCase()))
                    .slice(0, 6)
                    .map((p) => (
                      <Link
                        key={p.id}
                        href={`/store/product/${p.slug}`}
                        className="flex items-center gap-3 rounded-xl border border-hairline bg-white px-3 py-2.5 hover:bg-surface-soft transition-colors"
                        onClick={() => setIsSearchOpen(false)}
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
                          <div className="text-sm font-semibold text-ink line-clamp-1">{p.name}</div>
                          <div className="text-xs text-muted">{p.category}</div>
                        </div>
                        <div className="text-sm font-semibold">{formatPrice(p.price)}</div>
                      </Link>
                    ))}
                </div>
              </div>
            ) : (
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  { label: "Serum", href: "/store/catalog?category=skincare" },
                  { label: "Cleanser", href: "/store/catalog?category=skincare" },
                  { label: "Lip tint", href: "/store/catalog?category=makeup" },
                  { label: "Parfum", href: "/store/catalog?category=fragrance" },
                ].map((t) => (
                  <Link
                    key={t.label}
                    href={t.href}
                    className="px-3 py-1.5 rounded-full bg-white border border-hairline text-xs font-semibold text-ink/70 hover:text-ink hover:border-ink/40 transition-colors"
                    onClick={() => setIsSearchOpen(false)}
                  >
                    {t.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="p-6 bg-surface-soft">
            <div className="text-xs uppercase tracking-wider text-muted mb-3">Trending</div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Vitamin C", href: "/store/catalog?category=skincare" },
                { label: "Niacinamide", href: "/store/catalog?category=skincare" },
                { label: "Cushion", href: "/store/catalog?category=makeup" },
                { label: "Vanilla musk", href: "/store/catalog?category=fragrance" },
              ].map((t) => (
                <Link
                  key={t.label}
                  href={t.href}
                  className="rounded-xl border border-hairline bg-white px-4 py-3 text-sm font-semibold text-ink hover:bg-surface-soft transition-colors"
                  onClick={() => setIsSearchOpen(false)}
                >
                  {t.label}
                </Link>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink/30"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 z-[1] w-72 bg-white shadow-2xl flex flex-col translate-z-0">
            <div className="flex items-center justify-between px-4 h-14 border-b shrink-0">
              <span className="font-semibold text-ink">Menu</span>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <nav className="p-4 flex flex-col gap-1 flex-1 overflow-y-auto">
              <div className="flex items-center gap-2 border border-hairline rounded-full px-4 py-2.5 mb-2">
                <Search className="w-4 h-4 text-muted shrink-0" />
                <input
                  type="text"
                  placeholder="Cari produk..."
                  className="flex-1 bg-transparent outline-none text-sm"
                />
              </div>
              <div className="h-px bg-hairline my-2" />
              <Link
                href="/wishlist"
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-surface-soft transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Heart className="w-5 h-5 text-muted" />
                Wishlist
              </Link>
              <Link
                href="/store/keranjang"
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-surface-soft transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <ShoppingCart className="w-5 h-5 text-muted" />
                Keranjang
                <CartBadge size="md" placement="inline" className="ml-auto" />
              </Link>
              <DesktopMobileMenuAccount onNavigate={() => setIsMobileMenuOpen(false)} />
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

function DesktopMobileMenuAccount({ onNavigate }: { onNavigate: () => void }) {
  const { isAuthenticated, isLoading, profile, user, logout } = useAuth();
  if (isLoading) return null;

  if (!isAuthenticated) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-surface-soft transition-colors"
        onClick={onNavigate}
      >
        <LogIn className="w-5 h-5 text-muted" />
        Masuk
      </Link>
    );
  }

  const email = profile?.email ?? user?.email ?? "";
  const name = profile?.name?.trim() || profile?.username || email.split("@")[0];

  return (
    <>
      <Link
        href="/profile"
        className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-surface-soft transition-colors"
        onClick={onNavigate}
      >
        <User className="w-5 h-5 text-muted" />
        <span className="flex-1 min-w-0">
          <span className="block truncate">{name}</span>
          <span className="block text-[11px] text-muted truncate font-normal">{email}</span>
        </span>
      </Link>
      <Link
        href="/store/tracker"
        className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-surface-soft transition-colors"
        onClick={onNavigate}
      >
        <Package className="w-5 h-5 text-muted" />
        Pesanan saya
      </Link>
      <button
        type="button"
        onClick={async () => {
          onNavigate();
          await logout();
        }}
        className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-surface-soft transition-colors text-red-600 w-full text-left"
      >
        <LogOut className="w-5 h-5" />
        Keluar
      </button>
    </>
  );
}
