import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProductGrid } from "./ProductCard";
import { PRODUCTS_QUERY, storefrontApiRequest, type ShopifyProduct } from "@/lib/shopify";

const KEY = "dermiglow-recent";
const MAX = 8;

function read(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

/** Registra o produto atual na lista de vistos recentemente. */
export function useTrackRecentlyViewed(handle?: string) {
  useEffect(() => {
    if (!handle) return;
    try {
      const list = [handle, ...read().filter((h) => h !== handle)].slice(0, MAX);
      localStorage.setItem(KEY, JSON.stringify(list));
    } catch {
      /* ignora armazenamento indisponível */
    }
  }, [handle]);
}

export function RecentlyViewed({ excludeHandle }: { excludeHandle?: string }) {
  const [handles, setHandles] = useState<string[]>([]);

  useEffect(() => {
    setHandles(read().filter((h) => h !== excludeHandle));
  }, [excludeHandle]);

  const { data } = useQuery({
    queryKey: ["shopify-products", "recent"],
    queryFn: async () => {
      const res = await storefrontApiRequest(PRODUCTS_QUERY, { first: 50 });
      return (res?.data?.products?.edges ?? []) as ShopifyProduct[];
    },
    enabled: handles.length > 0,
  });

  if (handles.length === 0) return null;

  const products = handles
    .map((h) => data?.find((p) => p.node.handle === h))
    .filter(Boolean) as ShopifyProduct[];

  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 md:px-8">
      <h2 className="mb-6 font-display text-2xl md:text-3xl">Vistos recentemente</h2>
      <ProductGrid products={products.slice(0, 4)} />
    </section>
  );
}
