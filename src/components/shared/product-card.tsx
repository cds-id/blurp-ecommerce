"use client";

import Link from "next/link";
import { Heart, Star } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { Product } from "@/src/data/products";
import { SafeImage } from "@/src/components/shared/safe-image";
import { useCart } from "@/src/components/shared/cart-provider";
import { cn, formatPrice, calculateDiscount } from "@/src/lib/utils";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addItem } = useCart();

  const discount = product.originalPrice
    ? calculateDiscount(product.originalPrice, product.price)
    : null;

  const productImage = product.images?.[0] ?? "";

  return (
    <Card
      className={cn(
        "group overflow-hidden border-0 shadow-none transition-all duration-300",
        "hover-lift rounded-md",
        className
      )}
    >
      <Link href={`/store/product/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden rounded-md bg-surface-soft">
          <SafeImage
            src={productImage}
            alt={product.name}
            className="w-full h-full object-cover product-image"
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
          />
          
          {/* Wishlist Button - Airbnb Style */}
          <button 
            className={cn(
              "absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
              "bg-white/80 hover:bg-white hover:scale-110",
              isWishlisted ? "text-primary" : "text-ink/60 hover:text-ink"
            )}
            onClick={(e) => {
              e.preventDefault();
              setIsWishlisted(!isWishlisted);
            }}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={cn("w-5 h-5", isWishlisted && "fill-primary")} />
          </button>

          {/* Badges - Top Left */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.isNew && (
              <Badge className="bg-white text-ink text-[10px] font-bold uppercase tracking-wide shadow-sm">
                BARU
              </Badge>
            )}
            {discount && (
              <Badge className="bg-primary text-white text-[10px] font-bold uppercase tracking-wide">
                -{discount}%
              </Badge>
            )}
          </div>

          {/* Quick Add — visible on mobile, reveal on hover for desktop */}
          <div
            className={cn(
              "absolute bottom-0 left-0 right-0 p-3 transition-all duration-300",
              "opacity-100 translate-y-0",
              "md:opacity-0 md:translate-y-4 md:group-hover:opacity-100 md:group-hover:translate-y-0"
            )}
          >
            <Button
              variant="secondary"
              size="sm"
              className="w-full bg-white text-ink font-semibold hover:bg-white/90 shadow-md"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addItem({ productId: product.id, quantity: 1 });
              }}
            >
              + Keranjang
            </Button>
          </div>
        </div>
      </Link>

      <div className="p-3">
        {/* Category */}
        <p className="text-xs text-muted uppercase tracking-wide mb-1">{product.category}</p>
        
        {/* Title */}
        <Link href={`/store/product/${product.slug}`}>
          <h3 className="font-medium text-sm leading-tight text-ink line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        
        {/* Rating (backend doesn't provide yet) */}
        {product.rating > 0 && product.reviewCount > 0 ? (
          <div className="flex items-center gap-1.5 mt-2">
            <Star className="w-3.5 h-3.5 text-star-rating fill-star-rating" />
            <span className="text-sm font-medium text-ink">{product.rating}</span>
            <span className="text-sm text-muted">({product.reviewCount})</span>
          </div>
        ) : null}

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-base font-semibold text-ink">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-muted line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}