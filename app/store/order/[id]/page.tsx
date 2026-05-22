"use client";

import { use } from "react";
import { DesktopOrderSuccess } from "@/src/components/desktop";
import { MobileOrderSuccess } from "@/src/components/mobile";
import { ResponsiveSplit } from "@/src/components/responsive-split";

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

export default function OrderPage({ params }: OrderPageProps) {
  const { id } = use(params);

  return (
    <ResponsiveSplit
      desktop={<DesktopOrderSuccess orderId={id} />}
      mobile={<MobileOrderSuccess orderId={id} />}
    />
  );
}
