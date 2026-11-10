import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { saveProfile } from "@/lib/account.functions";
import { formatCpf, isValidCpf, onlyDigits } from "@/lib/cpf";
import { lovable } from "@/integrations/lovable/index";


const input =
  "w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm outline-none focus:border-primary/40";

export function AuthForm({ onDone }: { onDone?: () => void }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);


  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        if (name.trim().length < 2) throw new Error("Informe seu nome completo.");
        if (!isValidCpf(cpf)) throw new Error("CPF inválido.");
        if (password.length < 8) throw new Error("A senha deve ter ao menos 8 caracteres.");
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: window.location.origin, data: { full_name: name.trim() } },
        });
        if (error) throw new Error(error.message);
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          toast.success("Conta criada", { description: "Confirme seu e-mail para continuar." });
          onDone?.();
          return;
        }
        await saveProfile({ data: { fullName: name.trim(), cpf: onlyDigits(cpf) } });
        toast.success("Conta criada com sucesso");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw new Error("E-mail ou senha incorretos.");
        toast.success("Bem-vinda de volta");
      }
      onDone?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível continuar.");
    } finally {
      setLoading(false);
    }
  };

  const reset = async () => {
    if (!email.trim()) return toast.error("Informe seu e-mail para recuperar a senha.");
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
    if (error) toast.error("Não foi possível enviar o e-mail de recuperação.");
    else toast.success("Enviamos um e-mail com o link de recuperação.");
  };

  const signInWithGoogle = async () => {
    setGoogleLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error("Não foi possível entrar com o Google.");
        return;
      }
      if (result.redirected) return;
      onDone?.();
    } catch {
      toast.error("Não foi possível entrar com o Google.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full rounded-full"
        disabled={googleLoading}
        onClick={signInWithGoogle}
      >
        {googleLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Continuar com Google"
        )}
      </Button>
      <div className="flex items-center gap-3 text-[11px] uppercase tracking-widest text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> ou <span className="h-px flex-1 bg-border" />
      </div>
      <form onSubmit={submit} className="space-y-3">

      {mode === "signup" && (
        <>
          <input
            className={input}
            placeholder="Nome completo"
            value={name}
            maxLength={80}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className={input}
            placeholder="CPF"
            inputMode="numeric"
            value={cpf}
            onChange={(e) => setCpf(formatCpf(e.target.value))}
          />
        </>
      )}
      <input
        className={input}
        type="email"
        placeholder="E-mail"
        value={email}
        maxLength={255}
        required
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className={input}
        type="password"
        placeholder="Senha"
        value={password}
        maxLength={72}
        required
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button type="submit" size="lg" className="w-full rounded-full" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "login" ? "Entrar" : "Criar conta"}
      </Button>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <button type="button" className="underline" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
          {mode === "login" ? "Criar uma conta" : "Já tenho conta"}
        </button>
        {mode === "login" && (
          <button type="button" className="underline" onClick={reset}>
            Esqueci minha senha
          </button>
        )}
      </div>
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Ao criar sua conta você concorda com a nossa política de trocas e devoluções.
      </p>
      </form>
    </div>
  );

}

export function AuthDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess?: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Entrar para finalizar</DialogTitle>
          <DialogDescription>
            Sua conta guarda seus pedidos, o carrinho salvo e libera as avaliações verificadas.
          </DialogDescription>
        </DialogHeader>
        <AuthForm
          onDone={() => {
            onOpenChange(false);
            onSuccess?.();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
