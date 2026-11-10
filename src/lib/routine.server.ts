import { streamText, Output, NoObjectGeneratedError } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import { createLovableAiGatewayRunIdFetch } from "./ai-gateway.server";
import type { ShopifyProduct } from "./shopify";

const SHOPIFY_API_VERSION = "2025-07";
const SHOPIFY_STORE_PERMANENT_DOMAIN = "aievat-va.myshopify.com";
const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
const SHOPIFY_STOREFRONT_TOKEN = "8c2db5b7abe96f6528edfcda933a5ec7";

export const ROUTINE_COLLECTIONS = [
  "seruns",
  "cream-line",
  "kits-line",
  "facial-cleansing-line",
  "skincare-accessories-line",
  "sunscreen-line",
] as const;

const COLLECTION_QUERY = `
  query CollectionProducts($handle: String!, $first: Int!) {
    collection(handle: $handle) {
      products(first: $first) {
        edges {
          node {
            id
            title
            description
            handle
            priceRange { minVariantPrice { amount currencyCode } }
            images(first: 3) { edges { node { url altText } } }
            variants(first: 5) {
              edges {
                node {
                  id
                  title
                  price { amount currencyCode }
                  availableForSale
                  selectedOptions { name value }
                }
              }
            }
            options { name values }
          }
        }
      }
    }
  }
`;

type CatalogEntry = { collection: string; product: ShopifyProduct };

async function fetchCollection(handle: string): Promise<ShopifyProduct[]> {
  const res = await fetch(SHOPIFY_STOREFRONT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query: COLLECTION_QUERY, variables: { handle, first: 30 } }),
  });
  if (!res.ok) return [];
  const data = (await res.json()) as {
    data?: { collection?: { products?: { edges?: ShopifyProduct[] } } };
  };
  return data?.data?.collection?.products?.edges ?? [];
}

export async function loadCatalog(): Promise<CatalogEntry[]> {
  const results = await Promise.all(ROUTINE_COLLECTIONS.map((h) => fetchCollection(h)));
  const out: CatalogEntry[] = [];
  const seen = new Set<string>();
  results.forEach((list, i) => {
    for (const product of list) {
      if (!product.node.variants.edges[0]?.node) continue;
      if (seen.has(product.node.handle)) continue;
      seen.add(product.node.handle);
      out.push({ collection: ROUTINE_COLLECTIONS[i], product });
    }
  });
  return out;
}

export type RoutineSlot = "limpeza" | "serum" | "creme" | "protetor" | "acessorio";

const ROUTINE_SLOTS: RoutineSlot[] = ["limpeza", "serum", "creme", "protetor", "acessorio"];

const SLOT_COLLECTIONS: Record<RoutineSlot, string[]> = {
  limpeza: ["facial-cleansing-line"],
  serum: ["seruns"],
  creme: ["cream-line"],
  protetor: ["sunscreen-line"],
  acessorio: ["skincare-accessories-line"],
};

/** Slots que nunca podem faltar na rotina personalizada. */
const REQUIRED_SLOTS: RoutineSlot[] = ["limpeza", "serum", "creme", "protetor"];

function pickFallback(
  catalog: CatalogEntry[],
  slot: RoutineSlot,
  used: Set<string>,
  seed: number,
): CatalogEntry | undefined {
  for (const collection of SLOT_COLLECTIONS[slot]) {
    const pool = catalog.filter(
      (e) => e.collection === collection && !used.has(e.product.node.handle),
    );
    if (pool.length > 0) return pool[seed % pool.length];
  }
  return undefined;
}

export type RoutineInput = { skin: string; goal: string; level?: string; seed: number };

export type RoutineItem = {
  slot: RoutineSlot;
  reason: string;
  product: ShopifyProduct;
};

export type RoutineKit = {
  product: ShopifyProduct;
  reason: string;
  includes: string[];
  benefits: string[];
  indicatedFor: string;
};

export type RoutineResult = {
  name: string;
  summary: string;
  order: string[];
  items: RoutineItem[];
  kit: RoutineKit | null;
};

const SlotSchema = z.object({ handle: z.string(), motivo: z.string() });

const RoutineSchema = z.object({
  nome: z.string(),
  resumo: z.string(),
  ordem: z.array(z.string()),
  kit: z
    .object({
      handle: z.string(),
      motivo: z.string(),
      inclusos: z.array(z.string()),
      beneficios: z.array(z.string()),
      indicadoPara: z.string(),
    })
    .nullable(),
  limpeza: SlotSchema,
  serum: SlotSchema,
  creme: SlotSchema,
  protetor: SlotSchema,
  acessorio: SlotSchema.nullable(),
});

