import { useState } from "react";
import { Truck, Loader2 } from "lucide-react";
import { formatCep, isValidCep, quoteProduct, type ShippingQuote } from "@/lib/shipping";
import { formatPrice } from "./format";

export function ShippingEstimator({ national }: { national: boolean }) {
  const [cep, setCep] = useState("");
  const [quote, setQuote] = useState<ShippingQuote | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const calculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setQuote(null);
    setCity(null);
    if (!isValidCep(cep)) {
      setError("Informe um CEP válido, com 8 dígitos.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep.replace(/\D/g, "")}/json/`);
      const data = (await res.json()) as { erro?: boolean; localidade?: string; uf?: string };
      if (data.erro) {
        setError("CEP não encontrado.");
        return;
      }
      setCity(data.localidade && data.uf ? `${data.localidade}/${data.uf}` : null);
      setQuote(quoteProduct(national));
    } catch {
      setQuote(quoteProduct(national));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium">
        <Truck className="h-4 w-4" strokeWidth={1.5} /> Calcular frete e prazo
      </div>
      <form onSubmit={calculate} className="flex flex-col gap-2 sm:flex-row">
        <input
          value={cep}
          onChange={(e) => setCep(formatCep(e.target.value))}
          placeholder="Seu CEP"
          inputMode="numeric"
          className="min-w-0 flex-1 rounded-full border border-border bg-secondary/40 px-4 py-2.5 text-sm outline-none focus:border-primary/40"
        />
        <button
          type="submit"
          disabled={loading}
          className="shrink-0 rounded-full bg-primary px-5 py-2.5 text-xs font-medium text-primary-foreground disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Calcular"}
        </button>
      </form>
      {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
      {quote && (
        <div className="mt-4 space-y-1 rounded-xl bg-secondary/50 p-4 text-sm">
          {city && <div className="text-xs text-muted-foreground">{city}</div>}
          <div className="flex items-center justify-between">
            <span>{quote.label}</span>
            <span className="font-medium">
              {quote.price === 0 ? "Grátis" : formatPrice(quote.price, "BRL")}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">Prazo estimado: {quote.eta}</div>
        </div>
      )}
      <p className="mt-3 text-[11px] text-muted-foreground">
        Prazos contados em dias úteis após a confirmação do pagamento.
      </p>
    </div>
  );
}
