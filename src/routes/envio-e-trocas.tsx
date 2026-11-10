import { createFileRoute, Link } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/envio-e-trocas")({
  head: () => ({
    meta: [
      { title: "Envio e Trocas | Dermiglow" },
      { name: "description", content: "Prazos de envio, custos, política de trocas e devoluções da Dermiglow." },
      { property: "og:title", content: "Envio e Trocas | Dermiglow" },
      { property: "og:description", content: "Prazos, custos e política de trocas e devoluções." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/envio-e-trocas" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/envio-e-trocas" }],
  }),
  component: ShippingPage,
});

function ShippingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster position="top-center" />
      <Header />

      <Reveal><section className="mx-auto max-w-3xl px-4 py-16 md:px-8 md:py-24">
        <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Informações importantes</p>
        <h1 className="font-display text-4xl md:text-5xl">Envio e Trocas</h1>
        <p className="mt-4 text-muted-foreground">
          Última atualização: {new Date().toLocaleDateString("pt-BR")}
        </p>

        <div className="mt-10 space-y-10 text-[15px] leading-relaxed text-muted-foreground">
          <div>
            <h2 className="mb-3 font-display text-2xl text-foreground">Prazos e frete</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                <strong className="text-foreground">Frete grátis</strong> em todos os produtos, para
                todo o Brasil, sem valor mínimo de compra.
              </li>
              <li>
                <strong className="text-foreground">Itens nacionais:</strong> entrega estimada em 5 a
                10 dias úteis.
              </li>
              <li>
                <strong className="text-foreground">Itens importados:</strong> entrega estimada em 12
                a 25 dias úteis por envolver logística internacional.
              </li>
              <li>Postagem em até 2 dias úteis após a confirmação do pagamento.</li>
              <li>O código de rastreio é enviado por e-mail assim que o pedido é despachado.</li>
              <li>
                Prazos são estimativas em dias úteis e podem variar em datas comemorativas,
                triagem alfandegária e regiões remotas.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="mb-3 font-display text-2xl text-foreground">Conferência no recebimento</h2>
            <p>
              Recomendamos gravar um vídeo contínuo e sem cortes da abertura da encomenda, mostrando
              a embalagem fechada, a etiqueta de envio e o conteúdo. Esse registro é o que permite
              tratar rapidamente casos de avaria de transporte, item incorreto ou item faltante.
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                Avarias, itens incorretos ou faltantes devem ser comunicados em até
                <strong className="text-foreground"> 72 horas</strong> a partir da entrega registrada
                pela transportadora.
              </li>
              <li>
                A solicitação precisa incluir número do pedido, fotos da embalagem e da etiqueta e
                o vídeo de abertura sem cortes.
              </li>
              <li>
                Sem esses registros, a análise depende exclusivamente da resposta da transportadora,
                o que pode aumentar o prazo de solução.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="mb-3 font-display text-2xl text-foreground">Arrependimento (7 dias)</h2>
            <p>
              Conforme o art. 49 do Código de Defesa do Consumidor, você pode desistir da compra em
              até <strong className="text-foreground">7 dias corridos</strong> contados do
              recebimento, sem necessidade de justificativa.
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                Por se tratar de cosméticos, o produto deve retornar
                <strong className="text-foreground"> lacrado, sem uso e com o selo de segurança
                intacto</strong>, na embalagem original e com todos os acessórios e brindes.
              </li>
              <li>
                Produtos abertos, usados, testados, violados ou sem lacre não podem ser revendidos e,
                por questões sanitárias, não são aceitos em devolução por arrependimento.
              </li>
              <li>
                A solicitação deve ser feita por e-mail, a partir do mesmo endereço usado na compra,
                informando o número do pedido.
              </li>
              <li>
                Após a aprovação, enviamos as instruções de postagem. A devolução só é considerada
                iniciada quando o item é efetivamente postado no prazo informado.
              </li>
              <li>
                O reembolso é processado em até 10 dias úteis após o recebimento e a conferência do
                item em nosso centro de triagem, pelo mesmo meio de pagamento utilizado.
              </li>
              <li>
                Itens que chegarem em desacordo com as condições acima são devolvidos ao endereço do
                cliente, com o custo do reenvio por conta do solicitante.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="mb-3 font-display text-2xl text-foreground">Produto com defeito</h2>
            <p>
              Para vícios do produto, o prazo legal é de 30 dias corridos a partir do recebimento.
              Solicitamos fotos e vídeo do problema, do lote e do rótulo. O caso é analisado
              tecnicamente e, confirmado o defeito, realizamos troca, reparo ou reembolso conforme a
              legislação vigente e a sua escolha, nos termos do art. 18 do CDC.
            </p>
            <p className="mt-3">
              Reações individuais de pele, preferência de textura, aroma ou expectativa de resultado
              não caracterizam defeito do produto.
            </p>
          </div>

          <div>
            <h2 className="mb-3 font-display text-2xl text-foreground">Endereço e tentativas de entrega</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                O endereço é de responsabilidade do cliente. Pedidos devolvidos por endereço
                incorreto, incompleto ou ausência no recebimento podem ser reenviados mediante novo
                pagamento de frete.
              </li>
              <li>
                Encomendas não retiradas na agência dentro do prazo da transportadora retornam
                automaticamente e seguem a mesma regra de reenvio.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="mb-3 font-display text-2xl text-foreground">Análise antifraude</h2>
            <p>
              Todos os pedidos e solicitações de devolução passam por verificação de dados, histórico
              e registros de entrega. Reservamo-nos o direito de recusar solicitações com indícios de
              má-fé, informações divergentes ou uso indevido da política, e de cancelar pedidos com
              suspeita de fraude, com reembolso integral do valor pago.
            </p>
          </div>

          <div>
            <h2 className="mb-3 font-display text-2xl text-foreground">Fale com a gente</h2>
            <p>
              Para iniciar uma troca ou tirar dúvidas, visite a{" "}
              <Link to="/ajuda" className="underline hover:text-foreground">Central de Ajuda</Link>{" "}
              ou envie um e-mail para{" "}
              <a href="mailto:dermiglow9@gmail.com" className="underline hover:text-foreground">
                dermiglow9@gmail.com
              </a>
              , sempre com o número do pedido.
            </p>
          </div>

          <p className="text-xs">
            Esta política respeita integralmente o Código de Defesa do Consumidor e pode ser
            atualizada a qualquer momento. Recomendamos a leitura periódica.
          </p>
        </div>

      </section></Reveal>

      <Footer />
    </div>
  );
}
