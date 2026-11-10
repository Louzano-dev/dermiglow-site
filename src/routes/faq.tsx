import { createFileRoute, Link } from "@tanstack/react-router";
import { Toaster } from "sonner";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Perguntas Frequentes | Dermiglow" },
      { name: "description", content: "Tire suas dúvidas sobre produtos, pedidos, envio, trocas e pagamentos na Dermiglow." },
      { property: "og:title", content: "Perguntas Frequentes | Dermiglow" },
      { property: "og:description", content: "Tudo sobre produtos, envio, trocas e pagamentos." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/faq" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: groups.flatMap((g) =>
            g.items.map((it) => ({
              "@type": "Question",
              name: it.q,
              acceptedAnswer: { "@type": "Answer", text: it.a },
            })),
          ),
        }),
      },
    ],
  }),
  component: FAQPage,
});

const groups: { title: string; items: { q: string; a: string }[] }[] = [
  {
    title: "Produtos",
    items: [
      { q: "Em quanto tempo vejo resultados?", a: "A maioria das clientes percebe brilho e textura mais lisa entre 7 e 14 dias de uso constante." },
      { q: "A Dermiglow serve para pele sensível?", a: "Sim. Nossas fórmulas são testadas dermatologicamente e temos opções sem fragrância." },
      { q: "Os produtos são cruelty free?", a: "Sim, nenhum produto é testado em animais." },
    ],
  },
  {
    title: "Pedidos e pagamento",
    items: [
      { q: "Quais formas de pagamento vocês aceitam?", a: "O checkout é processado pela Shopify e aceita cartões de crédito, Pix e outras opções liberadas para a sua região." },
      { q: "O checkout é seguro?", a: "Sim. Todo o processo de pagamento é feito em ambiente 100% seguro, protegido por criptografia da Shopify." },
      { q: "Posso alterar ou cancelar meu pedido?", a: "Se o pedido ainda não tiver sido enviado, entre em contato com a gente o quanto antes para tentarmos alterar ou cancelar." },
    ],
  },
  {
    title: "Envio e trocas",
    items: [
      { q: "Para onde vocês enviam?", a: "Enviamos para todo o Brasil. Os prazos e valores variam de acordo com a região e são calculados no checkout." },
      { q: "Como funcionam as trocas?", a: "Entre em contato em até 7 dias após o recebimento para iniciar uma troca ou devolução, conforme o Código de Defesa do Consumidor." },
      { q: "Onde consigo acompanhar meu pedido?", a: "Você recebe o código de rastreio por e-mail assim que o pedido é despachado." },
    ],
  },
];

function FAQPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster position="top-center" />
      <Header />

      <Reveal><section className="mx-auto max-w-3xl px-4 py-16 md:px-8 md:py-24">
        <div className="mb-10 text-center">
          <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Central de dúvidas</p>
          <h1 className="font-display text-4xl md:text-5xl">Perguntas frequentes</h1>
          <p className="mt-4 text-muted-foreground">
            Não encontrou a resposta? Visite a{" "}
            <Link to="/ajuda" className="underline hover:text-foreground">Central de Ajuda</Link>.
          </p>
        </div>

        <div className="space-y-10">
          {groups.map((g) => (
            <div key={g.title}>
              <h2 className="mb-3 font-display text-2xl">{g.title}</h2>
              <Accordion type="single" collapsible className="w-full">
                {g.items.map((it, i) => (
                  <AccordionItem key={i} value={`${g.title}-${i}`} className="border-border">
                    <AccordionTrigger className="text-left font-display text-lg hover:no-underline">
                      {it.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{it.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-3xl border border-border bg-card p-8 text-center">
          <p className="font-display text-2xl">Ainda com dúvidas?</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Nossa central de ajuda reúne todos os canais de atendimento.
          </p>
          <Button asChild size="lg" className="mt-4 rounded-full">
            <Link to="/ajuda">Ir para Central de Ajuda</Link>
          </Button>
        </div>
      </section></Reveal>

      <Footer />
    </div>
  );
}
