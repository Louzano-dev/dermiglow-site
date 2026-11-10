import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useState } from "react";
import { RecentlyViewed, useTrackRecentlyViewed } from "@/components/site/RecentlyViewed";
import { ImageLightbox } from "@/components/site/ImageLightbox";
import { Toaster, toast } from "sonner";
import {
  Loader2, ShoppingBag, ChevronRight, Check, ShieldCheck, Truck, Lock,
  Star, Sparkles, Droplets, Sun, Leaf, Plane, Headphones, CreditCard,
  Clock, ZoomIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { AnnouncementBar } from "@/components/site/AnnouncementBar";
import { UpsellRow } from "@/components/site/UpsellRow";
import { ProductReviews } from "@/components/site/Reviews";
import { ShippingEstimator } from "@/components/site/ShippingEstimator";
import { isNationalProduct, hidesImportedBadge } from "@/lib/shipping";
import { shortTitle, mainBenefit } from "@/components/site/ProductCard";
import {
  PRODUCT_BY_HANDLE_QUERY,
  storefrontApiRequest,
  type ShopifyProductDetail,
} from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { useCartSync } from "@/hooks/use-cart-sync";
import { formatPrice } from "@/components/site/format";

async function fetchProduct(handle: string): Promise<ShopifyProductDetail | null> {
  const data = await storefrontApiRequest(PRODUCT_BY_HANDLE_QUERY, { handle });
  return data?.data?.product ?? null;
}

const productQueryOptions = (handle: string) => queryOptions({
  queryKey: ["shopify-product", handle],
  queryFn: () => fetchProduct(handle),
});

export const Route = createFileRoute("/produto/$handle")({
  loader: ({ params, context }) => context.queryClient.ensureQueryData(productQueryOptions(params.handle)),
  head: ({ loaderData }) => {
    const product = loaderData as ShopifyProductDetail | null;
    const title = product ? shortTitle(product.title) : "Produto";
    const description = product
      ? mainBenefit(product.title, product.description) || "Skincare asiático selecionado pela qualidade, com a Coreia como principal referência."
      : "Skincare asiático selecionado pela qualidade, com a Coreia como principal referência.";
    const image = product?.images?.edges?.[0]?.node?.url;
    const meta = [
      { title: `${title} | Dermiglow` },
      { name: "description", content: description },
      { property: "og:title", content: `${title} | Dermiglow` },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      ...(image?.startsWith("https://") ? [
        { property: "og:image" as const, content: image },
        { name: "twitter:image" as const, content: image },
      ] : []),
    ];
    return { meta };
  },
  component: ProductPage,
});

function ProductPage() {
  useCartSync();
  const { handle } = Route.useParams();
  const { data: product, isLoading, error } = useSuspenseQuery(productQueryOptions(handle));

  if (!isLoading && !error && !product) throw notFound();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster position="top-center" />
      <AnnouncementBar />
      <Header />
      {isLoading ? (
        <div className="flex justify-center py-32"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : error ? (
        <div className="mx-auto max-w-3xl px-4 py-24 text-center">
          <p className="text-sm text-muted-foreground">Não foi possível carregar o produto.</p>
        </div>
      ) : product ? (
        <ProductDetail product={product} />
      ) : null}
      <Footer />
    </div>
  );
}

function ProductDetail({ product }: { product: ShopifyProductDetail }) {
  const images = product.images.edges;
  const [imgIdx, setImgIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [variantIdx, setVariantIdx] = useState(0);
  useTrackRecentlyViewed(product.handle);
  const variant = product.variants.edges[variantIdx]?.node;
  const addItem = useCartStore((s) => s.addItem);
  const cartLoading = useCartStore((s) => s.isLoading);
  const name = shortTitle(product.title);
  const benefit = mainBenefit(product.title, product.description);
  const priceForRules = variant?.price.amount ?? product.priceRange.minVariantPrice.amount;
  /** Frete nacional apenas para as linhas nacionais */
  const isNational = isNationalProduct({
    title: product.title,
    description: product.description,
    price: priceForRules,
  });
  /** Comunicação de "importado" oculta em nacionais e em produtos até R$ 50 */
  const showImported = !hidesImportedBadge({
    title: product.title,
    description: product.description,
    price: priceForRules,
  });



  const text = `${product.title} ${product.description ?? ""}`.toLowerCase();
  const has = (...w: string[]) => w.some((x) => text.includes(x));
  const solves = [
    has("acne", "espinha", "salicíl", "cica") && "Acne e imperfeições",
    has("oleos", "sebo", "matte", "poro") && "Oleosidade e poros visíveis",
    has("mancha", "clare", "vitamina c", "niacinamida", "tom") && "Manchas e tom desigual",
    has("anti-idade", "rugas", "linhas", "firmeza", "colágeno", "retinol") && "Linhas finas e firmeza",
    has("hidrat", "hialurôn", "seca", "barreira") && "Falta de hidratação",
  ].filter(Boolean) as string[];
  if (solves.length === 0) solves.push("Cuidado diário e manutenção da pele");
  const audience = has("sensív", "cica", "centella")
    ? "Indicado para peles sensibilizadas que precisam de conforto no uso diário."
    : has("oleos", "acne")
      ? "Indicado para peles oleosas ou com tendência a acne e poros visíveis."
      : has("seca", "hidrat")
        ? "Indicado para peles secas ou desidratadas que precisam de mais conforto."
        : "Indicado para uso diário em diferentes tipos de pele, dentro de uma rotina constante.";

  const handleAdd = async () => {
    if (!variant) return;
    await addItem({
      product: { node: product },
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });
    toast.success("Adicionado à sacola", { description: name });
  };

  const buyNow = async () => {
    await handleAdd();
    toast.info("Produto demonstrativo", { description: "Este portfólio não realiza vendas ou pagamentos. O item foi adicionado à sacola de demonstração." });
  };

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 py-8 pb-28 md:px-8 md:py-16 md:pb-16">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Início</Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <Link to="/loja" className="hover:text-foreground">Loja</Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <span className="text-foreground">{name}</span>
        </nav>

        <div className="grid gap-10 md:grid-cols-2 md:gap-16">
          {/* Galeria */}
          <div className="min-w-0 space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-secondary shadow-[var(--shadow-soft)]">
              {images[imgIdx] ? (
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  aria-label="Ampliar imagem do produto"
                  className="group block h-full w-full cursor-zoom-in"
                >
                  <img
                    src={images[imgIdx].node.url}
                    alt={images[imgIdx].node.altText ?? name}
                    className="hover-zoom h-full w-full object-contain p-4 md:p-8"
                  />
                  <span className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1 text-[10px] uppercase tracking-widest shadow-sm backdrop-blur">
                    <ZoomIn className="h-3 w-3" /> Clique para ampliar
                  </span>
                </button>
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <ShoppingBag className="h-10 w-10" />
                </div>
              )}
              {showImported && (
                <span className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-background/90 px-3 py-1 text-[10px] uppercase tracking-widest shadow-sm backdrop-blur">
                  <Plane className="h-3 w-3" /> Importado
                </span>
              )}

            </div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    aria-label={`Ver imagem ${i + 1} de ${images.length}`}
                    aria-current={i === imgIdx}
                    className={`press aspect-square h-20 flex-shrink-0 overflow-hidden rounded-xl border-2 ${i === imgIdx ? "border-primary" : "border-transparent"}`}
                  >
                    <img src={img.node.url} alt="" className="hover-zoom h-full w-full bg-secondary object-contain p-1" />
                  </button>
                ))}
              </div>
            )}
            <ImageLightbox
              images={images.map((im) => ({ url: im.node.url, altText: im.node.altText ?? name }))}
              index={imgIdx}
              onIndexChange={setImgIdx}
              open={lightboxOpen}
              onClose={() => setLightboxOpen(false)}
            />
          </div>

          {/* Informações */}
          <div className="min-w-0 space-y-6">
            <div>
              <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Produto demonstrativo • Sem venda real</p>
              <h1 className="font-display text-3xl leading-tight sm:text-4xl md:text-5xl">{name}</h1>
              {benefit && <p className="mt-3 text-sm text-muted-foreground md:text-base">{benefit}</p>}
              {variant && (
                <div className="mt-4 flex flex-wrap items-baseline gap-3">
                  <div className="text-3xl font-medium">
                    {formatPrice(variant.price.amount, variant.price.currencyCode)}
                  </div>
                  <div className="flex flex-col text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <CreditCard className="h-3 w-3" />
                      Em até 6x de {formatPrice(String((parseFloat(variant.price.amount) / 6).toFixed(2)), variant.price.currencyCode)} sem juros
                    </span>
                    <span className="inline-flex items-center gap-1 text-primary">
                      <Clock className="h-3 w-3" /> Entrega estimada: {isNational ? "5 a 10 dias úteis" : "12 a 25 dias úteis"}
                    </span>
                  </div>
                </div>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-primary-foreground">
                  <Truck className="h-3 w-3" /> Frete grátis
                </span>
                {variant?.availableForSale && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                    <Check className="h-3 w-3 text-green-500" /> Demonstrativo
                  </span>
                )}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                {showImported
                  ? "Produto importado • Selecionado pela qualidade • Curadoria de skincare asiático"
                  : "Selecionado pela qualidade • Curadoria de skincare asiático"}
              </p>

            </div>

            {product.variants.edges.length > 1 && (
              <div>
                <div className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Opção</div>
                <div className="flex flex-wrap gap-2">
                  {product.variants.edges.map((v, i) => (
                    <button
                      key={v.node.id}
                      onClick={() => setVariantIdx(i)}
                      disabled={!v.node.availableForSale}
                      className={`press rounded-full border px-4 py-2 text-sm ${
                        i === variantIdx
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary/40"
                      } ${!v.node.availableForSale ? "opacity-50" : ""}`}
                    >
                      {v.node.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                className="rounded-full text-base shadow-[var(--shadow-card)] sm:flex-1"
                onClick={buyNow}
                disabled={!variant?.availableForSale || cartLoading}
              >
                {variant?.availableForSale ? "Simular compra →" : "Esgotado"}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full"
                onClick={handleAdd}
                disabled={!variant?.availableForSale || cartLoading}
              >
                Adicionar à sacola
              </Button>
            </div>

            {/* Frete */}
            <ShippingEstimator national={isNational} />

            {/* Upsell */}
            <UpsellRow
              excludeHandle={product.handle}
              basedOn={`${product.title} ${product.description ?? ""}`}
            />


            {/* Benefícios */}
            <div className="space-y-2 rounded-2xl border border-border bg-card p-5">
              <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Benefícios</p>
              {["Hidratação profunda", "Textura leve", "Absorção rápida", "Indicado para uso diário"].map((b) => (
                <div key={b} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{b}</span>
                </div>
              ))}
            </div>

            {/* Garantia */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-2xl bg-primary p-4 text-primary-foreground">
                <Lock className="h-6 w-6 shrink-0" strokeWidth={1.5} />
                <div>
                  <div className="text-sm font-medium">Compra segura</div>
                  <div className="text-xs opacity-80">Portfólio demonstrativo, sem pagamentos.</div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
                <Headphones className="h-6 w-6 shrink-0" strokeWidth={1.5} />
                <div>
                  <div className="text-sm font-medium">Suporte ao cliente</div>
                  <div className="text-xs text-muted-foreground">Acompanhamento do pedido do início ao fim.</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-border pt-6 text-xs">
              {showImported ? (
                <Trust icon={Plane} label="Produto importado" />
              ) : (
                <Trust icon={Check} label="Curadoria Dermiglow" />
              )}

              <Trust icon={Truck} label="Envio para todo o Brasil" />
              <Trust icon={ShieldCheck} label="Pagamento protegido" />
              <Trust icon={Check} label="Seleção baseada em qualidade" />
            </div>
          </div>
        </div>

        {/* Conteúdo detalhado */}
        <div className="mx-auto mt-14 max-w-3xl space-y-10 md:mt-20">
          <div className="rounded-[2rem] border border-border bg-accent/20 p-6 md:p-10">
            <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Descrição</p>
            <h2 className="mb-4 font-display text-2xl md:text-3xl">Inspirado nas rotinas asiáticas</h2>
            <p className="text-sm text-muted-foreground">
              Selecionado dentro da nossa curadoria de skincare{showImported ? " importado" : ""}, este produto
              acompanha as tendências das rotinas asiáticas, com a Coreia como principal referência: texturas leves, camadas finas e ativos reconhecidos que
              trabalham a hidratação, a uniformidade e o conforto da pele no uso contínuo.
            </p>

          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-display text-xl">Para quem é</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{audience}</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-display text-xl">O que resolve</h3>
              <ul className="mt-2 space-y-1.5">
                {solves.map((s) => (
                  <li key={s} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {product.descriptionHtml && (
            <div>
              <h2 className="mb-4 font-display text-2xl md:text-3xl">Detalhes do produto</h2>
              <div
                className="product-description max-w-none"
                dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
              />
            </div>
          )}

          <div>
            <h2 className="mb-4 font-display text-2xl md:text-3xl">Ingredientes reconhecidos</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: Droplets, t: "Ácido Hialurônico", d: "Hidratação e efeito plump." },
                { icon: Sparkles, t: "Niacinamida", d: "Uniformização do tom da pele." },
                { icon: Sun, t: "Vitamina C", d: "Ação antioxidante e luminosidade." },
                { icon: Leaf, t: "Centella Asiatica", d: "Conforto para peles sensibilizadas." },
              ].map(({ icon: Icon, t, d }) => (
                <div key={t} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.5} />
                  <div>
                    <div className="text-sm font-medium">{t}</div>
                    <div className="text-xs text-muted-foreground">{d}</div>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              A composição exata varia conforme o produto. Confira sempre o rótulo do item recebido.
            </p>
          </div>

          <div>
            <h2 className="mb-4 font-display text-2xl md:text-3xl">Como usar</h2>
            <ol className="space-y-3">
              {[
                "Aplique sobre a pele limpa, de manhã e/ou à noite.",
                "Use uma pequena quantidade, massageando suavemente até absorver.",
                "Finalize com hidratante e, durante o dia, protetor solar.",
              ].map((step, i) => (
                <li key={i} className="flex gap-4 rounded-2xl border border-border bg-card p-4">
                  <span className="font-display text-2xl text-muted-foreground">0{i + 1}</span>
                  <span className="pt-1 text-sm">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-dashed border-border bg-card p-5">
              <p className="mb-1 text-xs uppercase tracking-widest text-muted-foreground">Transparência</p>
              <p className="text-sm">
                {showImported
                  ? "Produto importado. A embalagem pode variar conforme o fornecedor."
                  : "A embalagem pode variar conforme o fornecedor responsável pelo envio."}
              </p>
            </div>

            <div className="rounded-2xl border border-dashed border-border bg-card p-5">
              <p className="mb-1 text-xs uppercase tracking-widest text-muted-foreground">Entrega</p>
              <p className="text-sm">
                O prazo é variável por se tratar de logística internacional. Você acompanha o status do
                pedido por e-mail após a compra.
              </p>
            </div>
          </div>

          <div>
            <h2 className="mb-4 font-display text-2xl md:text-3xl">Perguntas frequentes</h2>
            <Accordion type="single" collapsible>
              {[
                ...(showImported
                  ? [{ q: "O produto é importado?", a: "Sim. Trabalhamos com uma curadoria de produtos importados de diferentes fabricantes, e a embalagem pode variar conforme o fornecedor responsável pelo envio." }]
                  : []),

                { q: "Qual é o prazo de entrega?", a: "O prazo é variável por envolver logística internacional. Assim que o pedido é despachado, você recebe as informações de acompanhamento por e-mail." },
                { q: "Serve para pele sensível?", a: "Recomendamos sempre testar em uma pequena área antes do primeiro uso e conferir a lista de ingredientes no rótulo do produto recebido." },
                { q: "O pagamento é seguro?", a: "Não há pagamentos neste portfólio. Todos os produtos e valores são demonstrativos." },
              ].map((it, i) => (
                <AccordionItem key={i} value={`p-${i}`}>
                  <AccordionTrigger className="text-left font-display text-lg hover:no-underline">{it.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{it.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>




          <div className="rounded-[2rem] bg-accent/40 p-6 text-center md:p-12">
            <h2 className="font-display text-2xl md:text-3xl">Pronta para começar?</h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
              Compra segura, suporte ao cliente e curadoria de skincare asiático.
            </p>
            <Button
              size="lg"
              className="mt-6 rounded-full px-10 text-base shadow-[var(--shadow-card)]"
              onClick={buyNow}
              disabled={!variant?.availableForSale || cartLoading}
            >
              Simular compra →
            </Button>
          </div>
        </div>
      </section>

      {/* CTA fixo no mobile */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 p-3 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.15)] backdrop-blur md:hidden">
        <div className="flex items-center gap-3">
          {variant && (
            <div className="min-w-0">
              <div className="truncate text-xs text-muted-foreground">{name}</div>
              <div className="text-sm font-medium">
                {formatPrice(variant.price.amount, variant.price.currencyCode)}
              </div>
            </div>
          )}
          <Button
            className="ml-auto shrink-0 rounded-full px-6"
            onClick={buyNow}
            disabled={!variant?.availableForSale || cartLoading}
          >
            {variant?.availableForSale ? "Simular" : "Esgotado"}
          </Button>
        </div>
      </div>


      <RecentlyViewed excludeHandle={product.handle} />

    </>

  );
}

function Trust({ icon: Icon, label }: { icon: typeof Check; label: string }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
      <span>{label}</span>
    </div>
  );
}
