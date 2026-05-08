import Link from "next/link";
import { ArrowRight, Star, Truck, RotateCcw, Sparkles, TrendingUp, Shield } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { ProductGrid } from "@/src/components/shared";
import { SafeImage } from "@/src/components/shared/safe-image";
import { mockImages } from "@/src/data/mock-images";
import type { Product } from "@/src/data/products";
import type { Category } from "@/src/data/categories";

export function DesktopHome({
  featuredProducts,
  newDrops,
}: {
  featuredProducts: Product[];
  newDrops: Product[];
  categories?: Category[];
}) {

  const routineCards = [
    {
      title: "Cleanse",
      subtitle: "Mulai dari kulit bersih",
      href: "/store/catalog?category=skincare",
      image: "https://picsum.photos/seed/routine-cleanse/800/900",
    },
    {
      title: "Treat",
      subtitle: "Serum & active care",
      href: "/store/catalog?category=skincare",
      image: "https://picsum.photos/seed/routine-treat/800/900",
    },
    {
      title: "Tint",
      subtitle: "Fresh color sehari-hari",
      href: "/store/catalog?category=makeup",
      image: "https://picsum.photos/seed/routine-tint/800/900",
    },
    {
      title: "Scent",
      subtitle: "Signature notes",
      href: "/store/catalog?category=fragrance",
      image: "https://picsum.photos/seed/routine-scent/800/900",
    },
  ] as const;

  const ingredients = [
    {
      name: "Vitamin C",
      benefit: "Brightening + glow",
      image: "https://picsum.photos/seed/ingredient-vitc/900/700",
    },
    {
      name: "Niacinamide",
      benefit: "Even tone + barrier",
      image: "https://picsum.photos/seed/ingredient-nia/900/700",
    },
    {
      name: "Ceramides",
      benefit: "Hydration + repair",
      image: "https://picsum.photos/seed/ingredient-ceramide/900/700",
    },
  ] as const;

  const reviews = [
    {
      name: "Nadia",
      tag: "Sensitive skin",
      text: "Cleansernya lembut banget—nggak bikin ketarik. Teksturnya creamy tapi tetap ringan.",
      rating: 5,
    },
    {
      name: "Aulia",
      tag: "Daily makeup",
      text: "Lip tint-nya stain cantik, masih rapi setelah makan. Warnanya nggak norak, super wearable.",
      rating: 5,
    },
    {
      name: "Rika",
      tag: "Fragrance lover",
      text: "Vanilla musk-nya elegan, bukan yang terlalu manis. Tahan seharian di baju.",
      rating: 5,
    },
  ] as const;

  return (
    <div className="bg-canvas min-h-screen">
      {/* Hero Section - Full Width with Better Typography */}
      <section className="relative w-full overflow-hidden min-h-[600px] lg:min-h-[700px]">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <SafeImage
            src={mockImages.hero}
            alt="Hero Background"
            className="w-full h-full object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </div>

        {/* Decorative Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse-soft" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
        </div>

        {/* Content */}
        <div className="relative container mx-auto px-6 py-18 lg:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-6 max-w-none">
            {/* Badge with Icon */}
            <div className="animate-fade-in mb-6">
              <Badge className="bg-white/10 text-white hover:bg-white/20 backdrop-blur-md border border-white/20 px-4 py-2 text-sm">
                <Sparkles className="w-4 h-4 mr-2 inline" />
                KOLEKSI TERBARU 2026
              </Badge>
            </div>

            {/* Main Headline - Better Typography */}
            <h1 className="text-5xl md:text-6xl lg:text-[64px] xl:text-[68px] font-bold text-white mb-6 leading-[1.05] tracking-tight animate-slide-up text-balance">
              <span className="whitespace-nowrap">Belanja Cepat,</span>{" "}
              <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent whitespace-nowrap">
                Tanpa Ribet Daftar
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-white/90 mb-2 max-w-none font-light animate-slide-up stagger-1 leading-relaxed">
              Temukan koleksi terbaik untuk gaya hidup Anda
            </p>
            <p className="text-base md:text-lg text-white/70 mb-10 max-w-none animate-slide-up stagger-1 leading-relaxed">
              Checkout mudah, pengiriman cepat ke seluruh Indonesia.{" "}
              Belanja sekarang, bayar nanti.
            </p>

            {/* CTA Buttons - Better Styling */}
            <div className="flex flex-wrap gap-4 mb-12 animate-slide-up stagger-2">
              <Link href="/store/catalog">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 hover:text-primary-active font-semibold rounded-lg px-10 h-16 text-lg shadow-2xl hover:shadow-xl hover:scale-105 transition-all">
                  Belanja Sekarang
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/store/catalog">
                <Button variant="outline" size="lg" className="border-2 border-white/60 text-white bg-transparent hover:bg-white/15 hover:text-white hover:border-white font-semibold rounded-lg px-10 h-16 text-lg backdrop-blur-sm">
                  Lihat Katalog
                </Button>
              </Link>
            </div>

            {/* Stats - Better Layout */}
            <div className="grid grid-cols-3 gap-8 animate-slide-up stagger-3">
              <div className="border-l-4 border-white/30 pl-4">
                <div className="text-4xl font-bold text-white mb-1">50K+</div>
                <div className="text-sm text-white/60 uppercase tracking-wide">Produk Tersedia</div>
              </div>
              <div className="border-l-4 border-white/30 pl-4">
                <div className="text-4xl font-bold text-white mb-1">10K+</div>
                <div className="text-sm text-white/60 uppercase tracking-wide">Penjual Terpercaya</div>
              </div>
              <div className="border-l-4 border-white/30 pl-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-4xl font-bold text-white">4.9</div>
                  <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                </div>
                <div className="text-sm text-white/60 uppercase tracking-wide">Rating Pengguna</div>
              </div>
            </div>
            </div>

            {/* Right Visual — keeps hero horizontal on desktop */}
            <div className="hidden lg:block lg:col-span-6">
              <div className="relative">
                <div className="relative rounded-2xl overflow-hidden bg-white/95 shadow-2xl ring-1 ring-white/30">
                  <div className="aspect-[4/5]">
                    <SafeImage
                      src={mockImages.product1}
                      alt="Featured Product"
                      className="h-full w-full object-cover"
                      sizes="(min-width: 1024px) 40vw, 90vw"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-semibold text-ink">4.9</span>
                      <span className="text-xs text-muted">(2.4k)</span>
                    </div>
                    <h3 className="font-semibold text-ink mb-2">Premium Watch Collection</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-primary">Rp 2.499.000</span>
                      <span className="text-sm text-muted line-through">Rp 3.200.000</span>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-8 -left-10 w-52 rounded-xl overflow-hidden shadow-xl bg-white">
                  <SafeImage
                    src={mockImages.product2}
                    alt="Featured"
                    className="w-full h-56 object-cover"
                    sizes="(min-width: 1024px) 200px, 200px"
                  />
                </div>

                <div className="absolute -top-4 -right-4 bg-primary text-white px-4 py-2 rounded-full shadow-lg">
                  <span className="text-sm font-bold">-22% OFF</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Routine — Cosmetics-style */}
      <section className="bg-white py-14 border-b border-hairline">
        <div className="container mx-auto px-6">
          <div className="flex items-end justify-between gap-6 mb-8">
            <div>
              <h2 className="text-3xl font-bold text-ink mb-2">Shop by Routine</h2>
              <p className="text-muted">Rangkaian simple untuk hasil maksimal.</p>
            </div>
            <Link
              href="/store/catalog?category=skincare"
              className="text-sm text-primary hover:text-primary-active flex items-center gap-1 transition-colors font-semibold group"
            >
              Mulai dari Skincare
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {routineCards.map((card, idx) => (
              <Link
                key={card.title}
                href={card.href}
                className={`group rounded-2xl overflow-hidden bg-surface-soft hover:bg-surface-strong transition-all hover:shadow-xl animate-fade-in stagger-${idx + 1}`}
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <SafeImage
                    src={card.image}
                    alt={card.title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                    fallbackSrcs={[
                      "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=1200&h=1500&fit=crop&q=80",
                    ]}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5">
                    <div className="text-white/90 text-xs uppercase tracking-wider">{card.subtitle}</div>
                    <div className="text-white text-2xl font-semibold mt-1">{card.title}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="bg-surface-soft py-16">
        <div className="container mx-auto px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-ink mb-2">Best Sellers</h2>
              <p className="text-muted">Favorit yang cepat habis — restock rutin.</p>
            </div>
            <Link
              href="/store/catalog"
              className="text-sm text-primary hover:text-primary-active flex items-center gap-1 transition-colors font-semibold group"
            >
              Lihat semua
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <ProductGrid
            products={featuredProducts}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            itemClassName="animate-fade-in stagger-1"
            skeletonCount={4}
            simulateMs={0}
          />
        </div>
      </section>

      {/* New Drops */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-ink mb-2">New Drops</h2>
              <p className="text-muted">Rilisan baru untuk glow season.</p>
            </div>
            <Link
              href="/store/catalog"
              className="text-sm text-primary hover:text-primary-active flex items-center gap-1 transition-colors font-semibold group"
            >
              Explore
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Link
              href="/store/catalog?category=skincare"
              className="group relative rounded-2xl overflow-hidden lg:col-span-5 min-h-[340px] hover-lift"
            >
              <SafeImage
                src={mockImages.hero2}
                alt="New Drops"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
                fallbackSrcs={[
                  "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1600&h=900&fit=crop&q=80",
                ]}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-10">
                <Badge className="w-fit mb-4 bg-white text-ink text-xs font-bold px-4 py-2">
                  NEW
                </Badge>
                <h3 className="text-4xl font-bold text-white mb-2">Glow Essentials</h3>
                <p className="text-white/85 text-lg mb-6 max-w-[520px] leading-relaxed text-pretty">
                  Set simpel untuk kulit tampak fresh tanpa effort.
                </p>
                <Button className="w-fit bg-white text-ink hover:bg-white/90 rounded-full px-6">
                  Lihat Skincare
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Link>

            <ProductGrid
              products={newDrops.length > 0 ? newDrops : featuredProducts.slice(0, 4)}
              className="lg:col-span-7 grid grid-cols-2 gap-6"
              itemClassName="animate-fade-in stagger-1"
              skeletonCount={4}
              simulateMs={0}
            />
          </div>
        </div>
      </section>

      {/* Ingredients Spotlight */}
      <section className="bg-surface-soft py-16">
        <div className="container mx-auto px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-ink mb-2">Ingredients Spotlight</h2>
              <p className="text-muted">Pilih formula sesuai kebutuhan kulit.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ingredients.map((ing) => (
              <div key={ing.name} className="rounded-2xl overflow-hidden bg-white border border-hairline shadow-sm hover:shadow-lg transition-shadow">
                <div className="relative h-40">
                  <SafeImage
                    src={ing.image}
                    alt={ing.name}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                    fallbackSrcs={[
                      "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=1600&h=900&fit=crop&q=80",
                    ]}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <div className="text-white text-xl font-semibold">{ing.name}</div>
                    <div className="text-white/80 text-sm">{ing.benefit}</div>
                  </div>
                </div>
                <div className="p-5">
                  <Link
                    href="/store/catalog?category=skincare"
                    className="text-sm font-semibold text-primary hover:text-primary-active inline-flex items-center gap-1"
                  >
                    Lihat produk
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews / UGC */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-ink mb-2">Real Results</h2>
              <p className="text-muted">Review asli dari pelanggan SoraStore.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((r) => (
              <div key={r.name} className="rounded-2xl border border-hairline bg-surface-soft p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-semibold text-ink">{r.name}</div>
                    <div className="text-xs text-muted">{r.tag}</div>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-ink/80 leading-relaxed">{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promos */}
      <section className="container mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-ink mb-2">Seasonal Offers</h2>
            <p className="text-muted">Bundle hemat untuk routine favorit.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link 
            href="/store/catalog?promo=flash"
            className="group relative rounded-2xl overflow-hidden h-80 hover-lift"
          >
            <img 
              src={mockImages.banner1}
              alt="Flash Sale"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/60" />
            <div className="absolute inset-0 flex flex-col justify-center p-10">
              <Badge className="w-fit mb-4 bg-white text-primary text-xs font-bold px-4 py-2">
                <TrendingUp className="w-4 h-4 mr-2 inline" />
                FLASH SALE
              </Badge>
              <h3 className="text-4xl font-bold text-white mb-3">Diskon hingga 70%</h3>
              <p className="text-white/90 text-lg mb-6">Berakhir dalam 12 jam</p>
              <Button className="w-fit bg-white text-primary hover:bg-white/90 rounded-lg">
                Belanja Sekarang
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </Link>

          <Link 
            href="/store/catalog?promo=new"
            className="group relative rounded-2xl overflow-hidden h-80 hover-lift"
          >
            <img 
              src={mockImages.banner2}
              alt="New Collection"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-luxe/90 to-luxe/60" />
            <div className="absolute inset-0 flex flex-col justify-center p-10">
              <Badge className="w-fit mb-4 bg-white text-luxe text-xs font-bold px-4 py-2">
                <Sparkles className="w-4 h-4 mr-2 inline" />
                KOLEKSI BARU
              </Badge>
              <h3 className="text-4xl font-bold text-white mb-3">Item Eksklusif</h3>
              <p className="text-white/90 text-lg mb-6">Limited edition</p>
              <Button className="w-fit bg-white text-luxe hover:bg-white/90 rounded-lg">
                Lihat Koleksi
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </Link>
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-ink text-white py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Kenapa SoraStore?</h2>
            <p className="text-white/70 text-lg">Beauty essentials dengan pengalaman belanja yang rapi.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white stroke-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Authentic Picks</h3>
              <p className="text-white/70">Kurasi produk yang nyaman dipakai sehari-hari.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-white stroke-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-white/70">Packing rapi, kirim cepat, tracking jelas.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <RotateCcw className="w-8 h-8 text-white stroke-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Returns</h3>
              <p className="text-white/70">Proses cepat kalau ada yang nggak cocok.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}