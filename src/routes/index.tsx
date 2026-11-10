import { createFileRoute, Link } from "@tanstack/react-router";
import { Toaster } from "sonner";
import {
  Sparkles, Loader2, Check, Globe, Award, Search,
  Droplets, Sun, FlaskConical, Leaf, Lock, Headphones, ShieldCheck, Truck,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import hero from "@/assets/hero.jpg";
import routineImg from "@/assets/routine.jpg";
import { useCartSync } from "@/hooks/use-cart-sync";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { AnnouncementBar } from "@/components/site/AnnouncementBar";
import { ProductGrid, activeIngredientTags } from "@/components/site/ProductCard";
import { RoutineBuilder } from "@/components/site/RoutineBuilder";
import { useFeaturedMix } from "@/components/site/recommend";

import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dermiglow | Portfólio de skincare" },
      { name: "description", content: "Curadoria premium de skincare asiático: coreano, japonês e chinês. Séruns, cremes, limpeza e proteção solar selecionados por qualidade e tecnologia." },
      { property: "og:title", content: "Dermiglow | Portfólio de skincare" },
      { property: "og:description", content: "Produtos selecionados da skincare asiática, com foco em qualidade, tecnologia e cuidados reais no dia a dia." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  useCartSync();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster position="top-center" />
      <AnnouncementBar />
      <Header />
      <Hero />
      <Reveal><CouponBanner /></Reveal>
      <Reveal><Featured /></Reveal>
      <Reveal><TrustBlock /></Reveal>
      <Reveal><RoutineBuilder /></Reveal>
      <Reveal><Curation /></Reveal>
      <Reveal><Ingredients /></Reveal>
      <Reveal><Transparency /></Reveal>
      <Reveal><SocialProof /></Reveal>
      <Reveal><FinalCTA /></Reveal>
      <Footer />
    </div>
  );
}

function CouponBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-4 md:px-8 md:pt-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-primary/80 p-6 text-primary-foreground md:p-10">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary-foreground/10 blur-2xl" />
        <div className="relative flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-primary-foreground/15 p-3">
              <Tag className="h-6 w-6" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="font-display text-xl md:text-2xl">Uma experiência de skincare, em demonstração</h2>
              <p className="mt-1 text-sm opacity-90">
                Produtos, imagens e preços ilustrativos. Este site não realiza vendas.
              </p>
            </div>
          </div>
          <Button asChild variant="secondary" className="rounded-full px-6">
            <Link to="/loja">Explorar catálogo</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-10 pt-8 md:grid-cols-2 md:items-center md:gap-16 md:px-8 md:pb-16 md:pt-14">
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
            Curadoria de skincare asiático
          </p>
          <h1 className="font-display text-[2.5rem] leading-[1.05] sm:text-5xl md:text-6xl lg:text-7xl">
            Cuidados avançados para uma pele saudável e equilibrada
          </h1>
          <p className="max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
            Produtos selecionados da skincare asiática, coreana, japonesa e chinesa, com foco em
            qualidade, tecnologia e resultados reais no dia a dia.
          </p>
          <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:flex-wrap">
            <Button asChild size="lg" className="rounded-full px-9 text-base shadow-[var(--shadow-card)]">
              <a href="#monte-sua-rotina">Ver rotina ideal</a>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full border-primary/20 px-9">
              <Link to="/loja">Explorar produtos</Link>
            </Button>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-accent/25 blur-2xl" />
          <img
            src={hero}
            alt="Rotina de skincare asiático selecionada pela Dermiglow"
            width={1600}
            height={1200}
            className="hover-zoom aspect-[4/5] w-full rounded-[2rem] object-cover shadow-[var(--shadow-soft)]"
          />
        </div>
      </div>
    </section>
  );
}

function TrustBlock() {
  const items = [
    { icon: Search, t: "Produtos selecionados" },
    { icon: Globe, t: "Qualidade internacional" },
    { icon: Truck, t: "Envio rastreado" },
    { icon: Lock, t: "Compra segura" },
  ];
  return (
    <section className="border-y border-border bg-secondary/40">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-9 md:grid-cols-4 md:px-8 md:py-12">
        {items.map(({ icon: Icon, t }) => (
          <div key={t} className="flex items-center gap-3">
            <Icon className="h-5 w-5 shrink-0" strokeWidth={1.5} />
            <span className="text-sm leading-snug">{t}</span>
          </div>
        ))}
      </div>
    </section>
  );
}


function Featured() {
  const { items: products, isLoading, error } = useFeaturedMix(8);

  return (
    <section className="py-16 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">Seleção</p>
            <h2 className="font-display text-3xl leading-tight sm:text-4xl md:text-5xl">
              Produtos em destaque
            </h2>
          </div>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/loja">Ver todos</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Não foi possível carregar os produtos agora.
          </p>
        ) : products.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card p-10 text-center">
            <p className="font-display text-2xl">Nenhum produto encontrado</p>
          </div>
        ) : (
          <ProductGrid products={products} tags={activeIngredientTags(products)} />
        )}
      </div>
    </section>
  );
}

