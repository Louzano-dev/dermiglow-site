import { useMemo, useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ShoppingBag } from "lucide-react";
import { type ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice } from "./format";
import { shortTitle, mainBenefit } from "./ProductCard";
import { useRecommendations } from "./recommend";

/** Varia as sugestões a cada carregamento (somente no cliente) */
function useSeed() {
  const [seed, setSeed] = useState(1);
  useEffect(() => setSeed(Math.floor(Math.random() * 1_000_000) + 1), []);
  return seed;
}

function useAdd(product: ShopifyProduct) {
  const addItem = useCartStore((s) => s.addItem);
  const variant = product.node.variants.edges[0]?.node;
  return async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!variant) return;
    await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });
    toast.success("Adicionado à sacola", { description: shortTitle(product.node.title) });
  };
}

/** Card vertical usado na página de produto (grid responsivo) */
function UpsellCard({ product }: { product: ShopifyProduct }) {
  const cartLoading = useCartStore((s) => s.isLoading);
  const variant = product.node.variants.edges[0]?.node;
  const img = product.node.images?.edges?.[0]?.node;
  const price = variant?.price ?? product.node.priceRange.minVariantPrice;
  const name = shortTitle(product.node.title);
  const benefit = mainBenefit(product.node.title, product.node.description);
  const add = useAdd(product);

  return (
    <Link
      to="/produto/$handle"
      params={{ handle: product.node.handle }}
      className="group flex h-full w-[62%] shrink-0 snap-start flex-col sm:w-auto sm:min-w-0 overflow-hidden rounded-2xl border border-border bg-card transition hover:border-primary/40 hover:shadow-[var(--shadow-card)]"
    >
      <div className="aspect-square w-full overflow-hidden bg-secondary">
        {img ? (
          <img
            src={img.url}
            alt={name}
            loading="lazy"
            className="h-full w-full object-contain p-3 transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ShoppingBag className="h-6 w-6" />
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1 p-3">
        <div className="line-clamp-2 text-sm font-medium leading-snug">{name}</div>
        {benefit && (
          <div className="line-clamp-1 text-xs text-muted-foreground">{benefit}</div>
        )}
        <div className="mt-auto pt-2">
          <div className="text-sm font-medium">
            {formatPrice(price.amount, price.currencyCode)}
          </div>
          <button
            onClick={add}
            disabled={!variant?.availableForSale || cartLoading}
            className="mt-2 w-full rounded-full bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
          >
            {variant?.availableForSale ? "Adicionar" : "Esgotado"}
          </button>
        </div>
      </div>
    </Link>
  );
}

/** Linha compacta usada no carrinho */
function UpsellItem({ product }: { product: ShopifyProduct }) {
  const cartLoading = useCartStore((s) => s.isLoading);
  const variant = product.node.variants.edges[0]?.node;
  const img = product.node.images?.edges?.[0]?.node;
  const price = variant?.price ?? product.node.priceRange.minVariantPrice;
  const add = useAdd(product);

  return (
    <Link
      to="/produto/$handle"
      params={{ handle: product.node.handle }}
      className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card p-3 transition hover:border-primary/40"
    >
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-secondary">
        {img ? (
          <img src={img.url} alt={shortTitle(product.node.title)} loading="lazy" className="hover-zoom h-full w-full object-contain p-1" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ShoppingBag className="h-5 w-5" />
          </div>
        )}
      </div>
      <div className="min-w-0">
        <div className="truncate text-sm font-medium">{shortTitle(product.node.title)}</div>
        <div className="text-sm text-muted-foreground">
          {formatPrice(price.amount, price.currencyCode)}
        </div>
      </div>
      <button
        onClick={add}
        disabled={!variant?.availableForSale || cartLoading}
        className="shrink-0 rounded-full bg-primary px-3 py-2 text-[11px] font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
      >
        {variant?.availableForSale ? "Adicionar" : "Esgotado"}
      </button>
    </Link>
  );
}

/** Upsell inteligente da página de produto */
export function UpsellRow({
  excludeHandle,
  basedOn,
}: {
  excludeHandle?: string;
  basedOn?: string;
}) {
  const seed = useSeed();
  const exclude = useMemo(() => (excludeHandle ? [excludeHandle] : []), [excludeHandle]);
  const { items } = useRecommendations({
    basedOn: basedOn ?? excludeHandle ?? "",
    exclude,
    limit: 4,
    seed,
  });

  if (items.length === 0) return null;

  return (
    <div className="rounded-3xl border border-border bg-accent/20 p-4 sm:p-5 md:p-6">
      <h3 className="font-display text-2xl">Complete sua rotina de skincare</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Adicione produtos que combinam com sua rotina.
      </p>
      <div className="-mx-1 mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 xl:grid-cols-4">
        {items.map((p) => (
          <UpsellCard key={p.node.id} product={p} />
        ))}
      </div>
    </div>
  );
}

/** Upsell inteligente dentro do carrinho */
export function CartUpsell({
  excludeVariantIds,
  excludeHandles = [],
  basedOn = "",
}: {
  excludeVariantIds: string[];
  excludeHandles?: string[];
  basedOn?: string;
}) {
  const seed = useSeed();
  const { items } = useRecommendations({
    basedOn,
    exclude: excludeHandles,
    limit: 3,
    seed,
  });

  const filtered = items.filter(
    (p) => !excludeVariantIds.includes(p.node.variants.edges[0]?.node?.id ?? ""),
  );
  if (filtered.length === 0) return null;

  return (
    <div className="space-y-2 border-t border-border pt-4">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">
        Complete sua rotina de skincare
      </div>
      <p className="text-xs text-muted-foreground">
        Adicione produtos que combinam com sua rotina.
      </p>
      {filtered.map((p) => (
        <UpsellItem key={p.node.id} product={p} />
      ))}
    </div>
  );
}
