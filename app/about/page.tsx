import { MapPin, Package, Store } from "lucide-react";
import { StorefrontLayout } from "@/src/components/storefront-layout";
import { Separator } from "@/src/components/ui/separator";

const values = [
  {
    title: "Kualitas",
    description:
      "Setiap produk dipilih dengan teliti untuk memastikan kualitas terbaik bagi pelanggan kami.",
  },
  {
    title: "Keberlanjutan",
    description:
      "Kami berkomitmen pada praktik bisnis yang ramah lingkungan dan berkelanjutan.",
  },
  {
    title: "Pelayanan",
    description:
      "Kepuasan pelanggan adalah prioritas utama kami. Tim kami siap membantu Anda.",
  },
] as const;

const highlights = [
  { icon: MapPin, label: "Pengiriman ke 34 provinsi" },
  { icon: Package, label: "Kurasi produk terpercaya" },
  { icon: Store, label: "3 toko fisik di Jakarta" },
] as const;

function AboutContent() {
  return (
    <div className="store-container py-8 md:py-12 max-w-4xl">
      <div className="text-center max-w-2xl mx-auto mb-10 md:mb-16">
        <h1 className="font-bold text-2xl md:text-4xl mb-4 text-ink">Tentang SoraStore</h1>
        <p className="text-muted leading-relaxed">
          SoraStore adalah destinasi belanja online terpercaya untuk produk berkualitas tinggi.
          Didirikan dengan visi untuk memberikan pengalaman belanja yang mudah, cepat, dan
          menyenangkan.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center mb-10 md:mb-16">
        <div className="aspect-video bg-surface-soft border border-hairline rounded-2xl flex items-center justify-center text-muted">
          Gambar Toko
        </div>
        <div>
          <h2 className="font-semibold text-xl md:text-2xl mb-4 text-ink">Cerita Kami</h2>
          <p className="text-muted mb-4 leading-relaxed">
            Berawal dari kecintaan pada produk berkualitas dan keinginan untuk berbagi dengan
            lebih banyak orang, SoraStore lahir di Jakarta pada tahun 2020.
          </p>
          <p className="text-muted leading-relaxed">
            Kini, kami telah melayani ribuan pelanggan di seluruh Indonesia dengan berbagai
            produk pilihan mulai dari fashion, kecantikan, hingga aksesoris lifestyle.
          </p>
        </div>
      </div>

      <Separator className="my-8" />

      <div className="mb-10 md:mb-16">
        <h2 className="font-semibold text-xl md:text-2xl mb-6 text-center text-ink">
          Nilai-Nilai Kami
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {values.map((value) => (
            <div
              key={value.title}
              className="text-center p-6 bg-surface-soft border border-hairline rounded-2xl"
            >
              <h3 className="font-semibold mb-2 text-ink">{value.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </div>

      <ul className="flex flex-wrap justify-center gap-3" aria-label="Jangkauan toko">
        {highlights.map(({ icon: Icon, label }) => (
          <li
            key={label}
            className="flex items-center gap-2 rounded-full border border-hairline bg-card px-4 py-2.5 text-sm text-ink"
          >
            <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AboutPage() {
  return (
    <StorefrontLayout mobileTitle="Tentang kami">
      <AboutContent />
    </StorefrontLayout>
  );
}
