import { createFileRoute, Link } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade | Dermiglow" },
      { name: "description", content: "Como a Dermiglow coleta, usa e protege seus dados pessoais, em conformidade com a LGPD." },
      { property: "og:title", content: "Política de Privacidade | Dermiglow" },
      { property: "og:description", content: "Como cuidamos dos seus dados, em conformidade com a LGPD." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/privacidade" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/privacidade" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster position="top-center" />
      <Header />

      <section className="mx-auto max-w-3xl px-4 py-16 md:px-8 md:py-24">
        <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Seus dados, seu controle</p>
        <h1 className="font-display text-4xl md:text-5xl">Política de Privacidade</h1>
        <p className="mt-4 text-muted-foreground">
          Última atualização: {new Date().toLocaleDateString("pt-BR")}
        </p>

        <div className="mt-10 space-y-10 text-[15px] leading-relaxed text-muted-foreground">
          <div>
            <h2 className="mb-3 font-display text-2xl text-foreground">1. Quem somos</h2>
            <p>
              A Dermiglow é uma marca de skincare que respeita a sua privacidade e está
              comprometida com a proteção dos seus dados pessoais, em conformidade com a
              Lei Geral de Proteção de Dados (Lei nº 13.709/2018, a LGPD).
            </p>
          </div>

          <div>
            <h2 className="mb-3 font-display text-2xl text-foreground">2. Quais dados coletamos</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li><strong className="text-foreground">Cadastro e pedido:</strong> nome, e-mail, telefone, CPF, endereço de entrega e cobrança.</li>
              <li><strong className="text-foreground">Pagamento:</strong> processado pela Shopify e pelos meios de pagamento parceiros. Não armazenamos dados de cartão em nossos servidores.</li>
              <li><strong className="text-foreground">Navegação:</strong> cookies, endereço IP, tipo de dispositivo, páginas visitadas e origem do acesso.</li>
            </ul>
          </div>

          <div>
            <h2 className="mb-3 font-display text-2xl text-foreground">3. Como usamos seus dados</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>Processar pedidos, pagamentos, envios e devoluções.</li>
              <li>Fornecer atendimento e suporte.</li>
              <li>Enviar comunicações transacionais e, com seu consentimento, comunicações de marketing.</li>
              <li>Melhorar o site, os produtos e a experiência de compra.</li>
              <li>Cumprir obrigações legais e regulatórias.</li>
            </ul>
          </div>

          <div>
            <h2 className="mb-3 font-display text-2xl text-foreground">4. Compartilhamento</h2>
            <p>
              Compartilhamos apenas o necessário com parceiros que viabilizam a operação
              da loja: plataforma de e-commerce (Shopify), meios de pagamento,
              transportadoras, ferramentas de análise e comunicação. Não vendemos
              seus dados pessoais.
            </p>
          </div>

          <div>
            <h2 className="mb-3 font-display text-2xl text-foreground">5. Cookies</h2>
            <p>
              Utilizamos cookies próprios e de terceiros para lembrar preferências,
              manter o carrinho, medir o desempenho do site e personalizar comunicações.
              Você pode gerenciar cookies nas configurações do seu navegador.
            </p>
          </div>

          <div>
            <h2 className="mb-3 font-display text-2xl text-foreground">6. Seus direitos</h2>
            <p>
              Como titular, você pode a qualquer momento solicitar:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Confirmação da existência de tratamento;</li>
              <li>Acesso, correção ou atualização dos seus dados;</li>
              <li>Anonimização, bloqueio ou eliminação de dados desnecessários;</li>
              <li>Portabilidade;</li>
              <li>Revogação do consentimento para envio de comunicações.</li>
            </ul>
          </div>

          <div>
            <h2 className="mb-3 font-display text-2xl text-foreground">7. Segurança</h2>
            <p>
              Adotamos medidas técnicas e organizacionais razoáveis para proteger seus
              dados contra acesso não autorizado, perda ou alteração. Ainda assim, nenhum
              sistema é 100% seguro. Em caso de incidente, comunicaremos você e a
              autoridade competente conforme exigido pela LGPD.
            </p>
          </div>

          <div>
            <h2 className="mb-3 font-display text-2xl text-foreground">8. Contato</h2>
            <p>
              Para exercer seus direitos ou tirar dúvidas sobre esta política, escreva
              para{" "}
              <a href="mailto:dermiglow9@gmail.com" className="underline hover:text-foreground">
                dermiglow9@gmail.com
              </a>{" "}
              ou visite a{" "}
              <Link to="/ajuda" className="underline hover:text-foreground">Central de Ajuda</Link>.
            </p>
          </div>

          <p className="text-xs">
            Esta política pode ser atualizada periodicamente. Recomendamos consultá-la
            regularmente.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
