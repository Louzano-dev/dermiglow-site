import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { demoCatalogRequest, demoCollections } from "./demo-catalog";
import { buildDemoRoutine } from "./demo-routine";
import { useCartStore } from "../stores/cartStore";

describe("Portfólio Dermiglow", () => {
  test("coleção de cremes contém apenas cremes demonstrativos", () => {
    const creams = demoCollections.find((collection) => collection.handle === "cream-line");
    assert.equal(creams?.products.edges.length, 4);
    assert.equal(creams?.products.edges.every((item) => /creme/i.test(item.node.title)), true);
  });
  test("todas as seis coleções têm produtos", () => {
    assert.deepEqual(demoCollections.map((collection) => collection.products.edges.length), [4, 4, 4, 4, 4, 4]);
  });
  test("pagamento real é bloqueado mesmo quando solicitado diretamente", () => {
    assert.throws(() => demoCatalogRequest("mutation cartCreate {}"));
  });
  test("sacola local nunca retorna um endereço de pagamento", async () => {
    const item = demoCollections[0].products.edges[0];
    const variant = item.node.variants.edges[0].node;
    useCartStore.getState().clearCart();
    await useCartStore.getState().addItem({ product: item, variantId: variant.id, variantTitle: variant.title, price: variant.price, quantity: 1, selectedOptions: [] });
    assert.equal(useCartStore.getState().items[0].quantity, 1);
    assert.equal(await useCartStore.getState().refreshCheckoutUrl(), null);
    await useCartStore.getState().updateQuantity(variant.id, 2);
    assert.equal(useCartStore.getState().items[0].quantity, 2);
    await useCartStore.getState().removeItem(variant.id);
    assert.deepEqual(useCartStore.getState().items, []);
  });
  test("rotina demonstrativa usa produtos locais e inclui kit", () => {
    const routine = buildDemoRoutine({ skin: "oleosa", goal: "acne", level: "completa", seed: 0 });
    assert.equal(routine.items.find((item) => item.slot === "serum")?.product.node.handle, "serum-niacinamida");
    assert.equal(routine.kit?.product.node.handle, "kit-equilibrio");
  });
});