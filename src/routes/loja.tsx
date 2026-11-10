import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Toaster } from "sonner";
import { Loader2 } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ProductGrid } from "@/components/site/ProductCard";
import {
  COLLECTIONS_QUERY,
  PRODUCTS_QUERY,
  storefrontApiRequest,
  type ShopifyCollection,
  type ShopifyProduct,
} from "@/lib/shopify";
import { useCartSync } from "@/hooks/use-cart-sync";
import { sortByPopularity, bestSellerTags } from "@/lib/popularity";


async function fetchAll(): Promise<ShopifyProduct[]> {
  const data = await storefrontApiRequest(PRODUCTS_QUERY, { first: 100, query: null });
  return data?.data?.products?.edges ?? [];
}
async function fetchCollections(): Promise<ShopifyCollection[]> {
  const data = await storefrontApiRequest(COLLECTIONS_QUERY, { first: 20 });
  return (data?.data?.collections?.edges ?? []).map((e: { node: ShopifyCollection }) => e.node);
}

export const Route = createFileRoute("/loja")({
  validateSearch: (search: Record<string, unknown>): { q?: string } => ({
    q: typeof search.q === "string" && search.q ? search.q : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Loja | Dermiglow" },
      { name: "description", content: "Todos os produtos importados Dermiglow: séruns, hidratação, limpeza facial, anti-idade e kits." },
      { property: "og:title", content: "Loja | Dermiglow" },
      { property: "og:description", content: "Curadoria premium de skincare asiático, com a Coreia como principal referência." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ShopPage,
});

type SortKey = "popular" | "recent" | "priceAsc" | "priceDesc";

function ShopPage() {
  useCartSync();
  const { q } = Route.useSearch();
  const [sort, setSort] = useState<SortKey>("popular");
  const products = useQuery({ queryKey: ["shopify-products-all"], queryFn: fetchAll });
  const collections = useQuery({ queryKey: ["shopify-collections"], queryFn: fetchCollections });

  const sorted = useMemo(() => {
    let list = [...(products.data ?? [])];
    if (q) {
      const term = q.toLowerCase();
      list = list.filter((p) =>
        `${p.node.title} ${p.node.description}`.toLowerCase().includes(term),
      );
    }
    if (sort === "popular") list = sortByPopularity(list);
    else if (sort === "priceAsc")
      list.sort((a, b) => parseFloat(a.node.priceRange.minVariantPrice.amount) - parseFloat(b.node.priceRange.minVariantPrice.amount));
    else if (sort === "priceDesc")
      list.sort((a, b) => parseFloat(b.node.priceRange.minVariantPrice.amount) - parseFloat(a.node.priceRange.minVariantPrice.amount));
    return list;
  }, [products.data, sort, q]);

  const tags = useMemo(() => bestSellerTags(sorted, 3), [sorted]);



  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster position="top-center" />
      <Header />
      <section className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
        <div className="mb-10">
          <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Loja</p>
          <h1 className="font-display text-4xl md:text-5xl">
            {q ? `Resultados para “${q}”` : "Todos os produtos"}
          </h1>
        </div>


        {collections.data && collections.data.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            <span className="rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground">
              Todos
            </span>
            {collections.data.map((c) => (
              <Link
                key={c.id}
                to="/colecao/$handle"
                params={{ handle: c.handle }}
                className="rounded-full border border-border px-4 py-2 text-xs transition hover:border-primary/40 hover:bg-accent/50"
              >
                {c.title}
              </Link>
            ))}
          </div>
        )}

        <div className="mb-6 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {products.isLoading ? "Carregando…" : `${sorted.length} produto${sorted.length !== 1 ? "s" : ""}`}
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

        {products.isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : sorted.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card p-10 text-center">
            <p className="font-display text-2xl">Nenhum produto encontrado</p>
          </div>
        ) : (
          <ProductGrid products={sorted} tags={tags} />
        )}
      </section>
      <Footer />
    </div>
  );
}
