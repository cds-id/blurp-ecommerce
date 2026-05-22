"use client";

import { StorefrontLayout } from "@/src/components/storefront-layout";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { MapPin, Phone, Clock, MessageCircle } from "lucide-react";
import { stores } from "@/src/data/stores";

function LokasiContent() {
  return (
    <div className="store-container py-8 md:py-12 max-w-5xl">
      <div className="text-center mb-8 md:mb-12">
        <h1 className="font-bold text-2xl md:text-4xl mb-4 text-ink">Lokasi Toko</h1>
        <p className="text-muted leading-relaxed">
          Kunjungi toko kami atau hubungi untuk informasi lebih lanjut
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stores.map((store) => (
          <Card
            key={store.id}
            className={`bg-card border-hairline ${store.isPrimary ? "border-primary ring-1 ring-primary/20" : ""}`}
          >
            <CardContent className="p-6">
              {store.isPrimary && (
                <span className="inline-block px-2 py-1 text-xs font-medium bg-primary text-primary-foreground rounded mb-3">
                  Toko Utama
                </span>
              )}
              <h2 className="font-semibold text-lg mb-4 text-ink">{store.name}</h2>

              <div className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <MapPin className="h-4 w-4 text-muted flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-ink">{store.address}</p>
                    <p className="text-muted">{store.city}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Clock className="h-4 w-4 text-muted flex-shrink-0 mt-0.5" />
                  <p className="text-body">{store.hours}</p>
                </div>

                <div className="flex gap-3">
                  <Phone className="h-4 w-4 text-muted flex-shrink-0 mt-0.5" />
                  <p className="text-body">{store.phone}</p>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 min-h-11 border-hairline"
                  onClick={() =>
                    window.open(`https://wa.me/${store.whatsapp.replace(/\D/g, "")}`, "_blank")
                  }
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 min-h-11 border-hairline"
                  onClick={() =>
                    window.open(
                      `https://maps.google.com/?q=${encodeURIComponent(store.address + ", " + store.city)}`,
                      "_blank",
                    )
                  }
                >
                  <MapPin className="h-4 w-4 mr-1" />
                  Maps
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 aspect-video max-h-[400px] bg-surface-soft border border-hairline rounded-2xl flex items-center justify-center text-muted">
        Google Maps Embed
      </div>
    </div>
  );
}

export default function LokasiPage() {
  return (
    <StorefrontLayout mobileTitle="Lokasi toko">
      <LokasiContent />
    </StorefrontLayout>
  );
}
