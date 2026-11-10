import { Link } from "@tanstack/react-router";
import { Lock, ShieldCheck, Headphones, Plane, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STORE_COLLECTIONS } from "./nav";
import { Newsletter } from "./Newsletter";
import logoAsset from "@/assets/dermiglow-logo.png.asset.json";

const TRUST = [
  { icon: Lock, label: "Compra segura" },
  { icon: ShieldCheck, label: "Pagamento protegido" },
  { icon: Headphones, label: "Atendimento ao cliente" },
  { icon: Plane, label: "Produto importado" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
        <div className="mb-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          {TRUST.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="press flex items-center gap-3 rounded-2xl border border-border bg-background p-4"
            >
              <Icon className="h-5 w-5 shrink-0" strokeWidth={1.5} />
              <span className="text-sm">{label}</span>
            </div>
          ))}
        </div>

        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <img
              src={logoAsset.url}
              alt="Dermiglow, skincare asiática"
              className="h-14 w-auto object-contain"
            />
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Curadoria premium de skincare asiático: coreano, japonês e chinês, selecionado por qualidade e tecnologia.
            </p>
            <div className="mt-5 max-w-xs">
              <Newsletter />
            </div>
            <a
              href="https://instagram.com/dermiglow_oficial"
              target="_blank"
              rel="noopener noreferrer"
              className="press mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm hover:text-foreground"
            >
              <Instagram className="h-4 w-4" strokeWidth={1.5} />
              @dermiglow_oficial
            </a>
          </div>
          <div>
            <div className="mb-4 text-sm font-medium">Coleções</div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {STORE_COLLECTIONS.map((c) => (
                <li key={c.handle}>
                  <Link to="/colecao/$handle" params={{ handle: c.handle }} className="story-link hover:text-foreground">
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="mb-4 text-sm font-medium">Empresa</div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/sobre" className="story-link hover:text-foreground">Sobre</Link></li>
              <li><Link to="/faq" className="story-link hover:text-foreground">FAQ</Link></li>
              <li><Link to="/loja" className="story-link hover:text-foreground">Todos os produtos</Link></li>
            </ul>
          </div>
          <div>
            <div className="mb-4 text-sm font-medium">Ajuda</div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/ajuda" className="story-link hover:text-foreground">Central de Ajuda</Link></li>
              <li><Link to="/envio-e-trocas" className="story-link hover:text-foreground">Envio e Trocas</Link></li>
              <li><Link to="/privacidade" className="story-link hover:text-foreground">Política de Privacidade</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-4 rounded-3xl bg-background p-8 text-center">
          <p className="max-w-xl text-sm text-muted-foreground">
            Trabalhamos com produtos importados de diferentes fabricantes. As embalagens podem variar
            conforme o fornecedor responsável pelo envio.
          </p>
          <Button asChild size="lg" className="rounded-full px-8">
            <Link to="/loja">Ver todos os produtos</Link>
          </Button>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-xs text-muted-foreground md:flex-row">
          <div>© {new Date().getFullYear()} Dermiglow. Todos os direitos reservados.</div>
          <div>Pagamento processado com segurança pela Shopify</div>
        </div>
      </div>
    </footer>
  );
}
