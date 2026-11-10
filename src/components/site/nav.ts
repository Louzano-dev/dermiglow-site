import colSerum from "@/assets/col-serum.jpg";
import colCream from "@/assets/col-cream.jpg";
import colKits from "@/assets/col-kits.jpg";
import colCleansing from "@/assets/col-cleansing.jpg";
import colAccessories from "@/assets/col-accessories.jpg";
import colSunscreen from "@/assets/col-sunscreen.jpg";

export type StoreCollection = {
  /** Nome exato da coleção na Shopify — nunca traduzir */
  label: string;
  /** Handle real da coleção na Shopify */
  handle: string;
  /** Descrição curta usada nos cards */
  description: string;
  image: string;
};

export const STORE_COLLECTIONS: StoreCollection[] = [
  {
    label: "Linha de Séruns",
    handle: "seruns",
    description: "Ativos concentrados para uniformizar e iluminar.",
    image: colSerum,
  },
  {
    label: "Linha de Cremes",
    handle: "cream-line",
    description: "Hidratação profunda e barreira cutânea fortalecida.",
    image: colCream,
  },
  {
    label: "Linha de Kits",
    handle: "kits-line",
    description: "Rotinas completas em conjuntos selecionados.",
    image: colKits,
  },
  {
    label: "Linha de Limpeza Facial",
    handle: "facial-cleansing-line",
    description: "Limpeza suave, o primeiro passo de toda rotina.",
    image: colCleansing,
  },
  {
    label: "Linha de Acessórios",
    handle: "skincare-accessories-line",
    description: "Ferramentas que potencializam seus produtos.",
    image: colAccessories,
  },
  {
    label: "Linha de Protetores Solares",
    handle: "sunscreen-line",
    description: "Proteção diária contra os danos solares.",
    image: colSunscreen,
  },
];

export const ACCESSORIES_HANDLE = "skincare-accessories-line";
