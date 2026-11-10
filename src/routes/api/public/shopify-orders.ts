import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

export const Route = createFileRoute("/api/public/shopify-orders")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["SHOPIFY_WEBHOOK_SECRET"];
        if (!secret) {
          console.error("SHOPIFY_WEBHOOK_SECRET is not set");
          return new Response("Webhook secret not configured", { status: 500 });
        }

        const signature = request.headers.get("x-shopify-hmac-sha256") ?? "";
        const topic = request.headers.get("x-shopify-topic") ?? "";
        const body = await request.text();

        const expected = createHmac("sha256", secret).update(body).digest("base64");
        const sigBuf = Buffer.from(signature);
        const expBuf = Buffer.from(expected);
        if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
          return new Response("Invalid signature", { status: 401 });
        }

        const payload = JSON.parse(body) as ShopifyOrderPayload;
        await upsertOrder(payload);

        console.log(`[shopify-orders] ${topic} processed for order ${payload.order_number ?? payload.id}`);
        return new Response("ok");
      },
    },
  },
});

interface ShopifyOrderPayload {
  id: number;
  order_number: number;
  email: string;
  financial_status?: string;
  fulfillment_status?: string | null;
  line_items: Array<{
    product_id?: number;
    variant_id?: number;
    title: string;
    quantity: number;
  }>;
  fulfillments?: Array<{
    tracking_number?: string;
    tracking_url?: string;
    created_at?: string;
  }>;
  shipping_address?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

async function upsertOrder(payload: ShopifyOrderPayload) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const shopifyOrderId = String(payload.id);
  const orderNumber = String(payload.order_number);
  const email = payload.email?.toLowerCase().trim() ?? "";

  // Vincula ao usuário pelo e-mail, se existir
  let userId: string | null = null;
  if (email) {
    const { data: user } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    if (user) userId = user.id;
  }

  const fulfillment = payload.fulfillments?.[0];
  const trackingCode = fulfillment?.tracking_number ?? null;
  const trackingUrl = fulfillment?.tracking_url ?? null;
  const shippedAt = fulfillment?.created_at ? new Date(fulfillment.created_at).toISOString() : null;
  const deliveredAt = payload.fulfillment_status === "fulfilled" ? new Date().toISOString() : null;

  const { data: order, error: upsertError } = await supabaseAdmin
    .from("orders")
    .upsert(
      {
        shopify_order_id: shopifyOrderId,
        user_id: userId,
        email,
        order_number: orderNumber,
        financial_status: payload.financial_status ?? null,
        fulfillment_status: payload.fulfillment_status ?? null,
        tracking_code: trackingCode,
        tracking_url: trackingUrl,
        shipped_at: shippedAt,
        delivered_at: deliveredAt,
        shipping_address: (payload.shipping_address ?? null) as unknown as null,
        created_at: payload.created_at ? new Date(payload.created_at).toISOString() : new Date().toISOString(),
        updated_at: payload.updated_at ? new Date(payload.updated_at).toISOString() : new Date().toISOString(),
      },
      { onConflict: "shopify_order_id" },
    )
    .select("id")
    .single();

  if (upsertError || !order) {
    console.error("Failed to upsert order:", upsertError);
    throw new Error("Failed to upsert order");
  }

  // Remove itens antigos e reinsere para refletir atualizações
  await supabaseAdmin.from("order_items").delete().eq("order_id", order.id);

  const items = payload.line_items.map((item) => ({
    order_id: order.id,
    product_handle: item.product_id ? String(item.product_id) : null,
    product_title: item.title,
    variant_id: item.variant_id ? String(item.variant_id) : null,
    quantity: item.quantity,
  }));

  if (items.length > 0) {
    const { error: itemsError } = await supabaseAdmin.from("order_items").insert(items);
    if (itemsError) {
      console.error("Failed to insert order items:", itemsError);
      throw new Error("Failed to insert order items");
    }
  }
}
