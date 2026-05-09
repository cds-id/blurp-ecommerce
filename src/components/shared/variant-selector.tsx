"use client";

import { Check } from "lucide-react";
import { cn, formatPrice } from "@/src/lib/utils";
import type { ProductVariantOption } from "@/src/data/products";
import { SafeImage } from "@/src/components/shared/safe-image";

function attrValueSummary(attrs: { key: string; value: string }[]): string {
  if (!attrs.length) return "";
  return attrs
    .map((a) => String(a.value ?? "").trim())
    .filter(Boolean)
    .join(" · ");
}

function variantsHaveDifferentPrices(variants: ProductVariantOption[]): boolean {
  if (variants.length < 2) return false;
  const first = variants[0].priceIdr;
  return variants.some((v) => v.priceIdr !== first);
}

export function VariantSelector({
  options,
  value,
  onValueChange,
  className,
}: {
  options: ProductVariantOption[];
  value: string | null;
  onValueChange: (id: string) => void;
  className?: string;
}) {
  const showPrices = variantsHaveDifferentPrices(options);
  const selected = options.find((o) => o.id === value);

  return (
    <div className={cn("space-y-2", className)} role="radiogroup" aria-label="Pilih varian produk">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-ink tracking-tight">Varian</span>
        {selected ? (
          <span
            className="text-[11px] text-muted tabular-nums truncate max-w-[58%] text-right"
            title={selected.sku}
          >
            SKU {selected.sku}
          </span>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
        {options.map((vo) => {
          const isSel = value === vo.id;
          const disabled = vo.stock <= 0;
          const summary = attrValueSummary(vo.attributes);
          const showSummary =
            summary.length > 0 && summary.toLowerCase() !== vo.name.trim().toLowerCase();

          const thumb = vo.imageUrl?.trim();

          return (
            <button
              key={vo.id}
              type="button"
              role="radio"
              aria-checked={isSel}
              disabled={disabled}
              onClick={() => onValueChange(vo.id)}
              className={cn(
                "relative flex gap-2 rounded-lg border px-2 py-2 sm:px-2.5 sm:py-2 text-left transition-all outline-none w-full min-w-0",
                "focus-visible:ring-2 focus-visible:ring-ink/20 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
                disabled && "opacity-55 cursor-not-allowed",
                isSel && !disabled
                  ? "border-ink bg-white shadow-sm"
                  : "border-hairline bg-white/70 hover:border-ink/30 hover:bg-white",
              )}
            >
              {thumb ? (
                <div className="relative h-11 w-11 sm:h-12 sm:w-12 shrink-0 rounded-md overflow-hidden bg-surface-soft ring-1 ring-black/[0.06]">
                  <SafeImage
                    src={thumb}
                    alt=""
                    className="object-cover"
                    sizes="(min-width: 640px) 48px, 44px"
                  />
                </div>
              ) : null}
              <div className={cn("pr-5 min-w-0 flex-1", !thumb && "pl-0.5")}>
                <p className="text-[13px] sm:text-sm font-medium text-ink leading-snug line-clamp-2">
                  {vo.name}
                </p>
                {showSummary ? (
                  <p className="mt-0.5 text-[11px] text-muted leading-snug line-clamp-1" title={summary}>
                    {summary}
                  </p>
                ) : null}
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0 text-[11px] tabular-nums">
                  {showPrices ? (
                    <span className={cn("font-semibold", disabled ? "text-muted" : "text-ink")}>
                      {formatPrice(vo.priceIdr)}
                    </span>
                  ) : null}
                  <span
                    className={cn(
                      vo.stock > 0 ? "text-muted" : "text-primary font-medium",
                    )}
                  >
                    {vo.stock > 0 ? `${vo.stock} stok` : "Habis"}
                  </span>
                </div>
              </div>
              {isSel && !disabled ? (
                <span
                  className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-ink text-white pointer-events-none"
                  aria-hidden
                >
                  <Check className="h-2.5 w-2.5 stroke-[3]" />
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
