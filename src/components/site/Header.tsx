import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, X, Search, User } from "lucide-react";
import { CartDrawer } from "./CartDrawer";
import { STORE_COLLECTIONS } from "./nav";
import { useAuth } from "@/hooks/use-auth";
import logoAsset from "@/assets/dermiglow-logo-header.png.asset.json";

export function Header() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [term, setTerm] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();



  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = term.trim();
    setSearchOpen(false);
    setOpen(false);
    navigate({ to: "/loja", search: q ? { q } : {} });
  };

  return (
    <header
      className={`sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-md transition-shadow duration-300 ${
        scrolled ? "shadow-[var(--shadow-card)]" : ""
      }`}
    >
      <div className="mx-auto grid h-20 max-w-7xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 md:gap-8 md:px-8">
        <div className="flex min-w-0 items-center gap-3 md:pr-6">
          <button className="press lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Link to="/" className="flex min-w-0 items-center" aria-label="Dermiglow, skincare asiática">
            <img
              src={logoAsset.url}
              alt="Dermiglow, skincare asiática"
              className="h-11 w-auto max-w-[200px] object-contain md:h-14 md:max-w-none"
            />
          </Link>
        </div>

        <nav className="hidden items-center justify-center gap-6 text-[13px] tracking-wide lg:flex">
          {STORE_COLLECTIONS.map((c) => (
            <Link
              key={c.handle}
              to="/colecao/$handle"
              params={{ handle: c.handle }}
              className="story-link whitespace-nowrap transition hover:text-accent-foreground/70"
              activeProps={{ className: "text-accent-foreground/70" }}
            >
              {c.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="Buscar"
            className="press rounded-full bg-secondary p-2.5 hover:bg-accent"
          >
            <Search className="h-4 w-4" />
          </button>
          <Link
            to={isAuthenticated ? "/conta" : "/entrar"}
            aria-label="Minha conta"
            className="press rounded-full bg-secondary p-2.5 hover:bg-accent"
          >
            <User className="h-4 w-4" />
          </Link>
          <CartDrawer />
        </div>

      </div>

      {searchOpen && (
        <div className="animate-fade-in border-t border-border bg-background">
          <form onSubmit={submit} className="mx-auto flex max-w-7xl gap-2 px-4 py-3 md:px-8">
            <input
              ref={inputRef}
              value={term}
              type="search"
              aria-label="Buscar produtos"
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Buscar por sérum, hidratante, vitamina C…"
              className="min-w-0 flex-1 rounded-full border border-border bg-secondary/50 px-5 py-2.5 text-sm outline-none focus:border-primary/40"
            />
            <button
              type="submit"
              className="press shrink-0 rounded-full bg-primary px-5 py-2.5 text-xs font-medium text-primary-foreground"
            >
              Buscar
            </button>
          </form>
        </div>
      )}

      {/* Coleções em scroll horizontal no mobile */}
      <div className="border-t border-border/60 bg-secondary/40 lg:hidden">
        <div className="flex gap-2 overflow-x-auto px-4 py-2.5 text-xs [scrollbar-width:none]">
          {STORE_COLLECTIONS.map((c) => (
            <Link
              key={c.handle}
              to="/colecao/$handle"
              params={{ handle: c.handle }}
              className="press shrink-0 whitespace-nowrap rounded-full border border-border bg-background px-3.5 py-1.5"
            >
              {c.label}
            </Link>
          ))}
        </div>
      </div>

      {open && (
        <div className="animate-fade-in border-t border-border bg-background lg:hidden">
          <nav className="flex flex-col gap-1 px-4 py-4 text-sm">
            <Link to="/" onClick={() => setOpen(false)} className="py-2">Início</Link>
            <Link to="/loja" onClick={() => setOpen(false)} className="py-2">Todos os produtos</Link>
            <div className="mt-2 pb-1 text-xs uppercase tracking-widest text-muted-foreground">Coleções</div>
            {STORE_COLLECTIONS.map((c) => (
              <Link
                key={c.handle}
                to="/colecao/$handle"
                params={{ handle: c.handle }}
                onClick={() => setOpen(false)}
                className="py-2 pl-3 text-muted-foreground"
              >
                {c.label}
              </Link>
            ))}
            <div className="mt-2 border-t border-border pt-2" />
            <Link to="/sobre" onClick={() => setOpen(false)} className="py-2">Sobre</Link>
            <Link to="/faq" onClick={() => setOpen(false)} className="py-2">FAQ</Link>
            <Link to="/ajuda" onClick={() => setOpen(false)} className="py-2">Ajuda</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
