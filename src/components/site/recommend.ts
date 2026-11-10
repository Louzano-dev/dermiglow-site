import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import {
  COLLECTION_BY_HANDLE_QUERY,
  storefrontApiRequest,
  type ShopifyProduct,
} from "@/lib/shopify";
import { STORE_COLLECTIONS } from "./nav";

export const COLLECTION_HANDLES = STORE_COLLECTIONS.map((c) => c.handle);

const SERUM = "seruns";
const CREAM = "cream-line";
const KITS = "kits-line";
const CLEANSING = "facial-cleansing-line";
const ACCESSORIES = "skincare-accessories-line";
const SUNSCREEN = "sunscreen-line";

type Category =
  | "serum"
  | "cream"
  | "sunscreen"
  | "cleansing"
  | "kit"
  | "accessory"
  | "acne"
  | "unknown";

const MATCHERS: Array<{ category: Category; words: string[] }> = [
  { category: "acne", words: ["acne", "espinha", "anti-acne", "blemish", "salicylic", "salicílico", "cica"] },
  { category: "kit", words: ["kit", "set", "combo", "rotina", "routine"] },
  { category: "sunscreen", words: ["sunscreen", "protetor", "spf", "sun ", "solar", "uv"] },
  { category: "cleansing", words: ["cleans", "limpeza", "foam", "espuma", "gel de", "cleanser", "sabonete", "micel"] },
  { category: "accessory", words: ["roller", "jade", "vaporizador", "massage", "escova", "gua sha", "acess", "device", "tool"] },
  { category: "serum", words: ["serum", "sérum", "ampoule", "essence", "essência", "booster", "ácido", "acid"] },
  { category: "cream", words: ["cream", "creme", "moistur", "hidrat", "lotion", "loção", "balm", "gel-creme"] },
];

/** Deduz a categoria do produto a partir do título/descrição */
export function detectCategory(text: string): Category {
  const t = text.toLowerCase();
  for (const m of MATCHERS) {
    if (m.words.some((w) => t.includes(w))) return m.category;
  }
  return "unknown";
}

/** Coleções complementares priorizadas por categoria do produto atual */
const PRIORITY: Record<Category, string[]> = {
  serum: [CREAM, SUNSCREEN, KITS, ACCESSORIES, CLEANSING],
  cream: [SERUM, ACCESSORIES, KITS, SUNSCREEN, CLEANSING],
  sunscreen: [SERUM, CREAM, KITS, CLEANSING, ACCESSORIES],
  cleansing: [SERUM, CREAM, KITS, ACCESSORIES, SUNSCREEN],
  kit: [ACCESSORIES, SUNSCREEN, SERUM, CREAM, CLEANSING],
  accessory: [SERUM, CREAM, KITS, SUNSCREEN, CLEANSING],
  acne: [KITS, CLEANSING, SERUM, CREAM, SUNSCREEN],
  unknown: [SERUM, CREAM, KITS, SUNSCREEN, CLEANSING, ACCESSORIES],
};

async function fetchCollectionProducts(handle: string): Promise<ShopifyProduct[]> {
  const data = await storefrontApiRequest(COLLECTION_BY_HANDLE_QUERY, { handle, first: 20 });
  return data?.data?.collection?.products?.edges ?? [];
}

function useCollectionQueries() {
  return useQueries({
    queries: COLLECTION_HANDLES.map((handle) => ({
      queryKey: ["shopify-collection-products", handle],
      queryFn: () => fetchCollectionProducts(handle),
      staleTime: 5 * 60 * 1000,
    })),
  });
}

const LOW_TICKET_LIMIT = 30;

function priceOf(p: ShopifyProduct) {
  const v = p.node.variants.edges[0]?.node;
  return parseFloat(v?.price.amount ?? p.node.priceRange.minVariantPrice.amount);
}

/**
 * Vitrine de destaques: mistura as 6 coleções em rodízio e alterna entre
 * produtos abaixo e acima de R$ 30 para variar o ticket na grade.
 */
