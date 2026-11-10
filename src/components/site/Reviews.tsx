import { useMemo, useState } from "react";
import { Star, Loader2, ShieldCheck } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export type Review = {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  display_name: string;
  verified: boolean;
  created_at: string;
};

export function Stars({ value, small = false }: { value: number; small?: boolean }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${small ? "h-3 w-3" : "h-4 w-4"} ${i <= Math.round(value) ? "fill-primary text-primary" : "text-muted-foreground/40"}`}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

async function fetchReviews(handle: string): Promise<Review[]> {
  const { data } = await supabase
    .from("reviews")
    .select("id, rating, title, body, display_name, verified, created_at")
    .eq("product_handle", handle)
    .eq("status", "approved")
    .order("created_at", { ascending: false });
  return (data ?? []) as Review[];
}

export function useReviews(handle: string) {
  return useQuery({ queryKey: ["reviews", handle], queryFn: () => fetchReviews(handle) });
}

export function ProductReviews({ handle }: { handle: string }) {
  const { data: reviews = [], isLoading } = useReviews(handle);
  const { user } = useAuth();
  const [sort, setSort] = useState<"recent" | "best">("recent");

  const { data: canReview } = useQuery({
    queryKey: ["can-review", handle, user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data } = await supabase.rpc("has_delivered_purchase", {
        _user_id: user!.id,
        _handle: handle,
      });
      return Boolean(data);
    },
  });

  const { average, distribution } = useMemo(() => {
    if (reviews.length === 0) return { average: 0, distribution: [0, 0, 0, 0, 0] };
    const dist = [0, 0, 0, 0, 0];
    let sum = 0;
    for (const r of reviews) {
      sum += r.rating;
      dist[r.rating - 1] += 1;
    }
    return { average: sum / reviews.length, distribution: dist };
  }, [reviews]);

  const sorted = useMemo(
    () =>
      [...reviews].sort((a, b) =>
        sort === "best" ? b.rating - a.rating : +new Date(b.created_at) - +new Date(a.created_at),
      ),
    [reviews, sort],
  );

  return (
    <div>
      <h2 className="mb-4 font-display text-2xl md:text-3xl">Avaliações</h2>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card/50 p-8 text-center md:p-10">
          <div className="mb-3 flex justify-center gap-0.5 text-muted-foreground/40">
            {[...Array(5)].map((_, s) => (
              <Star key={s} className="h-5 w-5" strokeWidth={1.5} />
            ))}
          </div>
          <p className="font-display text-xl">Ainda sem avaliações</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Só clientes com o pedido entregue podem avaliar este produto. Assim toda avaliação aqui é real.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 rounded-3xl border border-border bg-card p-6 sm:grid-cols-[auto_1fr]">
            <div className="text-center sm:text-left">
              <div className="font-display text-4xl">{average.toFixed(1)}</div>
              <Stars value={average} />
              <div className="mt-1 text-xs text-muted-foreground">
                {reviews.length} avaliação{reviews.length > 1 ? "ões" : ""}
              </div>
            </div>
            <div className="space-y-1.5">
              {[5, 4, 3, 2, 1].map((n) => {
                const count = distribution[n - 1];
                const pct = reviews.length ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={n} className="flex items-center gap-2 text-xs">
                    <span className="w-3 text-muted-foreground">{n}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-6 text-right text-muted-foreground">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-2 text-xs">
            {(["recent", "best"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className={`rounded-full border px-3 py-1.5 ${sort === s ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}
              >
                {s === "recent" ? "Mais recentes" : "Melhor avaliadas"}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {sorted.map((r) => (
              <div key={r.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <Stars value={r.rating} small />
                  <span className="text-sm font-medium">{r.display_name}</span>
                  {r.verified && (
                    <span className="flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                      <ShieldCheck className="h-3 w-3" /> Compra verificada
                    </span>
                  )}
                  <span className="ml-auto text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                {r.title && <div className="mt-2 text-sm font-medium">{r.title}</div>}
                {r.body && <p className="mt-1 text-sm text-muted-foreground">{r.body}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {canReview && <ReviewForm handle={handle} />}
      {user && !canReview && (
        <p className="mt-4 text-xs text-muted-foreground">
          Avaliações são liberadas apenas para pedidos já entregues deste produto.
        </p>
      )}
    </div>
  );
}

export function ReviewForm({ handle }: { handle: string }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const meta = (user.user_metadata ?? {}) as { full_name?: string };
    const raw = meta.full_name ?? user.email ?? "Cliente";
    const parts = raw.split(" ");
    const display = parts[1] ? `${parts[0]} ${parts[1][0]}.` : parts[0];
    const { error } = await supabase.from("reviews").insert({
      user_id: user.id,
      product_handle: handle,
      rating,
      title: title.trim() || null,
      body: body.trim() || null,
      display_name: display,
    });
    setLoading(false);
    if (error) {
      toast.error(
        error.code === "23505"
          ? "Você já avaliou este produto."
          : "Só é possível avaliar produtos de pedidos entregues.",
      );
      return;
    }
    setTitle("");
    setBody("");
    toast.success("Avaliação enviada", { description: "Ela aparece no site após a moderação." });
    void qc.invalidateQueries({ queryKey: ["reviews", handle] });
  };

  return (
    <form onSubmit={submit} className="mt-6 space-y-3 rounded-2xl border border-border bg-card p-5">
      <p className="text-sm font-medium">Avaliar este produto</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} estrelas`}>
            <Star
              className={`h-6 w-6 ${n <= rating ? "fill-primary text-primary" : "text-muted-foreground/40"}`}
              strokeWidth={1.5}
            />
          </button>
        ))}
      </div>
      <input
        value={title}
        maxLength={80}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Título (opcional)"
        className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm outline-none"
      />
      <textarea
        value={body}
        maxLength={1000}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Conte como foi sua experiência"
        rows={4}
        className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm outline-none"
      />
      <Button type="submit" className="rounded-full" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enviar avaliação"}
      </Button>
    </form>
  );
}
