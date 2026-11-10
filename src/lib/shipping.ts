/**
 * Regras de frete da Dermiglow.
 * Ponto único de configuração — ajuste aqui valores e prazos.
 */
export const SHIPPING_CONFIG = {
  nationalPrice: 0,
  nationalEta: "5 a 10 dias úteis",
  importedPrice: 0,
  importedEta: "12 a 25 dias úteis",
} as const;

/** Palavras que identificam itens nacionais do catálogo */
const NATIONAL_KEYWORDS = ["rosa mosqueta", "antioleosidade", "phallebeauty"];

/** Até este valor não exibimos comunicação de "importado" (não altera o frete) */
const HIDE_IMPORTED_PRICE_LIMIT = 50;

function matchesNationalKeyword(title: string, description?: string | null) {
  const text = `${title} ${description ?? ""}`.toLowerCase();
  return NATIONAL_KEYWORDS.some((w) => text.includes(w));
}

/** Regra de FRETE: só as linhas nacionais são nacionais */
export function isNationalProduct(input: {
  title: string;
  description?: string | null;
  price: string | number;
}): boolean {
  return matchesNationalKeyword(input.title, input.description);
}

/** Regra de COMUNICAÇÃO: esconde "importado" nas linhas nacionais ou até R$ 50 */
export function hidesImportedBadge(input: {
  title: string;
  description?: string | null;
  price: string | number;
}): boolean {
  if (matchesNationalKeyword(input.title, input.description)) return true;
  return Number(input.price) <= HIDE_IMPORTED_PRICE_LIMIT;
}


export type ShippingQuote = {
  price: number;
  eta: string;
  label: string;
};

/** Frete de um único produto — grátis para todos os produtos */
export function quoteProduct(national: boolean): ShippingQuote {
  return national
    ? {
        price: SHIPPING_CONFIG.nationalPrice,
        eta: SHIPPING_CONFIG.nationalEta,
        label: "Frete grátis (envio nacional)",
      }
    : {
        price: SHIPPING_CONFIG.importedPrice,
        eta: SHIPPING_CONFIG.importedEta,
        label: "Frete grátis (envio internacional)",
      };
}

/** Frete do carrinho: grátis, com o prazo mais longo entre os itens */
export function quoteCart(items: Array<{ national: boolean }>): ShippingQuote {
  if (items.length === 0) return quoteProduct(false);
  const hasNational = items.some((i) => i.national);
  const hasImported = items.some((i) => !i.national);
  if (hasNational) {
    return {
      price: 0,
      eta: hasImported
        ? `${SHIPPING_CONFIG.nationalEta} (itens importados: ${SHIPPING_CONFIG.importedEta})`
        : SHIPPING_CONFIG.nationalEta,
      label: "Frete grátis",
    };
  }
  return quoteProduct(false);
}

/** Valida CEP brasileiro (8 dígitos) */
export function isValidCep(cep: string): boolean {
  return /^\d{5}-?\d{3}$/.test(cep.trim());
}

export function formatCep(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}
