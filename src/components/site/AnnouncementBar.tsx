import { Sparkles, CreditCard, Headphones, Truck } from "lucide-react";

export function AnnouncementBar() {
  const items = [
    { icon: Truck, text: "Portfólio demonstrativo • Sem vendas reais" },
    { icon: Sparkles, text: "Curadoria de skincare asiático" },
    { icon: CreditCard, text: "Produtos e preços ilustrativos" },
    { icon: Headphones, text: "Suporte especializado" },
  ];
  return (
    <div className="bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-5 gap-y-1.5 px-4 py-2 text-[10px] uppercase tracking-widest md:px-8 md:text-[11px]">
        {items.map(({ icon: Icon, text }, i) => (
          <div
            key={text}
            className={`flex items-center gap-2 ${i === 2 ? "hidden sm:flex" : ""} ${i === 3 ? "hidden lg:flex" : ""}`}
          >
            <Icon className="h-3 w-3 shrink-0" strokeWidth={2} />
            <span>{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
