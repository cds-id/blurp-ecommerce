import type { Metadata } from "next";
import "./globals.css";
import { ScrollToTopOnNavigate } from "@/src/components/shared/scroll-to-top";
import { CartProvider } from "@/src/components/shared/cart-provider";
import { AuthProvider } from "@/src/hooks/use-auth";

export const metadata: Metadata = {
  title: "SoraStore - Belanja cepat, tanpa daftar",
  description: "Toko online Indonesia - belanja cepat tanpa ribet daftar",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen antialiased">
        <AuthProvider>
          <CartProvider>
            <ScrollToTopOnNavigate />
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}