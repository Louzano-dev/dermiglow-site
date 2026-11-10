import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Toaster, toast } from "sonner";
import { Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  isAdmin,
  listCustomersAdmin,
  listOrdersAdmin,
  listPendingReviews,
  moderateReview,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/adm")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Administração | Dermiglow" },
      { name: "description", content: "Área interna de administração da loja." },
      { property: "og:title", content: "Administração | Dermiglow" },
      { property: "og:description", content: "Área interna de administração Dermiglow." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const { data: role, isLoading: checking } = useQuery({
    queryKey: ["is-admin", user?.id],
    queryFn: () => isAdmin(),
    enabled: Boolean(user),
  });

  useEffect(() => {
    if (loading || checking) return;
    if (!user) navigate({ to: "/entrar", replace: true });
    else if (role && !role.admin) navigate({ to: "/", replace: true });
  }, [loading, checking, user, role, navigate]);

  if (loading || checking || !user || !role?.admin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <AdminPanel />;
}

const tabs = [
  { id: "reviews", label: "Avaliações" },
  { id: "orders", label: "Pedidos e clientes" },
] as const;

function AdminPanel() {
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("reviews");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster position="top-center" />
      <section className="mx-auto max-w-5xl px-4 py-12">
        <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Área interna</p>
        <h1 className="mb-6 font-display text-4xl">Administração</h1>

        <div className="mb-8 flex gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                tab === t.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "reviews" ? <ReviewsTab /> : <OrdersTab />}
      </section>
    </div>
  );
}

function ReviewsTab() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: () => listPendingReviews(),
  });
  const [busy, setBusy] = useState<string | null>(null);

  const act = async (id: string, status: "approved" | "rejected") => {
    setBusy(id);
    try {
      await moderateReview({ data: { id, status } });
      toast.success(status === "approved" ? "Avaliação aprovada" : "Avaliação reprovada");
      await qc.invalidateQueries({ queryKey: ["admin-reviews"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível atualizar.");
    } finally {
      setBusy(null);
    }
  };

  if (isLoading) return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />;
  if (data.length === 0)
    return <p className="text-sm text-muted-foreground">Nenhuma avaliação pendente no momento.</p>;

  return (
    <div className="space-y-3">
      {data.map((r) => (
        <div key={r.id} className="rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-medium">{r.product_handle}</span>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              {r.rating} <Star className="h-3.5 w-3.5" strokeWidth={1.5} />
            </span>
          </div>
          {r.title && <p className="mt-2 text-sm font-medium">{r.title}</p>}
          {r.body && <p className="mt-1 text-sm text-muted-foreground">{r.body}</p>}
          <p className="mt-2 text-xs text-muted-foreground">
            {r.display_name} · {new Date(r.created_at).toLocaleDateString("pt-BR")}
          </p>
          <div className="mt-4 flex gap-2">
            <Button
              size="sm"
              className="rounded-full"
              disabled={busy === r.id}
              onClick={() => act(r.id, "approved")}
            >
              Aprovar
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="rounded-full"
              disabled={busy === r.id}
              onClick={() => act(r.id, "rejected")}
            >
              Reprovar
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

function OrdersTab() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => listOrdersAdmin(),
  });
  const { data: customers = [] } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: () => listCustomersAdmin(),
  });

  if (isLoading) return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />;

  return (
    <div className="space-y-10">
      <div>
        <h2 className="mb-3 font-display text-2xl">Pedidos ({orders.length})</h2>
        {orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum pedido registrado ainda.</p>
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
                <p className="mt-1 text-xs text-muted-foreground">
                  {o.email} · {new Date(o.created_at).toLocaleDateString("pt-BR")}
                </p>
                <ul className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                  {(o.order_items ?? []).map((i: { product_title: string; quantity: number }, idx: number) => (
                    <li key={idx}>
                      {i.quantity}× {i.product_title}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 font-display text-2xl">Clientes ({customers.length})</h2>
        {customers.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum cliente cadastrado ainda.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">E-mail</th>
                  <th className="px-4 py-3">CPF</th>
                  <th className="px-4 py-3">Cadastro</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="border-t border-border">
                    <td className="px-4 py-3">{c.full_name ?? "Não informado"}</td>
                    <td className="px-4 py-3">{c.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {c.cpf_last3 ? `•••.•••.•••-${c.cpf_last3}` : "Não informado"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(c.created_at).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
