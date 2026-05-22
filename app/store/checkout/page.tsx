import { DesktopCheckout } from "@/src/components/desktop";
import { MobileCheckout } from "@/src/components/mobile";
import { ResponsiveSplit } from "@/src/components/responsive-split";

export default function CheckoutPage() {
  return <ResponsiveSplit desktop={<DesktopCheckout />} mobile={<MobileCheckout />} />;
}
