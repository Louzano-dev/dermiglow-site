import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCartStore } from "@/stores/cartStore";
import { useAuth } from "./use-auth";

/**
 * Mantém o carrinho do cliente logado salvo no banco, para voltar em qualquer dispositivo.
 */
export function useSavedCart() {
  const { user } = useAuth();
  const items = useCartStore((s) => s.items);
  const restored = useRef<string | null>(null);

  // Restaura o carrinho salvo ao entrar
  useEffect(() => {
    if (!user || restored.current === user.id) return;
    restored.current = user.id;
    (async () => {
      const { data } = await supabase
        .from("saved_carts")
        .select("items")
        .eq("user_id", user.id)
        .maybeSingle();
      const saved = (data?.items ?? []) as unknown as typeof items;
      if (Array.isArray(saved) && saved.length > 0 && useCartStore.getState().items.length === 0) {
        useCartStore.setState({ items: saved });
      }
    })();
  }, [user]);

  // Salva alterações
  useEffect(() => {
    if (!user || restored.current !== user.id) return;
    const timer = setTimeout(() => {
      void supabase
        .from("saved_carts")
        .upsert(
          { user_id: user.id, items: items as unknown as never, updated_at: new Date().toISOString() },
          { onConflict: "user_id" },
        );
    }, 800);
    return () => clearTimeout(timer);
  }, [items, user]);
}
