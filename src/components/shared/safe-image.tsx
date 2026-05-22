"use client";

import * as React from "react";
import Image, { type ImageProps } from "next/image";
import { cn } from "@/src/lib/utils";

type SafeImageProps = Omit<
  ImageProps,
  "src" | "alt" | "fill" | "width" | "height"
> & {
  src: string;
  alt: string;
  fallbackSrcs?: string[];
  /**
   * Defaults to `true` (uses `fill` layout). If you pass width+height, set this
   * to false.
   */
  fill?: boolean;
  width?: number;
  height?: number;
};

function uniq(list: (string | undefined)[]) {
  const out: string[] = [];
  for (const v of list) {
    if (!v) continue;
    if (!out.includes(v)) out.push(v);
  }
  return out;
}

function BrokenImageSvg({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 1200"
      role="img"
      aria-label="Image unavailable"
      className={cn("w-full h-full", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--color-surface-soft)" />
          <stop offset="100%" stopColor="var(--color-surface-strong)" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="1200" height="1200" fill="url(#bg)" />
      <rect x="120" y="120" width="960" height="960" rx="64" fill="var(--color-canvas)" opacity="0.75" />
      <g transform="translate(300 340)" fill="none" stroke="var(--color-muted-soft)" strokeWidth="24">
        <rect x="0" y="0" width="600" height="520" rx="48" />
        <path d="M88 380l132-132 124 124 92-92 196 196" />
        <circle cx="170" cy="160" r="56" />
      </g>
      <g fill="var(--color-muted)" fontFamily="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto" textAnchor="middle">
        <text x="600" y="965" fontSize="44" fontWeight="700">Image unavailable</text>
        <text x="600" y="1022" fontSize="28">Missing or failed to load</text>
      </g>
    </svg>
  );
}

export function SafeImage({
  src,
  fallbackSrcs,
  className,
  alt,
  fill = true,
  width,
  height,
  sizes,
  onLoad,
  onError,
  ...props
}: SafeImageProps) {
  const normalizedSrc = (src ?? "").trim();
  const resetKey = React.useMemo(() => `${normalizedSrc}::${(fallbackSrcs ?? []).join("|")}`, [normalizedSrc, fallbackSrcs]);

  const candidates = React.useMemo(
    () =>
      uniq([
        normalizedSrc || undefined,
        ...(fallbackSrcs ?? []),
      ]),
    [normalizedSrc, fallbackSrcs]
  );

  const [idx, setIdx] = React.useState(0);
  const [loaded, setLoaded] = React.useState(false);
  const current = candidates[Math.min(idx, candidates.length - 1)];

  const [isBroken, setIsBroken] = React.useState(false);
  React.useEffect(() => {
    // Reset internal state when inputs change (new src/fallback list).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIdx(0);
    setLoaded(false);
    setIsBroken(false);
  }, [resetKey]);

  if (!current || isBroken) {
    return (
      <div className={cn("relative w-full h-full", fill ? "" : "", className)} data-loaded="false">
        <BrokenImageSvg className="block" />
      </div>
    );
  }

  const image = (
    <Image
      key={resetKey}
      {...props}
      src={current}
      alt={alt ?? ""}
      data-loaded={loaded ? "true" : "false"}
      className={cn("block img-fade", className)}
      fill={fill}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      // Default sizes tuned for cards/grids. Override per-callsite when needed.
      sizes={
        sizes ??
        (fill ? "(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw" : undefined)
      }
      onLoad={(e) => {
        onLoad?.(e);
        setIsBroken(false);
        setLoaded(true);
      }}
      onError={(e) => {
        onError?.(e);
        setLoaded(false);
        setIdx((v) => {
          const next = v < candidates.length - 1 ? v + 1 : v;
          if (next === v) setIsBroken(true);
          return next;
        });
      }}
    />
  );

  // `fill` requires a positioned parent with a concrete size. Many callsites
  // rely on container sizing (`aspect-*`, fixed heights). Wrap to guarantee the
  // required positioning without touching every callsite.
  if (fill) {
    return <div className="relative w-full h-full">{image}</div>;
  }

  return image;
}

