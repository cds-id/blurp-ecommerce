import { DesktopCatalog } from "@/src/components/desktop";
import { MobileCatalog } from "@/src/components/mobile";
import { ResponsiveSplit } from "@/src/components/responsive-split";
import { listCatalogCategories, listCatalogProducts } from "@/src/lib/catalog/server";
import { toUiCategories, toUiProduct } from "@/src/lib/catalog/adapters";

type SearchParams = Record<string, string | string[] | undefined>;

function toStringArray(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [v];
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};
  const categorySlugs = toStringArray(sp.category);
  const q = typeof sp.q === "string" ? sp.q : undefined;
  const page = typeof sp.page === "string" ? Number(sp.page) : 1;
  const sortRaw = typeof sp.sort === "string" ? sp.sort : undefined;
  const sort =
    sortRaw === "newest" || sortRaw === "popular" || sortRaw === "price_asc" || sortRaw === "price_desc"
      ? sortRaw
      : undefined;
  const min_price_idr = typeof sp.min_price_idr === "string" ? Number(sp.min_price_idr) : undefined;
  const max_price_idr = typeof sp.max_price_idr === "string" ? Number(sp.max_price_idr) : undefined;
  const attribute = toStringArray(sp.attribute);

  const cats = await listCatalogCategories();
  const uiCats = toUiCategories(cats);
  const categoryById = new Map(cats.map((c) => [c.id, { name: c.name, slug: c.slug }] as const));
  const categoryIds = categorySlugs
    .map((slug) => cats.find((c) => c.slug === slug)?.id)
    .filter((id): id is string => typeof id === "string");

  const { items, meta } = await listCatalogProducts({
    page: Number.isFinite(page) && page > 0 ? page : 1,
    per_page: 20,
    category_id: categoryIds.length > 0 ? categoryIds : undefined,
    search: q,
    sort,
    min_price_idr: Number.isFinite(min_price_idr as number) ? (min_price_idr as number) : undefined,
    max_price_idr: Number.isFinite(max_price_idr as number) ? (max_price_idr as number) : undefined,
    attribute: attribute.length > 0 ? attribute : undefined,
  });
  const uiProducts = items.map((p) => toUiProduct(p, categoryById));

  return (
    <ResponsiveSplit
      desktop={
        <DesktopCatalog
          categories={uiCats}
          products={uiProducts}
          selectedCategory={categorySlugs[0]}
          selectedCategories={categorySlugs}
          meta={meta}
          searchQuery={q}
        />
      }
      mobile={
        <MobileCatalog
          categories={uiCats}
          products={uiProducts}
          selectedCategory={categorySlugs[0]}
          selectedCategories={categorySlugs}
          meta={meta}
          searchQuery={q}
        />
      }
    />
  );
}
