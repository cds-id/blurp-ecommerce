"use client";

import { useState } from "react";
import { Heart, Share2, Truck, ShieldCheck, RotateCcw, Star, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Separator } from "@/src/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { QuantityPicker } from "@/src/components/shared";
import { SafeImage } from "@/src/components/shared/safe-image";
import { Product } from "@/src/data/products";
import { shippingOptions, cities } from "@/src/data/shipping";
import { formatPrice, calculateDiscount, cn } from "@/src/lib/utils";
import { useCart } from "@/src/components/shared/cart-provider";

interface MobileProductDetailProps {
  product: Product;
  defaultVariantId?: string | null;
}

export function MobileProductDetail({ product, defaultVariantId }: MobileProductDetailProps) {
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name || "");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedCity, setSelectedCity] = useState("");
  const [showShipping, setShowShipping] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [showSpecs, setShowSpecs] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const { addVariant } = useCart();

  const discount = product.originalPrice
    ? calculateDiscount(product.originalPrice, product.price)
    : null;

  const isLowStock = product.stock <= 3;
  
  const imageVariants =
    product.images && product.images.length > 0
      ? product.images
      : [];

  return (
    <div className="bg-canvas pb-24">
      {/* Image Carousel */}
      <div className="relative aspect-square overflow-hidden">
        <SafeImage
          src={imageVariants[activeImage]}
          alt={product.name}
          className="w-full h-full object-cover"
          sizes="100vw"
          priority
        />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.isNew && (
            <Badge className="bg-white text-ink font-bold text-[10px] uppercase tracking-wide">
              BARU
            </Badge>
          )}
          {discount && (
            <Badge className="bg-primary text-white font-bold text-[10px] uppercase tracking-wide">
              -{discount}%
            </Badge>
          )}
        </div>
        
        {/* Wishlist */}
        <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center transition-all">
          <Heart className="h-5 w-5" />
        </button>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 p-4 overflow-x-auto scrollbar-hide">
        {imageVariants.map((img, i) => (
          <button
            key={i}
            className={cn(
              "h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden transition-all",
              activeImage === i ? "ring-2 ring-ink" : "opacity-70 hover:opacity-100"
            )}
            onClick={() => setActiveImage(i)}
          >
            <SafeImage
              src={img}
              alt={`${product.name} - ${i + 1}`}
              className="w-full h-full object-cover"
              sizes="64px"
            />
          </button>
        ))}
      </div>

      <div className="px-4 space-y-5">
        {/* Header */}
        <div>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-xl font-semibold leading-tight text-ink">{product.name}</h1>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-surface-soft">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Rating - Airbnb Style */}
          <div className="flex items-center gap-2 mt-2">
            <Star className="h-4 w-4 text-star-rating fill-star-rating" />
            <span className="font-medium text-ink">{product.rating}</span>
            <span className="text-sm text-muted">
              ({product.reviewCount} ulasan)
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-2xl font-bold text-ink">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <>
                <span className="text-sm text-muted line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              </>
            )}
          </div>
        </div>

        <Separator className="bg-hairline" />

        {/* Color Selection */}
        {product.colors.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-3 text-ink">
              Warna: <span className="font-normal text-muted">{selectedColor}</span>
            </h3>
            <div className="flex gap-3">
              {product.colors.map((color) => (
                <button
                  key={color.name}
                  className={cn(
                    "h-12 w-12 rounded-full border-2 transition-all hover:scale-110",
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
        {product.sizes.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-3 text-ink">Ukuran</h3>
            <div className="flex gap-3">
              {product.sizes.map((size) => (
                <Button
                  key={size}
                  variant={selectedSize === size ? "default" : "outline"}
                  size="sm"
                  className="h-11 w-14 rounded-lg"
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
          <h3 className="text-sm font-semibold mb-3 text-ink">Jumlah</h3>
          <div className="flex items-center gap-4">
            <QuantityPicker
              value={quantity}
              onChange={setQuantity}
              max={product.stock}
            />
            {isLowStock && (
              <span className="text-sm text-primary font-medium">
                Sisa {product.stock}
              </span>
            )}
          </div>
        </div>

        <Separator className="bg-hairline" />

        {/* Cek Ongkir - Airbnb Card Style */}
        <div className="bg-surface-soft rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-ink">
            <Truck className="h-4 w-4" />
            Cek Ongkos Kirim
          </h3>
          <Select value={selectedCity} onValueChange={(v) => {
            setSelectedCity(v);
            setShowShipping(true);
          }}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Pilih kota..." />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city.id} value={city.id}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {showShipping && selectedCity && (
            <div className="mt-4 space-y-2 animate-fade-in">
              {shippingOptions.slice(0, 3).map((opt) => (
                <div
                  key={opt.id}
                  className="flex items-center justify-between py-3 px-4 bg-white rounded-lg border border-hairline"
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

        {/* Trust Badges - Airbnb Style */}
        <div className="flex justify-around py-4 bg-surface-soft rounded-xl">
          <div className="flex flex-col items-center gap-1.5">
            <ShieldCheck className="h-5 w-5 text-ink" />
            <span className="text-xs text-muted">Original</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <Truck className="h-5 w-5 text-ink" />
            <span className="text-xs text-muted">Free Ongkir*</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <RotateCcw className="h-5 w-5 text-ink" />
            <span className="text-xs text-muted">Tukar 7 Hari</span>
          </div>
        </div>

        {/* Description Accordion */}
        <div className="border border-hairline rounded-xl overflow-hidden">
          <button
            className="w-full flex items-center justify-between p-4 bg-white"
            onClick={() => setShowDescription(!showDescription)}
          >
            <span className="font-semibold text-sm text-ink">Deskripsi</span>
            {showDescription ? <ChevronUp className="h-4 w-4 text-muted" /> : <ChevronDown className="h-4 w-4 text-muted" />}
          </button>
          {showDescription && (
            <div className="px-4 pb-4 bg-white">
              <p className="text-sm text-body leading-relaxed">{product.description}</p>
            </div>
          )}
        </div>

        {/* Specs Accordion */}
        <div className="border border-hairline rounded-xl overflow-hidden">
          <button
            className="w-full flex items-center justify-between p-4 bg-white"
            onClick={() => setShowSpecs(!showSpecs)}
          >
            <span className="font-semibold text-sm text-ink">Spesifikasi</span>
            {showSpecs ? <ChevronUp className="h-4 w-4 text-muted" /> : <ChevronDown className="h-4 w-4 text-muted" />}
          </button>
          {showSpecs && (
            <div className="px-4 pb-4 bg-white space-y-1">
              {product.specs.map((spec, i) => (
                <div key={i} className="flex justify-between text-sm py-2.5 border-b border-hairline last:border-0">
                  <span className="text-muted">{spec.label}</span>
                  <span className="text-ink">{spec.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-hairline px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex gap-3 z-40 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.08)]">
        <Button
          variant="outline"
          size="lg"
          className="flex-1 rounded-full font-semibold border-hairline h-12"
          onClick={() => {
            if (!defaultVariantId) return;
            void addVariant({ variantId: defaultVariantId, quantity });
          }}
          disabled={!defaultVariantId}
        >
          + Keranjang
        </Button>
        <Button size="lg" className="flex-1 rounded-full font-semibold h-12">
          Beli Sekarang
        </Button>
      </div>
    </div>
  );
}