function buildPrompt(catalog: CatalogEntry[], input: RoutineInput) {
  const lines = catalog
    .map(
      (e) =>
        `- handle: ${e.product.node.handle} | coleção: ${e.collection} | nome: ${e.product.node.title} | preço: R$ ${e.product.node.variants.edges[0]?.node.price.amount ?? e.product.node.priceRange.minVariantPrice.amount} | descrição: ${(e.product.node.description ?? "").slice(0, 260)}`,
    )
    .join("\n");

  return `Catálogo real da loja (use apenas estes handles):
${lines}

Cliente: tipo de pele "${input.skin}", objetivo "${input.goal}", nível de rotina "${input.level ?? "essencial"}".
Ajuste a quantidade e a complexidade dos passos ao nível informado (essencial: foco no básico; completa: rotina completa; avançada: pode incluir acessório e ativos mais potentes).
Semente de variação: ${input.seed}. Use a semente para variar entre opções igualmente adequadas — não escolha sempre os mesmos produtos.

Tarefa 1 — Kit pronto:
Verifique se existe na coleção "kits-line" um kit que realmente atenda ao objetivo informado. Se existir, preencha "kit" com:
- handle: o handle real do kit
- motivo: por que esse kit atende ao objetivo (máx. 240 caracteres)
- inclusos: os produtos que compõem o kit, extraídos do nome/descrição real (3 a 8 itens curtos)
- beneficios: 3 benefícios da combinação (frases curtas)
- indicadoPara: para qual objetivo/tipo de pele o kit é indicado (máx. 120 caracteres)
Se nenhum kit da coleção for adequado ao objetivo, retorne "kit": null. Nunca force um kit sem relação com a necessidade do cliente.

Tarefa 2 — Rotina personalizada (sempre obrigatória), com produtos reais:
- "limpeza": item da coleção facial-cleansing-line
- "serum": item da coleção seruns
- "creme": item da coleção cream-line
- "protetor": item da coleção sunscreen-line
- "acessorio": item da coleção skincare-accessories-line, apenas se fizer sentido; caso contrário null
Não use produtos da coleção kits-line na rotina personalizada.

Diretrizes por objetivo:
- Acne e oleosidade: sérum de niacinamida ou tea tree, hidratante leve, protetor solar.
- Manchas e luminosidade: vitamina C ou alpha arbutin, creme iluminador, protetor solar.
- Hidratação: ácido hialurônico, creme com snail ou aloe, limpeza suave, protetor solar.
- Anti-idade: retinol, creme com colágeno, ácido hialurônico, protetor solar.
Escolha sempre o item mais próximo disponível no catálogo real.

Escreva em português do Brasil, tom profissional e sóbrio, posicionamento de curadoria premium de skincare asiático. "nome" é um título curto e elegante para a rotina (máx. 45 caracteres, sem emojis, ex.: "Rotina Equilíbrio & Controle"). Cada "motivo" com no máximo 160 caracteres. "resumo" com no máximo 180 caracteres. "ordem" com 4 a 5 frases curtas indicando a ordem de aplicação da rotina personalizada.
Não invente produtos, marcas, descontos, promessas de cura ou resultados garantidos. Nunca use emojis.`;
}

export async function generateRoutine(input: RoutineInput): Promise<RoutineResult> {
  const catalog = await loadCatalog();
  if (catalog.length === 0) throw new Error("Catálogo indisponível no momento.");

  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("Serviço de recomendação indisponível.");

  const runIdFetch = createLovableAiGatewayRunIdFetch();
  const lovable = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: {
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
    fetch: runIdFetch.fetch,
  });

  let parsed: z.infer<typeof RoutineSchema> | null = null;
  try {
    const result = streamText({
      model: lovable.responses("openai/gpt-5.6-sol"),
      prompt: buildPrompt(catalog, input),
      output: Output.object({ schema: RoutineSchema }),
      providerOptions: {
        openai: {
          forceReasoning: true,
          reasoningEffort: "low",
          reasoningSummary: "auto",
          store: false,
          include: ["reasoning.encrypted_content"],
        },
      },
    });
    parsed = (await result.output) as z.infer<typeof RoutineSchema>;
  } catch (error) {
    if (!NoObjectGeneratedError.isInstance(error)) throw error;
    parsed = null;
  }

  const byHandle = new Map(catalog.map((e) => [e.product.node.handle, e]));
  const used = new Set<string>();

  const items: RoutineItem[] = [];
  ROUTINE_SLOTS.forEach((slot, i) => {
    const suggested = parsed?.[slot] ?? null;
    let entry =
      suggested && byHandle.get(suggested.handle)?.collection !== "kits-line"
        ? byHandle.get(suggested.handle)
        : undefined;
    if (entry && used.has(entry.product.node.handle)) entry = undefined;
    const suggestedValid = Boolean(entry);
    if (!entry && (REQUIRED_SLOTS.includes(slot) || suggested)) {
      entry = pickFallback(catalog, slot, used, input.seed + i * 13);
    }
    if (!entry) return;
    used.add(entry.product.node.handle);
    items.push({
      slot,
      reason: suggestedValid
        ? suggested!.motivo
        : "Selecionado da nossa curadoria para complementar esta rotina.",
      product: entry.product,
    });
  });

  if (items.length === 0) throw new Error("Não foi possível montar a rotina agora.");

  const kitEntry = parsed?.kit ? byHandle.get(parsed.kit.handle) : undefined;
  const kit: RoutineKit | null =
    parsed?.kit && kitEntry && kitEntry.collection === "kits-line"
      ? {
          product: kitEntry.product,
          reason: parsed.kit.motivo,
          includes: parsed.kit.inclusos.slice(0, 8),
          benefits: parsed.kit.beneficios.slice(0, 4),
          indicatedFor: parsed.kit.indicadoPara,
        }
      : null;

  return {
    name: parsed?.nome ?? "Sua rotina personalizada Dermiglow",
    summary:
      parsed?.resumo ??
      "Rotina montada com produtos da nossa curadoria para o seu tipo de pele e objetivo.",
    order: parsed?.ordem?.slice(0, 5) ?? [
      "Comece com a limpeza facial sobre a pele seca ou úmida.",
      "Aplique o sérum sobre a pele limpa.",
      "Em seguida, use o creme para selar a hidratação.",
      "Durante o dia, finalize com o protetor solar.",
    ],
    items,
    kit,
  };
}
