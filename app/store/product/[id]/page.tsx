import { notFound } from "next/navigation";
import { DesktopProductDetail } from "@/src/components/desktop";
import { MobileProductDetail } from "@/src/components/mobile";
import { ResponsiveSplit } from "@/src/components/responsive-split";
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
  const firstVariantId =
    Array.isArray(detail.variants) && detail.variants.length > 0
      ? // backend VariantDetail might be flattened or nested; both include an `id`.
        (detail.variants[0] as unknown as { id?: string; variant?: { id?: string } }).id ??
        (detail.variants[0] as unknown as { variant?: { id?: string } }).variant?.id ??
        null
      : null;

  return (
    <ResponsiveSplit
      desktop={<DesktopProductDetail product={product} defaultVariantId={firstVariantId} />}
      mobile={<MobileProductDetail product={product} defaultVariantId={firstVariantId} />}
    />
  );
}
