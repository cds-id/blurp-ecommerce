"use client";

import { DesktopShell } from "@/src/components/desktop";
import { MobileShell } from "@/src/components/mobile";
import { useIsDesktop } from "@/src/hooks/use-media-query";
import { useHydrated } from "@/src/hooks/use-hydrated";

interface StorefrontLayoutProps {
  children: React.ReactNode;
  desktopContent?: React.ReactNode;
  mobileContent?: React.ReactNode;
  mobileTitle?: string;
  /** @deprecated mobile tab bar has been removed */
  hideMobileTabBar?: boolean;
}

export function StorefrontLayout({
  children,
  desktopContent,
  mobileContent,
  mobileTitle,
}: StorefrontLayoutProps) {
  const hydrated = useHydrated();
  const isDesktop = useIsDesktop();
  const desktopNode = desktopContent && mobileContent ? desktopContent : children;
  const mobileNode = desktopContent && mobileContent ? mobileContent : children;

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-canvas" aria-busy="true" aria-label="Memuat" />
    );
  }

  if (isDesktop) {
    return <DesktopShell>{desktopNode}</DesktopShell>;
  }

  return <MobileShell title={mobileTitle}>{mobileNode}</MobileShell>;
}
