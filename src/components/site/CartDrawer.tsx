import { useEffect, useState } from "react";
import { ShoppingBag, Minus, Plus, Loader2, ExternalLink, Tag, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice } from "./format";
import { CartUpsell } from "./UpsellRow";
import { isNationalProduct, quoteCart } from "@/lib/shipping";
import { toast } from "sonner";

function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}

export function CartDrawer() {
  const [open, setOpen] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const hydrated = useHydrated();
  const { items, isLoading, isSyncing, updateQuantity, removeItem, syncCart, cartId } =
    useCartStore();

  useEffect(() => { if (open) syncCart(); }, [open, syncCart]);

  const cartCount = hydrated ? items.reduce((s, i) => s + i.quantity, 0) : 0;
  const total = items.reduce((s, i) => s + parseFloat(i.price.amount) * i.quantity, 0);
  const currency = items[0]?.price.currencyCode ?? "BRL";
  const shipping = quoteCart(
    items.map((i) => ({
      national: isNationalProduct({
        title: i.product.node.title,
        description: i.product.node.description,
        price: i.price.amount,
      }),
    })),
  );

  const checkout = () => {
    toast.info("Demonstração concluída", { description: "Este portfólio não realiza vendas, cobranças ou envios." });
  };

  const installment = (total + shipping.price) / 6;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="press relative rounded-full bg-secondary p-2.5 hover:bg-accent" aria-label="Sacola">
          <ShoppingBag className="h-4 w-4" />
          {cartCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
              {cartCount}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="font-display text-2xl">Sua sacola demonstrativa</SheetTitle>
        </SheetHeader>
        <div className="flex-1 space-y-4 overflow-y-auto py-6">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sua sacola está vazia.</p>
          ) : (
            items.map((item) => {
              const img = item.product.node.images?.edges?.[0]?.node?.url;
              return (
                <div key={item.variantId} className="flex gap-4 rounded-2xl bg-secondary/60 p-3">
                  {img && <img src={img} alt={item.product.node.title} className="hover-zoom h-20 w-20 rounded-xl object-cover" />}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="text-sm font-medium">{item.product.node.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatPrice(item.price.amount, item.price.currencyCode)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(item.variantId, item.quantity - 1)} className="press rounded-full border border-border p-1" disabled={isLoading} aria-label="Diminuir">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-sm">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.variantId, item.quantity + 1)} className="press rounded-full border border-border p-1" disabled={isLoading} aria-label="Aumentar">
                        <Plus className="h-3 w-3" />
                      </button>
                      <button onClick={() => removeItem(item.variantId)} className="ml-auto text-xs text-muted-foreground hover:text-foreground" disabled={isLoading}>
                        Remover
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <CartUpsell
            excludeVariantIds={items.map((i) => i.variantId)}
            excludeHandles={items.map((i) => i.product.node.handle)}
            basedOn={items.map((i) => i.product.node.title).join(" ")}
          />
        </div>
        {items.length > 0 && (
          <div className="space-y-3 border-t border-border pt-4">
            {/* Cupom */}
            <div className="rounded-2xl border border-border bg-card p-3">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                <Tag className="h-3 w-3" /> Cupom de desconto
              </div>
              <div className="flex gap-2">
                <input
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  placeholder="DERMI10"
                  className="min-w-0 flex-1 rounded-full border border-border bg-secondary/40 px-4 py-2 text-sm outline-none focus:border-primary/40"
                />
                <button
                  onClick={() => setAppliedCoupon(coupon.trim().toUpperCase())}
                  className="shrink-0 rounded-full border border-border px-4 py-2 text-xs font-medium transition hover:bg-accent"
                >
                  Aplicar
                </button>
              </div>
              {appliedCoupon && (
                <p className="mt-2 text-xs text-primary">
                  Cupom <span className="font-semibold">{appliedCoupon}</span> selecionado nesta demonstração.
                </p>
              )}
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatPrice(total, currency)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{shipping.label}</span>
              <span className="font-medium">
                {shipping.price === 0 ? "Grátis" : formatPrice(shipping.price, currency)}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">Prazo estimado: {shipping.eta}</div>
            <div className="flex justify-between border-t border-border pt-3 text-sm">
              <span>Total</span>
              <span className="font-medium">{formatPrice(total + shipping.price, currency)}</span>
            </div>

            {/* Parcelamento */}
            <div className="flex items-center gap-2 rounded-xl bg-secondary/50 p-3 text-xs text-muted-foreground">
              <CreditCard className="h-3.5 w-3.5" />
              <span>
                Ou em até <span className="font-medium text-foreground">6x de {formatPrice(String(installment.toFixed(2)), currency)}</span> sem juros
              </span>
            </div>

            <Button size="lg" className="w-full rounded-full" onClick={checkout} disabled={isLoading || isSyncing || !cartId}>
              {isLoading || isSyncing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <><ExternalLink className="mr-2 h-4 w-4" /> Simular finalização</>
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground">Portfólio demonstrativo. Valores ilustrativos, sem cobrança ou envio.</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
