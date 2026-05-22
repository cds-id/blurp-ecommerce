"use client";

import { useIsDesktop } from "@/src/hooks/use-media-query";
import { useHydrated } from "@/src/hooks/use-hydrated";

interface ResponsiveSplitProps {
  desktop: React.ReactNode;
  mobile: React.ReactNode;
}

/** Renders one branch based on viewport (768px). Neutral skeleton until hydrated. */
export function ResponsiveSplit({ desktop, mobile }: ResponsiveSplitProps) {
  const hydrated = useHydrated();
  const isDesktop = useIsDesktop();

  if (!hydrated) {
    return (
      <div
        className="min-h-[40vh] bg-canvas"
        aria-busy="true"
        aria-label="Memuat halaman"
      />
    );
  }

  return <div className="animate-fade-in">{isDesktop ? desktop : mobile}</div>;
}
