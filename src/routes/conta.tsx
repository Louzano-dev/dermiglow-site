import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Toaster, toast } from "sonner";
import { Loader2, Package, ShoppingBag, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useCartStore } from "@/stores/cartStore";
import { formatCpf, isValidCpf, onlyDigits } from "@/lib/cpf";
import { saveProfile } from "@/lib/account.functions";

export const Route = createFileRoute("/conta")({
  head: () => ({
    meta: [
      { title: "Minha conta | Dermiglow" },
      { name: "description", content: "Seus dados, pedidos, carrinho salvo e produtos disponíveis para avaliar." },
      { property: "og:title", content: "Minha conta | Dermiglow" },
      { property: "og:description", content: "Acompanhe pedidos e avalie os produtos já entregues." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/entrar", replace: true });
  }, [loading, user, navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster position="top-center" />
      <Header />
      <section className="mx-auto max-w-3xl px-4 py-16 md:py-24">
        {loading || !user ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <AccountContent userId={user.id} email={user.email ?? ""} />
        )}
      </section>
      <Footer />
    </div>
  );
}

function AccountContent({ userId, email }: { userId: string; email: string }) {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);

  const { data: profile, refetch } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, cpf_last3")
        .eq("id", userId)
        .maybeSingle();
      return data;
    },
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["orders", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("id, order_number, fulfillment_status, delivered_at, tracking_url, created_at, order_items(product_title, product_handle, quantity)")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  };

  const reviewable = orders
    .filter((o) => o.delivered_at)
    .flatMap((o) => o.order_items ?? [])
    .filter((i) => i.product_handle);

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Minha conta</p>
          <h1 className="font-display text-4xl">{profile?.full_name ?? "Bem-vinda"}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{email}</p>
        </div>
        <Button variant="outline" className="rounded-full" onClick={signOut}>
          Sair
        </Button>
      </div>

      {!profile?.cpf_last3 && <CpfForm onSaved={() => refetch()} />}
      {profile?.cpf_last3 && (
        <p className="text-xs text-muted-foreground">
          CPF cadastrado: •••.•••.•••-{profile.cpf_last3}
        </p>
      )}

      <div>
        <h2 className="mb-3 flex items-center gap-2 font-display text-2xl">
          <ShoppingBag className="h-5 w-5" strokeWidth={1.5} /> Carrinho salvo
        </h2>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum item salvo no momento.</p>
        ) : (
          <ul className="space-y-1 text-sm text-muted-foreground">
            {items.map((i) => (
              <li key={i.variantId}>
                {i.quantity}× {i.product.node.title}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="mb-3 flex items-center gap-2 font-display text-2xl">
          <Package className="h-5 w-5" strokeWidth={1.5} /> Meus pedidos
        </h2>
        {orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Seus pedidos aparecem aqui assim que a compra é concluída com o mesmo e-mail da conta.
          </p>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <div key={o.id} className="rounded-2xl border border-border bg-card p-4 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">Pedido {o.order_number ?? o.id.slice(0, 8)}</span>
                  <span className="text-xs text-muted-foreground">
                    {o.delivered_at ? "Entregue" : (o.fulfillment_status ?? "Em processamento")}
                  </span>
                </div>
                <ul className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                  {(o.order_items ?? []).map((i, idx) => (
                    <li key={idx}>
                      {i.quantity}× {i.product_title}
                    </li>
                  ))}
                </ul>
                {o.tracking_url && (
                  <a
                    href={o.tracking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                  >
                    Rastrear pedido
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 flex items-center gap-2 font-display text-2xl">
          <Star className="h-5 w-5" strokeWidth={1.5} /> Produtos para avaliar
        </h2>
        {reviewable.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Assim que um pedido for entregue, os produtos aparecem aqui para você avaliar.
          </p>
        ) : (
          <ul className="space-y-2 text-sm">
            {reviewable.map((i, idx) => (
              <li key={idx}>
                <Link
                  to="/produto/$handle"
                  params={{ handle: i.product_handle! }}
                  className="underline hover:text-foreground"
                >
                  {i.product_title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function CpfForm({ onSaved }: { onSaved: () => void }) {
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) return toast.error("Informe seu nome completo.");
    if (!isValidCpf(cpf)) return toast.error("CPF inválido.");
    setLoading(true);
    try {
      await saveProfile({ data: { fullName: name.trim(), cpf: onlyDigits(cpf) } });
      toast.success("Dados salvos");
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível salvar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border border-border bg-card p-5">
      <p className="text-sm font-medium">Complete seu cadastro</p>
      <input
        value={name}
        maxLength={80}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nome completo"
        className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm outline-none"
      />
      <input
        value={cpf}
        inputMode="numeric"
        onChange={(e) => setCpf(formatCpf(e.target.value))}
        placeholder="CPF"
        className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm outline-none"
      />
      <Button type="submit" className="rounded-full" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
      </Button>
    </form>
  );
}
