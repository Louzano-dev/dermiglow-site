/**
 * Ranking automático de popularidade de mercado.
 *
 * Cada produto recebe uma pontuação a partir do que realmente mais vende no
 * mercado de skincare hoje, lendo título + descrição + tipo do produto.
 * Produtos novos entram no ranking sozinhos, sem configuração manual.
 */
import type { ShopifyProduct } from "./shopify";

type Rule = { re: RegExp; score: number };

/** Ativos campeões de venda (valem em qualquer categoria) */
const ACTIVE_RULES: Rule[] = [
  { re: /vitamina\s*c|vitamin\s*c|ácido ascórbico|ascorbic/i, score: 100 },
  { re: /niacinamida|niacinamide/i, score: 92 },
  { re: /ácido hialurônico|acido hialuronico|hyaluronic/i, score: 84 },
  { re: /retinol|retinal|retinóide|retinoid/i, score: 76 },
  { re: /ácido salicílico|salicylic|bha/i, score: 70 },
  { re: /colágeno|collagen|peptíde|peptide/i, score: 62 },
  { re: /centella|cica|madecassoside/i, score: 56 },
  { re: /ceramida|ceramide/i, score: 52 },
  { re: /ácido glicólico|glycolic|aha/i, score: 48 },
  { re: /chá verde|green tea|mucin|caracol|snail/i, score: 40 },
];

/** Tipos de produto, do que mais vende para o que menos vende */
const TYPE_RULES: Rule[] = [
  { re: /protetor solar|protetor|sunscreen|fps|spf/i, score: 90 },
  { re: /sérum|serum/i, score: 85 },
  { re: /gel de limpeza|sabonete facial|cleanser|limpeza facial/i, score: 72 },
  { re: /hidratante|moisturizer|creme facial/i, score: 68 },
  { re: /kit|combo/i, score: 64 },
  { re: /máscara|mask/i, score: 46 },
  { re: /tônic|toner|água micelar|micellar/i, score: 42 },
  { re: /esfoliante|scrub|peeling/i, score: 36 },
  { re: /óleo|oil|balm/i, score: 30 },
  { re: /rolo|roller|massageador|gua sha|pinça|espátula|acessório/i, score: 26 },
];

/** Bônus por atributos que puxam venda dentro da categoria */
const BONUS_RULES: Rule[] = [
  { re: /toque seco|oil free|oil-free|matte|sem oleosidade/i, score: 18 },
  { re: /com cor|tonalizante|tinted|base/i, score: 14 },
  { re: /manchas|clareador|clareamento|brightening|glow/i, score: 12 },
  { re: /acne|oleosidade|cravos|poros/i, score: 12 },
  { re: /anti-idade|antiidade|antissinais|firmeza|rugas/i, score: 10 },
  { re: /fps\s*5\d|fps\s*[6-9]\d|spf\s*5\d/i, score: 8 },
  { re: /rotina completa|passos|\b[3-9]\s*(itens|produtos|passos)\b/i, score: 8 },
];

function textOf(p: ShopifyProduct) {
  const n = p.node as unknown as { title: string; description?: string; productType?: string };
  return `${n.title} ${n.description ?? ""} ${n.productType ?? ""}`;
}

function best(rules: Rule[], text: string) {
  let max = 0;
  for (const r of rules) if (r.re.test(text) && r.score > max) max = r.score;
  return max;
}

function sumBonus(text: string) {
  return BONUS_RULES.reduce((acc, r) => acc + (r.re.test(text) ? r.score : 0), 0);
}

export function priceOf(p: ShopifyProduct): number {
  return parseFloat(
    p.node.variants?.edges?.[0]?.node?.price?.amount ?? p.node.priceRange.minVariantPrice.amount,
  );
}

/** Pontuação de popularidade de mercado do produto (maior = mais vendido) */
export function popularityScore(p: ShopifyProduct): number {
  const text = textOf(p);
  return best(ACTIVE_RULES, text) * 1.2 + best(TYPE_RULES, text) + sumBonus(text);
}

/** Ordena do mais vendido no mercado para o menos vendido; empate = mais barato primeiro */
export function sortByPopularity(products: ShopifyProduct[]): ShopifyProduct[] {
  return [...products].sort((a, b) => {
    const diff = popularityScore(b) - popularityScore(a);
    if (Math.abs(diff) > 0.001) return diff;
    return priceOf(a) - priceOf(b);
  });
}

/**
 * Mapa de selos "Mais vendido" para os produtos mais populares da lista.
 * Recebe a lista já exibida e marca os índices dos top N por popularidade.
 */
export function bestSellerTags(
  products: ShopifyProduct[],
  count = 3,
): Record<number, string> {
  const top = sortByPopularity(products).slice(0, Math.min(count, products.length));
  const ids = new Set(top.map((p) => p.node.id));
  const tags: Record<number, string> = {};
  products.forEach((p, i) => {
    if (ids.has(p.node.id)) tags[i] = "Destaque";
  });
  return tags;
}
