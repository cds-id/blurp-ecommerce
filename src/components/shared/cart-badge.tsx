"use client";

import { cn } from "@/src/lib/utils";
import { useCart } from "@/src/components/shared/cart-provider";

type CartBadgeSize = "xs" | "sm" | "md";
type CartBadgePlacement = "corner" | "inline";

const sizeClasses: Record<CartBadgeSize, string> = {
  xs: "h-4 w-4 text-xs",
  sm: "h-4 w-4 text-micro",
  md: "h-5 w-5 text-xs",
};

const placementClasses: Record<CartBadgePlacement, string> = {
  corner: "absolute",
  inline: "",
};

export function CartBadge({
  size = "md",
  placement = "corner",
  offsetClassName = "-top-1 -right-1",
  textClassName = "text-white",
  className,
}: {
  size?: CartBadgeSize;
  placement?: CartBadgePlacement;
  offsetClassName?: string;
  textClassName?: string;
  className?: string;
}) {
  const { count } = useCart();

  if (count <= 0) return null;

  return (
    <span
      // Key change re-triggers CSS animation when count changes.
      key={count}
      className={cn(
        "rounded-full bg-primary flex items-center justify-center font-semibold leading-none animate-cart-bump",
        textClassName,
        sizeClasses[size],
        placementClasses[placement],
        placement === "corner" ? offsetClassName : null,
        className
      )}
    >
      {count}
    </span>
  );
}

