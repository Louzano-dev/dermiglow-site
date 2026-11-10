import serum from "@/assets/product-serum.jpg";
import cream from "@/assets/product-cream.jpg";
import cleanser from "@/assets/product-cleanser.jpg";
import sunscreen from "@/assets/product-sunscreen.jpg";
import accessory from "@/assets/demo-accessory.jpg";
import kit from "@/assets/demo-kit.jpg";
import type { ShopifyProduct, ShopifyProductDetail } from "./shopify";

export const DEMO_MODE = true;

const groups = [
  { handle: "seruns", title: "Linha de Séruns", image: serum, products: [
    ["Sérum Vitamina C", "serum-vitamina-c", "59.90", "Luminosidade e cuidado antioxidante", "Uma proposta de sérum de textura leve para uma rotina voltada à luminosidade."],
    ["Sérum Niacinamida", "serum-niacinamida", "49.90", "Equilíbrio para peles oleosas", "Uma proposta de cuidado diário para oleosidade e aparência dos poros."],
    ["Sérum Ácido Hialurônico", "serum-acido-hialuronico", "54.90", "Hidratação com textura leve", "Uma proposta de tratamento para peles secas e desidratadas."],
    ["Sérum Centella", "serum-centella", "64.90", "Conforto para peles sensíveis", "Uma proposta de cuidado suave para uma rotina de conforto da pele."],
  ] },
  { handle: "cream-line", title: "Linha de Cremes", image: cream, products: [
    ["Creme Facial de Ceramidas", "creme-ceramidas", "69.90", "Conforto e hidratação diária", "Uma proposta de creme facial para hidratação e cuidado da barreira cutânea."],
    ["Gel-Creme Hidratante", "gel-creme-hidratante", "39.90", "Textura fresca e leve", "Uma proposta de hidratação para peles mistas e oleosas."],
    ["Creme Noturno de Peptídeos", "creme-noturno-peptideos", "89.90", "Cuidado noturno para a pele", "Uma proposta de creme noturno para uma rotina de cuidado com linhas finas."],
    ["Creme Calmante Cica", "creme-calmante-cica", "59.90", "Suavidade para peles sensíveis", "Uma proposta de hidratação suave com inspiração nas rotinas de centella."],
  ] },
  { handle: "kits-line", title: "Linha de Kits", image: kit, products: [
    ["Kit Luminosidade", "kit-luminosidade", "149.90", "Uma rotina com vitamina C", "Conjunto ilustrativo de limpeza, tratamento e hidratação para luminosidade."],
    ["Kit Equilíbrio Facial", "kit-equilibrio", "139.90", "Uma rotina para pele oleosa", "Conjunto ilustrativo de cuidados com niacinamida e texturas leves."],
    ["Kit Hidratação Essencial", "kit-hidratacao", "159.90", "Uma rotina para pele seca", "Conjunto ilustrativo para hidratação e conforto no dia a dia."],
    ["Kit Rotina Completa", "kit-rotina-completa", "199.90", "Quatro passos de cuidado", "Conjunto ilustrativo com limpeza, sérum, creme e proteção solar."],
  ] },
  { handle: "facial-cleansing-line", title: "Linha de Limpeza Facial", image: cleanser, products: [
    ["Gel de Limpeza Suave", "gel-limpeza-suave", "34.90", "Limpeza delicada para o dia a dia", "Uma proposta de gel facial para começar a rotina sem sensação de ressecamento."],
    ["Espuma de Limpeza Facial", "espuma-limpeza", "44.90", "Espuma leve e macia", "Uma proposta de limpeza facial de textura aerada."],
    ["Gel de Limpeza Chá Verde", "gel-cha-verde", "39.90", "Frescor na rotina facial", "Uma proposta de limpeza para peles mistas e oleosas."],
    ["Balm de Limpeza", "balm-limpeza", "64.90", "Primeiro passo da dupla limpeza", "Uma proposta de balm para uma rotina de limpeza em duas etapas."],
  ] },
  { handle: "skincare-accessories-line", title: "Linha de Acessórios", image: accessory, products: [
    ["Duo Roller e Gua Sha", "duo-roller-gua-sha", "49.90", "Um momento de autocuidado", "Duo ilustrativo de acessórios para massagem facial suave."],
    ["Roller Facial de Jade", "roller-jade", "29.90", "Massagem suave para a rotina", "Acessório ilustrativo para complementar seus cuidados faciais."],
    ["Gua Sha Facial", "gua-sha-facial", "24.90", "Cuidado com movimentos delicados", "Pedra ilustrativa para uma rotina de massagem facial."],
    ["Kit Massagem Facial", "kit-massagem-facial", "59.90", "Acessórios para seu ritual", "Conjunto ilustrativo de ferramentas de autocuidado."],
  ] },
  { handle: "sunscreen-line", title: "Linha de Protetores Solares", image: sunscreen, products: [
    ["Protetor Solar FPS 50", "protetor-fps-50", "69.90", "Proteção para o dia a dia", "Uma proposta de proteção solar de textura leve para finalizar a rotina."],
    ["Protetor Solar Toque Seco", "protetor-toque-seco", "74.90", "Acabamento leve e confortável", "Uma proposta de protetor solar para peles mistas e oleosas."],
    ["Protetor Solar Hidratante", "protetor-hidratante", "79.90", "Proteção e conforto", "Uma proposta de proteção solar para peles secas."],
    ["Protetor Solar Fluido", "protetor-fluido", "64.90", "Textura fluida para uso diário", "Uma proposta de proteção solar com aplicação leve."],
  ] },
];

