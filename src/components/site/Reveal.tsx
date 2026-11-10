import type { ReactNode } from "react";
import { useReveal } from "@/hooks/use-reveal";

type Props = {
  children: ReactNode;
  /** atraso em ms para escalonar itens em grade */
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li";
};

export function Reveal({ children, delay = 0, className = "", as = "div" }: Props) {
  const { ref, shown } = useReveal<HTMLDivElement>();
  const Tag = as as "div";

  return (
    <Tag
      ref={ref}
      className={`reveal ${shown ? "reveal-in" : ""} ${className}`.trim()}
      style={{ transitionDelay: shown && delay ? `${delay}ms` : undefined }}
    >
      {children}
    </Tag>
  );
}