export function useFeaturedMix(limit = 8) {
  const queries = useCollectionQueries();
  const byHandle = queries.map((q) => q.data ?? []);
  const isLoading = queries.some((q) => q.isLoading);
  const error = (queries.find((q) => q.error)?.error as Error | null) ?? null;
  const fingerprint = byHandle.map((p) => p.length).join("-");

  const items = useMemo(() => {
    // Fila por coleção, cada uma separada em faixa baixa e alta
    const lanes = COLLECTION_HANDLES.map((_, i) => {
      const list = byHandle[i].filter((p) => p.node.variants.edges[0]?.node);
      return {
        low: list.filter((p) => priceOf(p) < LOW_TICKET_LIMIT),
        high: list.filter((p) => priceOf(p) >= LOW_TICKET_LIMIT),
      };
    });

    const picked: ShopifyProduct[] = [];
    const seen = new Set<string>();
    let band: "low" | "high" = "low";

    for (let round = 0; picked.length < limit && round < 20; round++) {
      let progressed = false;
      for (const lane of lanes) {
        if (picked.length >= limit) break;
        const next = lane[band].shift() ?? lane[band === "low" ? "high" : "low"].shift();
        if (next && !seen.has(next.node.id)) {
          seen.add(next.node.id);
          picked.push(next);
          progressed = true;
        }
        band = band === "low" ? "high" : "low";
      }
      if (!progressed) break;
    }

    // Vitamina C sempre em 1º e Niacinamida em 2º
    const all = byHandle.flat();
    const hoist = (words: string[], target: number) => {
      const match = (p: ShopifyProduct) => {
        const t = `${p.node.title} ${p.node.description ?? ""}`.toLowerCase();
        return words.some((w) => t.includes(w));
      };
      let idx = picked.findIndex(match);
      if (idx === -1) {
        const extra = all.find((p) => match(p) && !seen.has(p.node.id));
        if (!extra) return;
        seen.add(extra.node.id);
        picked.splice(picked.length - 1, 1);
        picked.push(extra);
        idx = picked.length - 1;
      }
      if (idx < target) return;
      const [item] = picked.splice(idx, 1);
      picked.splice(target, 0, item);
    };
    hoist(["vitamina c", "vitamin c", "ascórbico", "ascorbic"], 0);
    hoist(["niacinamida", "niacinamide"], 1);

    return picked;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fingerprint, limit]);

  return { items, isLoading, error };
}


function shuffle<T>(arr: T[], seed: number): T[] {
  const out = [...arr];
  let s = seed || 1;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) % 4294967296;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export type RecommendationContext = {
  /** Texto do produto atual (ou dos itens do carrinho) usado para deduzir a categoria */
  basedOn?: string;
  /** Handles que nunca devem aparecer (produto atual, itens já no carrinho) */
  exclude?: string[];
  /** Quantidade de sugestões */
  limit?: number;
  /** Muda a cada carregamento para variar as sugestões */
  seed?: number;
};

/**
 * Recomendações dinâmicas: mistura produtos das 6 coleções, priorizando as que
 * combinam com o produto/carrinho atual e variando a cada carregamento.
 */
export function useRecommendations({
  basedOn = "",
  exclude = [],
  limit = 3,
  seed,
}: RecommendationContext) {
  const queries = useQueries({
    queries: COLLECTION_HANDLES.map((handle) => ({
      queryKey: ["shopify-collection-products", handle],
      queryFn: () => fetchCollectionProducts(handle),
      staleTime: 5 * 60 * 1000,
    })),
  });

  const byHandle = queries.map((q) => q.data ?? []);
  const isLoading = queries.some((q) => q.isLoading);
  const fingerprint = byHandle.map((p) => p.length).join("-");

  const items = useMemo(() => {
    const activeSeed = seed ?? 1;
    const category = detectCategory(basedOn);
    const order = PRIORITY[category];

    // Pools embaralhados por coleção, sempre incluindo Kits Line
    const pools = new Map<string, ShopifyProduct[]>();
    COLLECTION_HANDLES.forEach((handle, i) => {
      const products = byHandle[i].filter(
        (p) => !exclude.includes(p.node.handle) && p.node.variants.edges[0]?.node,
      );
      pools.set(handle, shuffle(products, activeSeed + handle.length * 7919));
    });

    const rotation = [
      ...order,
      ...COLLECTION_HANDLES.filter((h) => !order.includes(h)),
    ];

    const picked: ShopifyProduct[] = [];
    const seen = new Set<string>();
    let round = 0;
    while (picked.length < limit && round < 6) {
      for (const handle of rotation) {
        if (picked.length >= limit) break;
        const pool = pools.get(handle);
        const next = pool?.[round];
        if (next && !seen.has(next.node.id)) {
          seen.add(next.node.id);
          picked.push(next);
        }
      }
      round++;
    }

    return picked;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fingerprint, basedOn, exclude.join(","), limit, seed]);

  return { items, isLoading };
}