export const demoCollections = groups.map((group) => ({
  id: `demo-collection-${group.handle}`, title: group.title, handle: group.handle,
  description: "Seleção demonstrativa do portfólio Dermiglow. Produtos e preços são ilustrativos, sem venda ou envio.",
  image: { url: group.image, altText: group.title },
  products: { edges: group.products.map(([title, handle, amount, benefit, details]): ShopifyProduct & { node: ShopifyProductDetail } => {
    const price = { amount, currencyCode: "BRL" };
    const node: ShopifyProductDetail = {
      id: `demo-product-${handle}`, title, handle,
      description: `${benefit}. ${details} Produto demonstrativo do portfólio, sem venda real.`,
      descriptionHtml: `<h3>${benefit}</h3><p>${details}</p><p>Produto e imagem ilustrativos, criados para este portfólio. Preço fictício. Não disponível para compra.</p>`,
      priceRange: { minVariantPrice: price },
      images: { edges: [{ node: { url: group.image, altText: title } }] },
      variants: { edges: [{ node: { id: `demo-variant-${handle}`, title: "Padrão", price, availableForSale: true, selectedOptions: [] } }] },
      options: [],
    };
    return { node };
  }) },
}));

export const demoProducts = demoCollections.flatMap((collection) => collection.products.edges);

/** Compatibility boundary for existing catalog queries. Never sends a network request. */
export function demoCatalogRequest(query: string, variables: unknown = {}) {
  const vars = variables as { handle?: string; first?: number; query?: string };
  if (/\bmutation\b|\bcart\s*\(/.test(query)) throw new Error("Pagamentos indisponíveis no portfólio.");
  if (/\bcollection\s*\(/.test(query)) {
    const collection = demoCollections.find((item) => item.handle === vars.handle);
    return { data: { collection: collection ? { ...collection, products: { edges: collection.products.edges.slice(0, vars.first ?? 100) } } : null } };
  }
  if (/\bcollections\s*\(/.test(query)) return { data: { collections: { edges: demoCollections.map((node) => ({ node })) } } };
  if (/\bproduct\s*\(/.test(query)) return { data: { product: demoProducts.find((item) => item.node.handle === vars.handle)?.node ?? null } };
  const term = vars.query?.replace(/^title:/, "").toLocaleLowerCase("pt-BR");
  const products = term ? demoProducts.filter((item) => `${item.node.title} ${item.node.description}`.toLocaleLowerCase("pt-BR").includes(term)) : demoProducts;
  return { data: { products: { edges: products.slice(0, vars.first ?? 100) } } };
}