import { DesktopHome } from "@/src/components/desktop";
import { MobileHome } from "@/src/components/mobile";
import { listCatalogCategories, listCatalogProducts } from "@/src/lib/catalog/server";
import { toUiCategories, toUiProduct } from "@/src/lib/catalog/adapters";

export default async function HomePage() {
  // Server-render for SEO (real products/categories in HTML).
  // Keep it simple: newest products from catalog list endpoint.
  const cats = await listCatalogCategories();
  const uiCats = toUiCategories(cats);
  const categoryById = new Map(cats.map((c) => [c.id, { name: c.name, slug: c.slug }] as const));

  const [{ items: p1 }, { items: p2 }] = await Promise.all([
    listCatalogProducts({ per_page: 4, page: 1 }),
    listCatalogProducts({ per_page: 4, page: 2 }),
  ]);
  const products = [...p1, ...p2].slice(0, 8).map((p) => toUiProduct(p, categoryById));
  const featuredProducts = products.slice(0, 4);
  const newDrops = products.slice(4, 8);

  return (
    <>
      <div className="hidden md:block">
        <DesktopHome featuredProducts={featuredProducts} newDrops={newDrops} categories={uiCats} />
      </div>
      <div className="md:hidden">
        <MobileHome featuredProducts={featuredProducts} newDrops={newDrops} categories={uiCats} />
      </div>
    </>
  );
}
