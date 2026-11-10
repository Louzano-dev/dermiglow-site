import { createFileRoute, Link } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { HelpCircle, Truck, ShieldCheck, Mail, Instagram } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/ajuda")({
  head: () => ({
    meta: [
      { title: "Central de Ajuda | Dermiglow" },
      { name: "description", content: "Envio, trocas, privacidade, dúvidas frequentes e canais de contato da Dermiglow." },
      { property: "og:title", content: "Central de Ajuda | Dermiglow" },
      { property: "og:description", content: "Todos os canais e informações para você comprar tranquila." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/ajuda" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/ajuda" }],
  }),
  component: HelpPage,
});

type Card = {
  icon: typeof HelpCircle;
  title: string;
  desc: string;
  to?: "/faq" | "/envio-e-trocas" | "/privacidade";
  href?: string;
};

function HelpPage() {
  const cards: Card[] = [
    { icon: HelpCircle, title: "Perguntas frequentes", desc: "Produtos, pedidos, pagamentos e mais.", to: "/faq" },
    { icon: Truck, title: "Envio e Trocas", desc: "Prazos, custos e política de devolução.", to: "/envio-e-trocas" },
    { icon: ShieldCheck, title: "Política de Privacidade", desc: "Como cuidamos dos seus dados.", to: "/privacidade" },
    { icon: Mail, title: "Fale por e-mail", desc: "dermiglow9@gmail.com", href: "mailto:dermiglow9@gmail.com" },
    { icon: Instagram, title: "Instagram", desc: "@dermiglow_oficial", href: "https://instagram.com/dermiglow_oficial" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster position="top-center" />
      <Header />

      <Reveal><section className="mx-auto max-w-5xl px-4 py-16 md:px-8 md:py-24">
        <div className="mb-12 text-center">
          <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Estamos aqui para ajudar</p>
          <h1 className="font-display text-4xl md:text-5xl">Central de Ajuda</h1>
          <p className="mt-4 text-muted-foreground">
            Escolha um assunto abaixo ou fale direto com o nosso time.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {cards.map(({ icon: Icon, title, desc, to, href }) => {
            const inner = (
              <>
                <Icon className="mb-4 h-6 w-6" strokeWidth={1.5} />
                <h2 className="mb-1 font-display text-xl">{title}</h2>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </>
            );
            const className =
              "block rounded-3xl border border-border bg-card p-6 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]";
            return to ? (
              <Link key={title} to={to} className={className}>{inner}</Link>
            ) : (
              <a key={title} href={href} className={className}>{inner}</a>
            );
          })}
        </div>
      </section></Reveal>

      <Footer />
    </div>
  );
}
