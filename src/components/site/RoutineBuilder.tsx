import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2, Check, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildDemoRoutine } from "@/lib/demo-routine";
import type { RoutineResult, RoutineSlot } from "@/lib/routine.server";
import { useCartStore } from "@/stores/cartStore";
import { shortTitle } from "./ProductCard";
import { formatPrice } from "./format";

const GOALS = [
  { id: "acne", label: "Acne e oleosidade" },
  { id: "manchas", label: "Manchas e luminosidade" },
  { id: "hidratacao", label: "Hidratação" },
  { id: "anti-idade", label: "Anti-idade" },
];

const SKINS = [
  { id: "oleosa", label: "Oleosa" },
  { id: "seca", label: "Seca" },
  { id: "mista", label: "Mista" },
  { id: "sensivel", label: "Sensível" },
];

const LEVELS = [
  { id: "essencial", label: "Essencial" },
  { id: "completa", label: "Completa" },
  { id: "avancada", label: "Avançada" },
];

const SLOT_LABEL: Record<RoutineSlot, string> = {
  limpeza: "1. Limpeza",
  serum: "2. Tratamento",
  creme: "3. Hidratação",
  protetor: "4. Proteção",
  acessorio: "5. Acessório",
};

function Choices({
  options,
  value,
  onSelect,
}: {
  options: { id: string; label: string }[];
  value: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onSelect(o.id)}
          className={`min-h-11 rounded-full border px-4 py-2 text-[13px] transition sm:px-5 sm:text-sm ${
            value === o.id
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border hover:border-primary/40"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function RoutineBuilder() {
  const addItem = useCartStore((s) => s.addItem);
  const cartLoading = useCartStore((s) => s.isLoading);

  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState<string | null>(null);
  const [skin, setSkin] = useState<string | null>(null);
  const [level, setLevel] = useState<string | null>(null);
  const [routine, setRoutine] = useState<RoutineResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [addingKit, setAddingKit] = useState(false);
  const [kitDetails, setKitDetails] = useState(false);

  const generate = async (lvl: string) => {
    if (!skin || !goal) return;
    setLoading(true);
    setError(null);
    try {
      const result = buildDemoRoutine({ skin, goal, level: lvl, seed: Math.floor(Math.random() * 1_000_000) });
      setRoutine(result);
    } catch {
      setError("Não foi possível montar a rotina agora. Tente novamente em instantes.");
    } finally {
      setLoading(false);
    }
  };

  const addAll = async () => {
    if (!routine) return;
    setAdding(true);
    try {
      for (const item of routine.items) {
        const variant = item.product.node.variants.edges[0]?.node;
        if (!variant) continue;
        await addItem({
          product: item.product,
          variantId: variant.id,
          variantTitle: variant.title,
          price: variant.price,
          quantity: 1,
          selectedOptions: variant.selectedOptions || [],
        });
      }
      toast.success("Rotina adicionada à sacola");
    } finally {
      setAdding(false);
    }
  };

  const addKit = async () => {
    const kit = routine?.kit;
    const variant = kit?.product.node.variants.edges[0]?.node;
    if (!kit || !variant) return;
    setAddingKit(true);
    try {
      await addItem({
        product: kit.product,
        variantId: variant.id,
        variantTitle: variant.title,
        price: variant.price,
        quantity: 1,
        selectedOptions: variant.selectedOptions || [],
      });
      toast.success("Kit adicionado à sacola");
    } finally {
      setAddingKit(false);
    }
  };

  const total = routine
    ? routine.items.reduce((sum, i) => {
        const v = i.product.node.variants.edges[0]?.node;
        return sum + parseFloat(v?.price.amount ?? i.product.node.priceRange.minVariantPrice.amount);
      }, 0)
    : 0;
  const currency =
    routine?.items[0]?.product.node.variants.edges[0]?.node.price.currencyCode ?? "BRL";

  const kit = routine?.kit ?? null;
  const kitImage = kit?.product.node.images?.edges?.[0]?.node;
  const kitPrice =
    kit?.product.node.variants.edges[0]?.node.price ?? kit?.product.node.priceRange.minVariantPrice;

  const restart = () => {
    setRoutine(null);
    setStep(1);
    setKitDetails(false);
  };

  return (
    <section id="monte-sua-rotina" className="scroll-mt-24 bg-secondary/30 py-14 md:py-20">
      <div className="mx-auto w-full max-w-[900px] px-4 md:px-6">
        <div className="max-w-2xl">
          <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Rotina demonstrativa
          </p>
          <h2 className="font-display text-2xl leading-tight sm:text-3xl md:text-4xl">
            Descubra sua rotina ideal de skincare asiático
          </h2>
          <p className="mt-3 text-sm text-muted-foreground md:text-[15px]">
            Responda algumas perguntas rápidas e receba uma combinação personalizada para sua pele.
          </p>
        </div>

        <div className="mt-6 rounded-3xl border border-border bg-background p-4 sm:p-6 md:p-7">
          {!started && !routine ? (
            <Button
              size="lg"
              className="min-h-11 w-full rounded-full sm:w-auto sm:px-8"
              onClick={() => setStarted(true)}
            >
              Montar minha rotina
            </Button>
          ) : null}

          {started && !routine && !loading && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {step > 1 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Voltar
                  </button>
                )}
                <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Passo {step} de 3
                </span>
              </div>

              {step === 1 && (
                <div className="space-y-3">
                  <div className="text-sm font-medium">Objetivo da pele</div>
                  <Choices
                    options={GOALS}
                    value={goal}
                    onSelect={(id) => {
                      setGoal(id);
                      setStep(2);
                    }}
                  />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-3">
                  <div className="text-sm font-medium">Tipo de pele</div>
                  <Choices
                    options={SKINS}
                    value={skin}
                    onSelect={(id) => {
                      setSkin(id);
                      setStep(3);
                    }}
                  />
                </div>
              )}

              {step === 3 && (
                <div className="space-y-3">
                  <div className="text-sm font-medium">Nível da rotina</div>
                  <Choices
                    options={LEVELS}
                    value={level}
                    onSelect={(id) => {
                      setLevel(id);
                      void generate(id);
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Montando sua rotina personalizada
            </div>
          )}

          {error && !loading && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button variant="outline" className="min-h-11 rounded-full" onClick={restart}>
                Tentar novamente
              </Button>
            </div>
          )}

          {routine && !loading && (
            <div className="space-y-6">
              {kit && kitPrice && (
                <div className="rounded-2xl border border-primary/30 bg-primary/5 p-3 sm:p-5">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    Opção 1: Kit recomendado para sua pele
                  </div>

                  <div className="mt-3 flex flex-col gap-4 sm:flex-row">
                    <Link
                      to="/produto/$handle"
                      params={{ handle: kit.product.node.handle }}
                      className="mx-auto block w-full max-w-[220px] overflow-hidden rounded-xl bg-secondary sm:mx-0 sm:w-[200px] sm:shrink-0"
                    >
                      {kitImage && (
                        <img
                          src={kitImage.url}
                          alt={kitImage.altText ?? kit.product.node.title}
                          loading="lazy"
                          className="hover-zoom h-[140px] w-full object-cover sm:h-[200px]"
                        />
                      )}
                    </Link>

                    <div className="min-w-0 flex-1 space-y-2">
                      <Link
                        to="/produto/$handle"
                        params={{ handle: kit.product.node.handle }}
                        className="block font-display text-base leading-tight hover:underline sm:text-lg"
                      >
                        {shortTitle(kit.product.node.title)}
                      </Link>
                      <div className="text-base font-medium sm:text-lg">
                        {formatPrice(kitPrice.amount, kitPrice.currencyCode)}
                      </div>

                      <p className="line-clamp-2 hidden text-[14px] leading-relaxed text-muted-foreground sm:block sm:text-[15px]">
                        {kit.reason}
                      </p>

                      <ul className="space-y-1">
                        {kit.benefits.slice(0, 1).map((b, i) => (
                          <li key={i} className="flex items-start gap-2 text-[13px] text-muted-foreground sm:text-sm">
                            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                            <span className="line-clamp-2">{b}</span>
                          </li>
                        ))}
                        {kit.benefits.slice(1, 2).map((b, i) => (
                          <li
                            key={i}
                            className="hidden items-start gap-2 text-sm text-muted-foreground sm:flex"
                          >
                            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                            <span className="line-clamp-2">{b}</span>
                          </li>
                        ))}
                      </ul>

                      {kit.indicatedFor && (
                        <p className="hidden text-sm text-muted-foreground sm:block">
                          <span className="font-medium text-foreground">Indicado para: </span>
                          {kit.indicatedFor}
                        </p>
                      )}

                      {kitDetails && kit.includes.length > 0 && (
                        <ul className="space-y-1 pt-1">
                          {kit.includes.slice(0, 8).map((inc, i) => (
                            <li key={i} className="flex items-start gap-2 text-[13px] text-muted-foreground">
                              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                              <span>{inc}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center">
                        <Button
                          className="min-h-11 w-full rounded-full sm:w-auto sm:px-6"
                          onClick={addKit}
                          disabled={addingKit || cartLoading}
                        >
                          {addingKit ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Adicionar kit ao carrinho"
                          )}
                        </Button>
                        <button
                          onClick={() => setKitDetails(!kitDetails)}
                          className="min-h-11 text-[13px] text-muted-foreground underline sm:text-sm"
                        >
                          {kitDetails ? "Ocultar detalhes" : "Ver detalhes"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    {kit ? "Opção 2: " : ""}Monte sua rotina personalizada
                  </div>
                  <h3 className="mt-1.5 font-display text-lg leading-tight sm:text-xl">
                    {routine.name}
                  </h3>
                  <p className="mt-1.5 line-clamp-3 text-[13px] leading-relaxed text-muted-foreground sm:text-[15px]">
                    {routine.summary}
                  </p>
                </div>

                <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0">
                  {routine.items.map((item) => {
                    const img = item.product.node.images?.edges?.[0]?.node;
                    const variant = item.product.node.variants.edges[0]?.node;
                    const price = variant?.price ?? item.product.node.priceRange.minVariantPrice;
                    return (
                      <Link
                        key={item.product.node.id}
                        to="/produto/$handle"
                        params={{ handle: item.product.node.handle }}
                        className="group flex w-[60%] shrink-0 snap-start flex-col overflow-hidden rounded-xl border border-border bg-card transition hover:-translate-y-0.5 sm:w-auto"
                      >
                        <div className="h-[120px] overflow-hidden bg-secondary sm:h-[150px]">
                          {img && (
                            <img
                              src={img.url}
                              alt={img.altText ?? shortTitle(item.product.node.title)}
                              loading="lazy"
                              className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                            />
                          )}
                        </div>
                        <div className="flex flex-1 flex-col gap-1 p-3">
                          <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                            {SLOT_LABEL[item.slot]}
                          </span>
                          <div className="font-display text-[15px] leading-tight">
                            {shortTitle(item.product.node.title)}
                          </div>
                          <p className="line-clamp-2 hidden text-xs leading-relaxed text-muted-foreground sm:block">
                            {item.reason}
                          </p>
                          <div className="mt-auto pt-1.5 text-sm font-medium">
                            {formatPrice(price.amount, price.currencyCode)}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                <div className="flex flex-col gap-3 rounded-xl bg-secondary/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                      Rotina completa
                    </div>
                    <div className="text-xl font-medium">{formatPrice(total, currency)}</div>
                  </div>
                  <Button
                    variant={kit ? "outline" : "default"}
                    className="min-h-11 w-full rounded-full sm:w-auto sm:px-6"
                    onClick={addAll}
                    disabled={adding || cartLoading}
                  >
                    {adding ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Adicionar minha rotina ao carrinho"
                    )}
                  </Button>
                </div>

                <details className="rounded-xl border border-border p-3">
                  <summary className="cursor-pointer text-[13px] font-medium sm:text-sm">
                    Ordem de aplicação
                  </summary>
                  <div className="mt-2 space-y-1.5">
                    {routine.order.map((s, i) => (
                      <div key={i} className="flex items-start gap-2 text-[13px] text-muted-foreground">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </details>

                <Button
                  variant="ghost"
                  className="min-h-11 rounded-full text-sm"
                  onClick={restart}
                >
                  <RefreshCw className="mr-2 h-4 w-4" /> Refazer minha rotina
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
