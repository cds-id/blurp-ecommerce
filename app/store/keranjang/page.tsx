import { DesktopCart } from "@/src/components/desktop";
import { MobileCart } from "@/src/components/mobile";
import { ResponsiveSplit } from "@/src/components/responsive-split";

export default function KeranjangPage() {
  return <ResponsiveSplit desktop={<DesktopCart />} mobile={<MobileCart />} />;
}
