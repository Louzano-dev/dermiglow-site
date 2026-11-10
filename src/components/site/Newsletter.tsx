import { useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export function Newsletter({ source = "footer" }: { source?: string }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
      toast.error("Informe um e-mail válido.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("newsletter_subscribers").insert({ email: value, source });
    setLoading(false);
    if (error && error.code !== "23505") {
      toast.error("Não foi possível cadastrar seu e-mail agora.");
      return;
    }
    setDone(true);
    toast.success("Pronto!", { description: "Use o cupom DERMI10 e ganhe 10% na primeira compra." });
  };

  if (done) {
    return (
      <p className="text-sm text-muted-foreground">
        Obrigada! Seu cupom de boas-vindas é <span className="font-semibold text-foreground">DERMI10</span>.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        <Mail className="h-3 w-3" /> Receba novidades e ofertas
      </div>
      <div className="flex gap-2">
        <input
          type="email"
          aria-label="Seu e-mail para receber novidades e ofertas"
          value={email}
          maxLength={255}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          className="min-w-0 flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary/40"
        />
        <Button type="submit" size="sm" className="shrink-0 rounded-full" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cadastrar"}
        </Button>
      </div>
      <p className="text-[11px] text-muted-foreground">
        Ao cadastrar você recebe o cupom DERMI10 com 10% na primeira compra.
      </p>
    </form>
  );
}