function Curation() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-28">
      <div className="grid items-center gap-10 md:grid-cols-2 md:gap-20">
        <img
          src={routineImg}
          alt="Rotina de cuidados com a pele"
          loading="lazy"
          className="hover-zoom aspect-[4/3] w-full rounded-[2rem] object-cover shadow-[var(--shadow-soft)]"
        />
        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Nossa curadoria
          </p>
          <h2 className="font-display text-3xl leading-tight sm:text-4xl md:text-5xl">
            Uma seleção, não uma marca
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            Trabalhamos com produtos importados de diferentes fabricantes asiáticos, com a skincare
            coreana como principal referência. Antes de listar um item, avaliamos fórmula, ativos,
            reputação do fabricante e adequação ao uso diário.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              { icon: Search, t: "Seleção criteriosa", d: "Avaliamos fórmula, ativos e reputação antes de listar." },
              { icon: FlaskConical, t: "Ativos reconhecidos", d: "Ingredientes amplamente estudados no skincare." },
              { icon: Globe, t: "Referência asiática", d: "Coreia, Japão e China como origem da curadoria." },
              { icon: Leaf, t: "Uso diário", d: "Texturas leves para rotinas simples e constantes." },
            ].map(({ icon: Icon, t, d }) => (
              <div key={t} className="rounded-2xl border border-border bg-card p-5">
                <Icon className="mb-3 h-5 w-5" strokeWidth={1.5} />
                <div className="text-sm font-medium">{t}</div>
                <div className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Ingredients() {
  const list = [
    { icon: Droplets, t: "Ácido Hialurônico", d: "Hidratação e efeito plump." },
    { icon: Sparkles, t: "Niacinamida", d: "Uniformização e controle de oleosidade." },
    { icon: Sun, t: "Vitamina C", d: "Ação antioxidante e luminosidade." },
    { icon: Leaf, t: "Centella Asiatica", d: "Conforto para peles sensibilizadas." },
  ];
  return (
    <section className="bg-accent/20 py-16 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">Ativos</p>
        <h2 className="mb-10 font-display text-3xl leading-tight sm:text-4xl md:text-5xl">
          Ingredientes que você reconhece
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {list.map(({ icon: Icon, t, d }) => (
            <div key={t} className="rounded-3xl border border-border bg-background p-6">
              <Icon className="mb-4 h-6 w-6" strokeWidth={1.5} />
              <div className="font-display text-lg md:text-xl">{t}</div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Transparency() {
  const items = [
    {
      icon: Award,
      t: "Como selecionamos",
      d: "Analisamos ativos, fórmula e reputação do fabricante antes de incluir um produto no catálogo.",
    },
    {
      icon: Globe,
      t: "Origem internacional",
      d: "Os produtos vêm de diferentes fabricantes asiáticos, por isso a embalagem pode variar conforme o fornecedor.",
    },
    {
      icon: Truck,
      t: "Prazos e acompanhamento",
      d: "O prazo é variável por envolver logística internacional. Você recebe o acompanhamento do pedido por e-mail.",
    },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
      <p className="mb-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">Transparência</p>
      <h2 className="mb-10 font-display text-3xl leading-tight sm:text-4xl md:text-5xl">
        Clareza em cada etapa
      </h2>
      <div className="grid gap-4 md:grid-cols-3 md:gap-6">
        {items.map(({ icon: Icon, t, d }) => (
          <div key={t} className="rounded-3xl border border-border bg-card p-6 md:p-8">
            <Icon className="mb-4 h-5 w-5" strokeWidth={1.5} />
            <div className="font-display text-lg md:text-xl">{t}</div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SocialProof() {
  return (
    <section className="bg-secondary/30 py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-4 md:px-8">
        <p className="mb-3 text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Confiança
        </p>
        <h2 className="mb-8 text-center font-display text-3xl leading-tight sm:text-4xl">
          Compra segura do início ao fim
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

          {[
            { icon: Lock, t: "Compra segura" },
            { icon: ShieldCheck, t: "Pagamento protegido" },
            { icon: Headphones, t: "Atendimento por e-mail" },
          ].map(({ icon: Icon, t }) => (
            <div key={t} className="flex items-center justify-center gap-2 rounded-2xl bg-background p-4 text-sm">
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} /> {t}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 pt-4 md:px-8 md:pb-28">
      <div className="rounded-[2rem] bg-primary p-10 text-center text-primary-foreground md:p-16">
        <h2 className="font-display text-3xl leading-tight sm:text-4xl md:text-5xl">
          Comece pela rotina certa
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-sm opacity-90 md:text-base">
          Monte um kit de três passos com produtos da nossa curadoria asiática ou explore o catálogo
          completo.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" variant="secondary" className="rounded-full px-10 text-base">
            <a href="#monte-sua-rotina">Monte sua rotina</a>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-full border-primary-foreground/30 bg-transparent px-10 text-base text-primary-foreground hover:bg-primary-foreground/10"
          >
            <Link to="/loja">Ver todos os produtos</Link>
          </Button>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs opacity-80">
          <span className="flex items-center gap-1.5"><Check className="h-4 w-4" /> Produtos selecionados</span>
          <span className="flex items-center gap-1.5"><Check className="h-4 w-4" /> Envio rastreado</span>
          <span className="flex items-center gap-1.5"><Check className="h-4 w-4" /> Checkout protegido</span>
        </div>
      </div>
    </section>
  );
}
