import { DesktopCatalog } from "@/src/components/desktop";
import { MobileCatalog } from "@/src/components/mobile";
import { listCatalogCategories, listCatalogProducts } from "@/src/lib/catalog/server";
import { toUiCategories, toUiProduct } from "@/src/lib/catalog/adapters";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function CatalogPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};
  const categorySlug = typeof sp.category === "string" ? sp.category : undefined;
  const q = typeof sp.q === "string" ? sp.q : undefined;
  const page = typeof sp.page === "string" ? Number(sp.page) : 1;

  const cats = await listCatalogCategories();
  const uiCats = toUiCategories(cats);
  const categoryById = new Map(cats.map((c) => [c.id, { name: c.name, slug: c.slug }] as const));
  const categoryId = categorySlug ? cats.find((c) => c.slug === categorySlug)?.id : undefined;

  const { items, meta } = await listCatalogProducts({
    page: Number.isFinite(page) && page > 0 ? page : 1,
    per_page: 20,
    category_id: categoryId,
    search: q,
  });
  const uiProducts = items.map((p) => toUiProduct(p, categoryById));

  return (
    <>
      <div className="hidden md:block">
        <DesktopCatalog
          categories={uiCats}
          products={uiProducts}
          selectedCategory={categorySlug}
          meta={meta}
          searchQuery={q}
        />
      </div>
      <div className="md:hidden">
        <MobileCatalog
          categories={uiCats}
          products={uiProducts}
          selectedCategory={categorySlug}
          meta={meta}
          searchQuery={q}
        />
      </div>
    </>
  );
}
