import { Link } from "@tanstack/react-router";
import { ShoppingBag, Star } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/stores/cartStore";
import type { ShopifyProduct } from "@/lib/shopify";
import { formatPrice } from "./format";
import { Button } from "@/components/ui/button";
import { Reveal } from "./Reveal";

/** Nome funcional curto: remove sufixos de marketing do título da Shopify */
export function shortTitle(title: string) {
  return title.split("–")[0].split("—")[0].split("|")[0].trim() || title;
}

/** Benefício principal: parte após o travessão, ou primeira frase da descrição */
export function mainBenefit(title: string, description?: string) {
  const parts = title.split(/–|—/);
  if (parts.length > 1) {
    return parts.slice(1).join("–").replace(/com Tecnologia Coreana/i, "").trim();
  }
  if (description) return description.split(/[.!?]/)[0].trim();
  return "";
}

/**
 * Selos fixos da vitrine: o 1º produto recebe "Mais vendido" e o 2º "Alta procura".
 */
export function activeIngredientTags(products: ShopifyProduct[]): Record<number, string> {
  const tags: Record<number, string> = {};
  if (products[0]) tags[0] = "Destaque";
  if (products[1]) tags[1] = "Seleção";
  return tags;
}

export function ProductCard({
  product,
  tag,
}: {
  product: ShopifyProduct;
  tag?: string;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const cartLoading = useCartStore((s) => s.isLoading);
  const variant = product.node.variants.edges[0]?.node;
  const img = product.node.images?.edges?.[0]?.node;
  const price = variant?.price ?? product.node.priceRange.minVariantPrice;
  const benefit = mainBenefit(product.node.title, product.node.description);

  const handleAdd = async (e: React.MouseEvent) => {
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

  return (
    <Link
      to="/produto/$handle"
      params={{ handle: product.node.handle }}
      className="group press flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-soft)]"
    >
      <div className="relative aspect-square overflow-hidden bg-secondary">
        {img ? (
          <img
            src={img.url}
            alt={img.altText ?? shortTitle(product.node.title)}
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ShoppingBag className="h-8 w-8" />
          </div>
        )}
        {tag && (
          <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-[10px] uppercase tracking-widest text-primary-foreground">
            {tag}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4 md:p-5">
        <h3 className="font-display text-lg leading-tight md:text-xl">
          {shortTitle(product.node.title)}
        </h3>
        {benefit && (
          <p className="line-clamp-2 text-xs text-muted-foreground md:text-sm">{benefit}</p>
        )}
        <div className="flex flex-wrap gap-1.5">
          <span className="w-fit rounded-full bg-secondary px-2.5 py-1 text-[10px] uppercase tracking-widest text-muted-foreground">
            Demonstrativo
          </span>
        </div>


        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
          <span className="text-base font-medium md:text-lg">
            {formatPrice(price.amount, price.currencyCode)}
          </span>
          <Button
            onClick={handleAdd}
            disabled={!variant?.availableForSale || cartLoading}
            className="press rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {variant?.availableForSale ? "Adicionar" : "Esgotado"}
          </Button>
        </div>
      </div>
    </Link>
  );
}

export function ProductGrid({
  products,
  tags,
}: {
  products: ShopifyProduct[];
  tags?: Record<number, string>;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
      {products.map((p, i) => (
        <Reveal key={p.node.id} delay={(i % 4) * 70} className="flex">
          <ProductCard product={p} tag={tags?.[i]} />
        </Reveal>
      ))}
    </div>
  );
}
