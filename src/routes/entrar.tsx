import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Toaster } from "sonner";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { AuthForm } from "@/components/site/AuthDialog";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/entrar")({
  head: () => ({
    meta: [
      { title: "Entrar ou criar conta | Dermiglow" },
      { name: "description", content: "Acesse sua conta Dermiglow para acompanhar pedidos, salvar o carrinho e avaliar produtos." },
      { property: "og:title", content: "Entrar ou criar conta | Dermiglow" },
      { property: "og:description", content: "Sua conta guarda pedidos, carrinho salvo e avaliações verificadas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate({ to: "/conta", replace: true });
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster position="top-center" />
      <Header />
      <section className="mx-auto max-w-md px-4 py-16 md:py-24">
        <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Sua conta</p>
        <h1 className="mb-6 font-display text-4xl">Entrar ou criar conta</h1>
        <AuthForm onDone={() => navigate({ to: "/conta" })} />
      </section>
      <Footer />
    </div>
  );
}
