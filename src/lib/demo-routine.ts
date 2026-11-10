import { demoCollections } from "./demo-catalog";
import type { RoutineInput, RoutineResult, RoutineSlot } from "./routine.server";

export function buildDemoRoutine(input: RoutineInput): RoutineResult {
  const serumIndex = input.skin === "sensivel" ? 3 : input.goal === "acne" ? 1 : input.goal === "hidratacao" ? 2 : 0;
  const creamIndex = input.skin === "sensivel" ? 3 : input.skin === "oleosa" || input.skin === "mista" ? 1 : input.goal === "anti-idade" ? 2 : 0;
  const selections: [RoutineSlot, string, number][] = [
    ["limpeza", "facial-cleansing-line", input.skin === "oleosa" ? 2 : 0],
    ["serum", "seruns", serumIndex],
    ["creme", "cream-line", creamIndex],
    ["protetor", "sunscreen-line", input.skin === "seca" ? 2 : input.skin === "oleosa" ? 1 : 0],
  ];
  if (input.level === "avancada") selections.push(["acessorio", "skincare-accessories-line", 0]);
  const items = selections.flatMap(([slot, handle, index]) => {
    const product = demoCollections.find((collection) => collection.handle === handle)?.products.edges[index];
    return product ? [{ slot, product, reason: product.node.description.split(".")[0] }] : [];
  });
  const kitIndex = input.goal === "acne" ? 1 : input.goal === "hidratacao" ? 2 : input.level === "avancada" ? 3 : 0;
  const product = demoCollections.find((collection) => collection.handle === "kits-line")?.products.edges[kitIndex];
  return {
    name: "Sua rotina demonstrativa",
    summary: "Seleção ilustrativa baseada nas suas preferências. Não substitui orientação dermatológica e não está disponível para compra.",
    order: ["Limpeza facial", "Sérum", "Hidratante", "Proteção solar durante o dia"],
    items,
    kit: product ? { product, reason: "Uma opção ilustrativa para reunir seus cuidados.", includes: ["Limpeza", "Tratamento", "Hidratação"], benefits: ["Uma rotina organizada", "Cuidados complementares"], indicatedFor: `Rotina demonstrativa para pele ${input.skin}.` } : null,
  };
}