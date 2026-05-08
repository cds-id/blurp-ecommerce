import Link from "next/link";
import { ArrowRight, Star, Sparkles, TrendingUp, Shield, Truck, RotateCcw } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { ProductGrid } from "@/src/components/shared";
import { SafeImage } from "@/src/components/shared/safe-image";
import { mockImages } from "@/src/data/mock-images";
import type { Category } from "@/src/data/categories";
import type { Product } from "@/src/data/products";

export function MobileHome({
  categories,
  featuredProducts,
  newDrops,
}: {
  categories: Category[];
  featuredProducts: Product[];
  newDrops: Product[];
}) {

  const routineCards = [
    { title: "Cleanse", subtitle: "Mulai dari kulit bersih", href: "/store/catalog?category=skincare", image: "https://picsum.photos/seed/m-routine-cleanse/900/900" },
    { title: "Treat", subtitle: "Serum & active care", href: "/store/catalog?category=skincare", image: "https://picsum.photos/seed/m-routine-treat/900/900" },
    { title: "Tint", subtitle: "Fresh color", href: "/store/catalog?category=makeup", image: "https://picsum.photos/seed/m-routine-tint/900/900" },
    { title: "Scent", subtitle: "Signature notes", href: "/store/catalog?category=fragrance", image: "https://picsum.photos/seed/m-routine-scent/900/900" },
  ] as const;

  const ingredients = [
    { name: "Vitamin C", benefit: "Brightening + glow", image: "https://picsum.photos/seed/m-ingredient-vitc/900/700" },
    { name: "Niacinamide", benefit: "Even tone + barrier", image: "https://picsum.photos/seed/m-ingredient-nia/900/700" },
    { name: "Ceramides", benefit: "Hydration + repair", image: "https://picsum.photos/seed/m-ingredient-ceramide/900/700" },
  ] as const;

  const reviews = [
    { name: "Nadia", tag: "Sensitive skin", text: "Cleansernya lembut banget—nggak bikin ketarik. Teksturnya creamy tapi tetap ringan.", rating: 5 },
    { name: "Aulia", tag: "Daily makeup", text: "Lip tint-nya stain cantik, masih rapi setelah makan. Warnanya super wearable.", rating: 5 },
    { name: "Rika", tag: "Fragrance lover", text: "Vanilla musk-nya elegan, bukan yang terlalu manis. Tahan lama di baju.", rating: 5 },
  ] as const;

  return (
    <div className="bg-canvas min-h-screen">
      {/* Hero Section - Full Width with Better Typography */}
      <section className="relative w-full overflow-hidden min-h-[500px]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <SafeImage
            src={mockImages.hero3}
            alt="Hero"
            className="w-full h-full object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse-soft" />
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />

        {/* Content */}
        <div className="relative px-5 pt-20 pb-10">
          {/* Badge */}
          <Badge className="bg-white/10 text-white hover:bg-white/20 backdrop-blur-md border border-white/20 mb-4 px-3 py-1.5">
            <Sparkles className="w-3 h-3 mr-1.5 inline" />
            KOLEKSI TERBARU 2026
          </Badge>

          {/* Headline */}
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight animate-slide-up">
            Belanja Cepat,
            <br />
            <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              Tanpa Ribet Daftar
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-white/90 mb-2 animate-slide-up stagger-1 font-light">
            Temukan koleksi terbaik untuk gaya hidup Anda
          </p>
          
          <p className="text-sm text-white/70 mb-6 animate-slide-up stagger-1">
            Checkout mudah, pengiriman cepat ke seluruh Indonesia
          </p>

          {/* CTA Button */}
          <Link href="/store/catalog" className="animate-slide-up stagger-2">
            <Button className="bg-white text-primary hover:bg-white/90 hover:text-primary-active font-semibold rounded-lg px-8 h-14 shadow-lg text-base">
              Belanja Sekarang
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8 animate-slide-up stagger-3">
            <div className="border-l-2 border-white/30 pl-3">
              <div className="text-2xl font-bold text-white">50K+</div>
              <div className="text-xs text-white/60 uppercase">Produk</div>
            </div>
            <div className="border-l-2 border-white/30 pl-3">
              <div className="text-2xl font-bold text-white">10K+</div>
              <div className="text-xs text-white/60 uppercase">Penjual</div>
            </div>
            <div className="border-l-2 border-white/30 pl-3">
              <div className="flex items-center gap-1">
                <div className="text-2xl font-bold text-white">4.9</div>
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              </div>
              <div className="text-xs text-white/60 uppercase">Rating</div>
            </div>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path
              d="M0 80L60 73.3C120 66.7 240 53.3 360 46.7C480 40 600 40 720 43.3C840 46.7 960 53.3 1080 56.7C1200 60 1320 60 1380 60L1440 60V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z"
              fill="#ffffff"
            />
          </svg>
        </div>
      </section>

      {/* Shop by Routine */}
      <section className="px-4 py-6 bg-white">
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="font-bold text-lg text-ink">Shop by Routine</h2>
            <p className="text-xs text-muted">Rangkaian simple, hasil maksimal</p>
          </div>
          <Link href="/store/catalog?category=skincare" className="text-xs text-primary font-semibold">
            Skincare
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
          {routineCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group relative rounded-2xl overflow-hidden shrink-0 w-44 h-56 bg-surface-soft shadow-sm transition-shadow hover:shadow-md"
            >
              <SafeImage
                src={card.image}
                alt={card.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
                fallbackSrcs={[
                  "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=1200&h=1500&fit=crop&q=80",
                ]}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="text-[10px] uppercase tracking-wider text-white/85">{card.subtitle}</div>
                <div className="text-white text-xl font-semibold mt-1">{card.title}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="px-4 py-6 bg-surface-soft">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-lg text-ink">Categories</h2>
            <p className="text-xs text-muted">Skincare sampai tools</p>
          </div>
          <Link href="/store/catalog" className="text-xs text-primary font-semibold">
            Semua
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {categories.slice(0, 4).map((category, index) => (
            <Link
              key={category.id}
              href={`/store/catalog?category=${category.slug}`}
              className={`text-center animate-fade-in stagger-${index + 1}`}
            >
              <div className="aspect-square rounded-xl overflow-hidden mb-2 relative group shadow-sm">
                <SafeImage
                  src={category.image || `https://picsum.photos/200/200?random=${index + 10}`}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-xs font-semibold text-ink">{category.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="px-4 py-6 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-lg text-ink">Best Sellers</h2>
            <p className="text-xs text-muted">Favorit yang cepat habis</p>
          </div>
          <Link
            href="/store/catalog"
            className="text-xs text-primary flex items-center gap-1 font-semibold"
          >
            Semua
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <ProductGrid
          products={featuredProducts}
          className="grid grid-cols-2 gap-3"
          itemClassName="animate-fade-in stagger-1"
          skeletonCount={4}
          simulateMs={0}
        />
      </section>

      {/* New Drops */}
      <section className="px-4 py-6 bg-surface-soft">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-lg text-ink">New Drops</h2>
            <p className="text-xs text-muted">Rilisan baru untuk glow season</p>
          </div>
        </div>

        <Link
          href="/store/catalog?category=skincare"
          className="group relative rounded-2xl overflow-hidden h-44 block mb-4"
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
          <div className="absolute inset-0 flex flex-col justify-end p-5">
            <Badge className="w-fit mb-2 bg-white text-ink text-[10px] font-bold px-3 py-1.5">
              NEW
            </Badge>
            <h3 className="text-xl font-bold text-white mb-1">Glow Essentials</h3>
            <p className="text-xs text-white/85 mb-3 max-w-[220px]">
              Set simpel untuk kulit tampak fresh.
            </p>
            <Button size="sm" className="w-fit bg-white text-ink hover:bg-white/90 rounded-full">
              Lihat Skincare
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Link>

        <ProductGrid
          products={(newDrops.length > 0 ? newDrops : featuredProducts).slice(0, 4)}
          className="grid grid-cols-2 gap-3"
          itemClassName="animate-fade-in stagger-1"
          skeletonCount={4}
          simulateMs={0}
        />
      </section>

      {/* Ingredients Spotlight */}
      <section className="px-4 py-6 bg-white">
        <div className="mb-4">
          <h2 className="font-bold text-lg text-ink">Ingredients</h2>
          <p className="text-xs text-muted">Pilih formula sesuai kebutuhan kulit</p>
        </div>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
          {ingredients.map((ing) => (
            <div
              key={ing.name}
              className="shrink-0 w-64 rounded-2xl overflow-hidden border border-hairline bg-surface-soft shadow-sm"
            >
              <div className="relative h-32">
                <SafeImage
                  src={ing.image}
                  alt={ing.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                  fallbackSrcs={[
                    "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=1600&h=900&fit=crop&q=80",
                  ]}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="text-white text-base font-semibold">{ing.name}</div>
                  <div className="text-white/80 text-xs">{ing.benefit}</div>
                </div>
              </div>
              <div className="p-4">
                <Link href="/store/catalog?category=skincare" className="text-xs text-primary font-semibold inline-flex items-center gap-1">
                  Lihat produk
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section className="px-4 py-6 bg-surface-soft">
        <div className="mb-4">
          <h2 className="font-bold text-lg text-ink">Real Results</h2>
          <p className="text-xs text-muted">Review asli dari pelanggan</p>
        </div>
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.name} className="rounded-2xl border border-hairline bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-ink text-sm">{r.name}</div>
                  <div className="text-[11px] text-muted">{r.tag}</div>
                </div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
              <p className="text-sm text-ink/80 mt-2 leading-relaxed">{r.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Seasonal Offers */}
      <section className="px-4 py-6 bg-white">
        <Link 
          href="/store/catalog?promo=flash"
          className="group relative rounded-2xl overflow-hidden h-48 block"
        >
          <img 
            src={mockImages.banner1}
            alt="Seasonal Offers"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/40" />
          <div className="absolute inset-0 flex flex-col justify-center p-6">
            <Badge className="w-fit mb-3 bg-white text-primary text-xs font-bold px-3 py-1.5">
              <TrendingUp className="w-3 h-3 mr-1.5 inline" />
              BUNDLE DEALS
            </Badge>
            <h3 className="text-2xl font-bold text-white mb-2">Hemat untuk Routine</h3>
            <p className="text-sm text-white/90 mb-4">Pilihan set untuk glow season</p>
            <Button size="sm" className="w-fit bg-white text-primary hover:bg-white/90 rounded-full">
              Lihat Promo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Link>
      </section>

      {/* Trust Section */}
      <section className="bg-ink text-white py-10 px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Kenapa SoraStore?</h2>
          <p className="text-white/70 text-sm">Beauty essentials dengan pengalaman belanja yang rapi</p>
        </div>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6 text-white stroke-white" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Authentic Picks</h3>
              <p className="text-white/70 text-sm">Kurasi produk yang nyaman dipakai sehari-hari</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6 text-white stroke-white" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Fast Delivery</h3>
              <p className="text-white/70 text-sm">Packing rapi, kirim cepat, tracking jelas</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shrink-0">
              <RotateCcw className="w-6 h-6 text-white stroke-white" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Easy Returns</h3>
              <p className="text-white/70 text-sm">Proses cepat kalau ada yang nggak cocok</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}