import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Toaster } from "sonner";
import { Loader2, ChevronRight } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ProductGrid } from "@/components/site/ProductCard";
import {
  COLLECTION_BY_HANDLE_QUERY,
  storefrontApiRequest,
  type ShopifyProduct,
} from "@/lib/shopify";
import { useCartSync } from "@/hooks/use-cart-sync";
import { sortByPopularity, bestSellerTags } from "@/lib/popularity";
import { STORE_COLLECTIONS } from "@/components/site/nav";


interface CollectionData {
  id: string;
  title: string;
  handle: string;
  description: string;
  image: { url: string; altText: string | null } | null;
  products: { edges: ShopifyProduct[] };
}

async function fetchCollection(handle: string): Promise<CollectionData | null> {
  const data = await storefrontApiRequest(COLLECTION_BY_HANDLE_QUERY, { handle, first: 50 });
  return data?.data?.collection ?? null;
}

export const Route = createFileRoute("/colecao/$handle")({
  head: ({ params }) => {
    const col = STORE_COLLECTIONS.find((c) => c.handle === params.handle);
    const name = col?.label ?? "Coleção";
    const desc = col?.description ?? "Skincare asiático selecionado pela Dermiglow.";
    return {
    meta: [
      { title: `${name} | Dermiglow` },
      { name: "description", content: `${name}: ${desc} Curadoria premium de skincare asiático na Dermiglow.` },
      { property: "og:title", content: `${name} | Dermiglow` },
      { property: "og:description", content: desc },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    };
  },
  component: CollectionPage,
});

type SortKey = "popular" | "recent" | "priceAsc" | "priceDesc";

function CollectionPage() {
  useCartSync();
  const { handle } = Route.useParams();
  const [sort, setSort] = useState<SortKey>("popular");
  const { data: collection, isLoading, error } = useQuery({
    queryKey: ["shopify-collection", handle],
    queryFn: () => fetchCollection(handle),
  });

  if (!isLoading && !error && !collection) throw notFound();

  const raw = collection?.products.edges ?? [];

  const products = useMemo(() => {
    const list = [...raw];
    if (sort === "popular") return sortByPopularity(list);
    if (sort === "priceAsc")
      return list.sort((a, b) => parseFloat(a.node.priceRange.minVariantPrice.amount) - parseFloat(b.node.priceRange.minVariantPrice.amount));
    if (sort === "priceDesc")
      return list.sort((a, b) => parseFloat(b.node.priceRange.minVariantPrice.amount) - parseFloat(a.node.priceRange.minVariantPrice.amount));
    return list;
  }, [raw, sort]);

  const tags = useMemo(() => bestSellerTags(products, 3), [products]);


  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster position="top-center" />
      <Header />
      <section className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Início</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/loja" className="hover:text-foreground">Loja</Link>
          {collection && (
            <>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground">{collection.title}</span>
            </>
          )}
        </nav>

        {isLoading ? (
          <div className="flex justify-center py-32"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : collection ? (
          <>
            <div className="mb-10 max-w-2xl">
              <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Coleção</p>
              <h1 className="font-display text-4xl md:text-5xl">{collection.title}</h1>
              {collection.description && (
                <p className="mt-3 text-muted-foreground">{collection.description}</p>
              )}
            </div>
            {products.length === 0 ? (
              <div className="rounded-3xl border border-border bg-card p-10 text-center">
                <p className="font-display text-2xl">Nenhum produto nesta coleção</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Adicione produtos a esta coleção no admin da Shopify.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {products.length} produto{products.length !== 1 ? "s" : ""}
                  </div>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortKey)}
                    className="rounded-full border border-border bg-background px-4 py-2 text-xs"
                  >
                    <option value="popular">Mais vendidos</option>
                    <option value="recent">Mais recentes</option>
                    <option value="priceAsc">Menor preço</option>
                    <option value="priceDesc">Maior preço</option>
                  </select>
                </div>
                <ProductGrid products={products} tags={tags} />
              </>
            )}

          </>
        ) : null}
      </section>
      <Footer />
    </div>
  );
}
