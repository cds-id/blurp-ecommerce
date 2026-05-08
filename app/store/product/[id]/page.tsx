import { notFound } from "next/navigation";
import { DesktopProductDetail } from "@/src/components/desktop";
import { MobileProductDetail } from "@/src/components/mobile";
import { getCatalogProductDetail, listCatalogCategories } from "@/src/lib/catalog/server";
import { toUiProductDetail } from "@/src/lib/catalog/adapters";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const cats = await listCatalogCategories().catch(() => null);
  if (!cats) notFound();

  const categoryById = new Map(cats.map((c) => [c.id, { name: c.name, slug: c.slug }] as const));
  const detail = await getCatalogProductDetail(id).catch(() => null);
  if (!detail) notFound();

  const product = toUiProductDetail(detail, categoryById);

  return (
    <>
      <div className="hidden md:block">
        <DesktopProductDetail product={product} />
      </div>
      <div className="md:hidden">
        <MobileProductDetail product={product} />
      </div>
    </>
  );
}
