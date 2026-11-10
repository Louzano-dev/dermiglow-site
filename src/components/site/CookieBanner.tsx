import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

const KEY = "dermiglow-cookies";

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {
      /* ignora armazenamento indisponível */
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* ignora */
    }
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-3 md:p-5">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl border border-border bg-background/95 p-4 shadow-[var(--shadow-soft)] backdrop-blur md:flex-row md:items-center">
        <p className="flex-1 text-xs leading-relaxed text-muted-foreground">
          Usamos cookies para melhorar sua navegação e entender o uso da loja, conforme a LGPD. Saiba mais na{" "}
          <Link to="/privacidade" className="underline hover:text-foreground">
            política de privacidade
          </Link>
          .
        </p>
        <Button size="sm" className="shrink-0 rounded-full" onClick={accept}>
          Aceitar
        </Button>
      </div>
    </div>
  );
}
