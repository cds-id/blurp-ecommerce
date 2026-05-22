"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Heart, Share2, Truck, ShieldCheck, RotateCcw, Star } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Separator } from "@/src/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { QuantityPicker, VariantSelector } from "@/src/components/shared";
import { SafeImage } from "@/src/components/shared/safe-image";
import { type Product } from "@/src/data/products";
import { shippingOptions, cities } from "@/src/data/shipping";
import { formatPrice, calculateDiscount, cn } from "@/src/lib/utils";
import { useCart } from "@/src/components/shared/cart-provider";

interface DesktopProductDetailProps {
  product: Product;
  defaultVariantId?: string | null;
}

function pickInitialVariantId(product: Product, defaultVariantId?: string | null): string | null {
  if (defaultVariantId) return defaultVariantId;
  const opts = product.variantOptions;
  if (!opts?.length) return null;
  const inStock = opts.find((v) => v.stock > 0);
  return (inStock ?? opts[0]).id;
}

export function DesktopProductDetail({ product, defaultVariantId }: DesktopProductDetailProps) {
  const showVariantPicker = (product.variantOptions?.length ?? 0) > 1;
  const showColorSize =
    !showVariantPicker && (product.colors.length > 0 || product.sizes.length > 0);

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(() =>
    pickInitialVariantId(product, defaultVariantId),
  );
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name || "");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedCity, setSelectedCity] = useState("");
  const [showShipping, setShowShipping] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const { addVariant } = useCart();

  const selectedOption = product.variantOptions?.find((v) => v.id === selectedVariantId);
  const displayPrice = selectedOption?.priceIdr ?? product.price;
  const displayStock = selectedOption?.stock ?? product.stock;

  useEffect(() => {
    setSelectedVariantId(pickInitialVariantId(product, defaultVariantId));
    setSelectedColor(product.colors[0]?.name || "");
    setSelectedSize("");
    setQuantity(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only reset when navigating to another product
  }, [product.slug, defaultVariantId]);

  useEffect(() => {
    if (displayStock <= 0) {
      setQuantity(1);
      return;
    }
    setQuantity((q) => Math.min(Math.max(1, q), displayStock));
  }, [displayStock, selectedVariantId]);

  useEffect(() => {
    setActiveImage(0);
  }, [selectedVariantId]);

  const galleryImages = useMemo(() => {
    const base = product.images?.length ? [...product.images] : [];
    const v = selectedOption?.imageUrl?.trim();
    if (!v) return base;
    const rest = base.filter((u) => u !== v);
    return [v, ...rest];
  }, [product.images, selectedOption?.imageUrl]);

  const discount = product.originalPrice
    ? calculateDiscount(product.originalPrice, displayPrice)
    : null;

  const isLowStock = displayStock <= 3 && displayStock > 0;

  return (
    <div className="bg-canvas min-h-screen">
      {/* Breadcrumb */}
      <div className="store-container py-4">
        <nav className="flex items-center text-sm text-muted">
          <Link href="/" className="hover:text-ink transition-colors">Beranda</Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <Link href="/store/catalog" className="hover:text-ink transition-colors">Katalog</Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <Link href={`/store/catalog?category=${product.categorySlug}`} className="hover:text-ink transition-colors">
            {product.category}
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-ink font-medium">{product.name}</span>
        </nav>
      </div>

      <div className="store-container pb-16">
        <div className="grid grid-cols-2 gap-12">
          {/* Image Gallery - Airbnb Style */}
          <div className="space-y-4">
            <div className="aspect-square rounded-xl overflow-hidden bg-surface-soft group">
              <SafeImage
                src={galleryImages[activeImage] ?? ""}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(min-width: 1024px) 45vw, 100vw"
                priority
              />
            </div>
            <div className="grid grid-cols-4 gap-3">
              {galleryImages.map((img, i) => (
                <button
                  key={i}
                  className={cn(
                    "aspect-square rounded-lg overflow-hidden transition-all",
                    activeImage === i 
                      ? "ring-2 ring-ink" 
                      : "hover:ring-2 hover:ring-primary/50"
                  )}
                  onClick={() => setActiveImage(i)}
                >
                  <SafeImage
                    src={img}
                    alt={`${product.name} - ${i + 1}`}
                    className="w-full h-full object-cover"
                    sizes="(min-width: 1024px) 10vw, 20vw"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info - Airbnb Style */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between">
                <div>
                  {product.isNew && (
                    <Badge className="mb-2 bg-surface-soft text-ink font-bold text-micro uppercase tracking-wide">
                      BARU
                    </Badge>
                  )}
                  <h1 className="text-2xl font-semibold text-ink">{product.name}</h1>
                  <p className="text-sm text-muted mt-1">SKU: {product.sku}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-surface-soft">
                    <Heart className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-surface-soft">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Rating - Airbnb Style */}
              <div className="flex items-center gap-2 mt-3">
                <Star className="h-4 w-4 text-star-rating fill-star-rating" />
                <span className="font-medium text-ink">{product.rating}</span>
                <span className="text-sm text-muted">
                  ({product.reviewCount} ulasan)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mt-4">
                <span className="text-3xl font-bold text-ink">{formatPrice(displayPrice)}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-base text-muted line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                    <Badge className="bg-primary text-white font-bold text-micro uppercase tracking-wide">
                      -{discount}%
                    </Badge>
                  </>
                )}
              </div>
            </div>

            <Separator className="bg-hairline" />

            {showVariantPicker && product.variantOptions && (
              <VariantSelector
                options={product.variantOptions}
                value={selectedVariantId}
                onValueChange={setSelectedVariantId}
              />
            )}

            {/* Color Selection */}
            {showColorSize && product.colors.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 text-sm">
                  Warna: <span className="font-normal text-muted">{selectedColor}</span>
                </h3>
                <div className="flex gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      aria-label={`Warna ${color.name}`}
                      aria-pressed={selectedColor === color.name}
                      className={cn(
                        "h-12 w-12 rounded-full border-2 transition-all hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        selectedColor === color.name
                          ? "border-ink ring-2 ring-ink/20 scale-110"
                          : "border-hairline hover:border-ink"
                      )}
                      style={{ backgroundColor: color.value }}
                      onClick={() => setSelectedColor(color.name)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {showColorSize && product.sizes.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 text-sm">Ukuran</h3>
                <div className="flex gap-3">
                  {product.sizes.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? "default" : "outline"}
                      className="h-12 w-14 rounded-lg"
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="font-semibold mb-3 text-sm">Jumlah</h3>
              <div className="flex items-center gap-4">
                <QuantityPicker
                  value={quantity}
                  onChange={setQuantity}
                  max={displayStock > 0 ? displayStock : 1}
                />
                {isLowStock && (
                  <span className="text-sm text-primary font-medium">
                    Sisa {displayStock} item
                  </span>
                )}
              </div>
            </div>

            <Separator className="bg-hairline" />

            {/* Cek Ongkir - Airbnb Card Style */}
            <div className="bg-surface-soft rounded-xl p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                <Truck className="h-4 w-4" />
                Cek Ongkos Kirim
              </h3>
              <div className="flex gap-3">
                <Select value={selectedCity} onValueChange={(v) => {
                  setSelectedCity(v);
                  setShowShipping(true);
                }}>
                  <SelectTrigger className="flex-1 bg-white">
                    <SelectValue placeholder="Pilih kota tujuan..." />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name}, {city.province}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {showShipping && selectedCity && (
                <div className="mt-4 space-y-2 animate-fade-in">
                  {shippingOptions.map((opt) => (
                    <div
                      key={opt.id}
                      className="flex items-center justify-between py-3 px-4 bg-white rounded-lg border border-hairline hover:border-ink hover-lift transition-all cursor-pointer"
                    >
                      <div>
                        <p className="font-medium text-sm text-ink">{opt.name}</p>
                        <p className="text-xs text-muted">{opt.estimate}</p>
                      </div>
                      <span className="font-semibold text-ink">{formatPrice(opt.price)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions - Airbnb Style */}
            <div className="flex gap-3">
              <Button
                size="lg"
                className="flex-1 rounded-lg font-semibold"
                onClick={() => {
                  if (!selectedVariantId) return;
                  void addVariant({ variantId: selectedVariantId, quantity });
                }}
                disabled={!selectedVariantId || displayStock <= 0}
              >
                + Keranjang
              </Button>
              <Button size="lg" variant="outline" className="flex-1 rounded-lg font-semibold">
                Beli Sekarang
              </Button>
            </div>

            {/* Trust Badges - Airbnb Style */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="flex items-center gap-2 text-sm text-muted">
                <ShieldCheck className="h-5 w-5" />
                <span>100% Original</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted">
                <Truck className="h-5 w-5" />
                <span>Gratis Ongkir*</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted">
                <RotateCcw className="h-5 w-5" />
                <span>Tukar 7 Hari</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs: Description, Specs, Reviews */}
        <div className="mt-16">
          <Tabs defaultValue="description">
            <TabsList className="border-b border-hairline bg-transparent rounded-none h-auto p-0">
              <TabsTrigger 
                value="description" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-ink data-[state=active]:bg-transparent data-[state=active]:text-ink data-[state=active]:shadow-none px-4 py-3 text-muted"
              >
                Deskripsi
              </TabsTrigger>
              <TabsTrigger 
                value="specs" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-ink data-[state=active]:bg-transparent data-[state=active]:text-ink data-[state=active]:shadow-none px-4 py-3 text-muted"
              >
                Spesifikasi
              </TabsTrigger>
              <TabsTrigger 
                value="reviews" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-ink data-[state=active]:bg-transparent data-[state=active]:text-ink data-[state=active]:shadow-none px-4 py-3 text-muted"
              >
                Ulasan ({product.reviewCount})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-6">
              <p className="text-body max-w-2xl leading-relaxed">{product.description}</p>
            </TabsContent>
            <TabsContent value="specs" className="mt-6">
              <div className="max-w-md space-y-1">
                {product.specs.map((spec, i) => (
                  <div key={i} className="flex justify-between py-3 border-b border-hairline">
                    <span className="text-muted">{spec.label}</span>
                    <span className="font-medium text-ink">{spec.value}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="mt-6">
              <p className="text-muted">Belum ada ulasan untuk produk ini.</p>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}