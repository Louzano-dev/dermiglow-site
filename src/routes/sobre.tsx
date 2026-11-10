import { createFileRoute, Link } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { Leaf, Sparkles, ShieldCheck, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import routine from "@/assets/routine.jpg";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre a Dermiglow | Skincare asiático" },
      { name: "description", content: "Conheça a história, a missão e os valores da Dermiglow: skincare eficaz, simples e acessível." },
      { property: "og:title", content: "Sobre a Dermiglow" },
      { property: "og:description", content: "Curadoria premium de skincare asiático: eficaz, simples e transparente." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/sobre" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/sobre" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  const values = [
    { icon: ShieldCheck, title: "Eficácia", desc: "Fórmulas com ativos comprovados e testadas dermatologicamente." },
    { icon: Leaf, title: "Simplicidade", desc: "Rotinas curtas, texturas leves, resultados visíveis." },
    { icon: Sparkles, title: "Referência asiática", desc: "A filosofia do cuidado gentil, diário e constante." },
    { icon: Heart, title: "Acessível", desc: "Qualidade premium sem o preço de luxo." },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster position="top-center" />
      <Header />

      <Reveal><section className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Nossa história</p>
            <h1 className="font-display text-5xl leading-[1.05] md:text-6xl">
              Skincare que respeita sua pele e seu tempo.
            </h1>
            <p className="text-lg text-muted-foreground">
              A Dermiglow nasceu com um propósito claro: tornar o cuidado com a pele simples,
              eficaz e prazeroso. Buscamos inspiração na filosofia asiática de skincare, com a Coreia como
              principal referência, onde o ritual diário é tão importante quanto o resultado, e a traduzimos em produtos
              acessíveis, com fórmulas leves e ingredientes de verdade.
            </p>
            <p className="text-muted-foreground">
              Acreditamos que uma pele saudável não depende de dezenas de passos, mas de
              escolhas consistentes: limpar bem, hidratar com carinho, proteger todos os dias.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild size="lg" className="rounded-full px-8">
                <Link to="/loja">Conhecer produtos</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-8">
                <Link to="/faq">Perguntas frequentes</Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-accent/30 blur-2xl" />
            <img
              src={routine}
              alt="Rotina de skincare Dermiglow"
              className="hover-zoom aspect-[4/5] w-full rounded-[2rem] object-cover shadow-[var(--shadow-soft)]"
            />
          </div>
        </div>
      </section></Reveal>

      <Reveal><section className="bg-secondary/50 py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-12 max-w-2xl">
            <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Nossos valores</p>
            <h2 className="font-display text-4xl md:text-5xl">O que nos guia todo dia.</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-4">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-3xl border border-border bg-card p-6">
                <Icon className="mb-4 h-6 w-6" strokeWidth={1.5} />
                <h3 className="mb-2 font-display text-xl">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section></Reveal>

      <Reveal><section className="mx-auto max-w-3xl px-4 py-20 text-center md:px-8">
        <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Missão</p>
        <h2 className="font-display text-3xl md:text-4xl">
          Ajudar mais pessoas a se reconciliarem com o espelho, um ritual gentil por vez.
        </h2>
      </section></Reveal>

      <Footer />
    </div>
  );
}
