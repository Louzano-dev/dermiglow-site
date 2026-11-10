import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/redefinir-senha")({
  head: () => ({
    meta: [
      { title: "Redefinir senha | Dermiglow" },
      { name: "description", content: "Defina uma nova senha para acessar sua conta Dermiglow." },
      { property: "og:title", content: "Redefinir senha | Dermiglow" },
      { property: "og:description", content: "Defina uma nova senha para sua conta Dermiglow." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return toast.error("A senha deve ter ao menos 8 caracteres.");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return toast.error("Não foi possível atualizar a senha. Peça um novo link.");
    toast.success("Senha atualizada");
    navigate({ to: "/conta", replace: true });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster position="top-center" />
      <Header />
      <section className="mx-auto max-w-md px-4 py-16 md:py-24">
        <h1 className="mb-6 font-display text-4xl">Redefinir senha</h1>
        {!ready ? (
          <p className="text-sm text-muted-foreground">
            Abra esta página pelo link enviado ao seu e-mail para definir uma nova senha.
          </p>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <input
              type="password"
              value={password}
              maxLength={72}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nova senha"
              className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm outline-none"
            />
            <Button type="submit" size="lg" className="w-full rounded-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar nova senha"}
            </Button>
          </form>
        )}
      </section>
      <Footer />
    </div>
  );
}
