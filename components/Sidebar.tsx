"use client";

// Sidebar local temporário; substituir quando o dashboard entrar no
// nav-config do shell kph-os.

import {
  ChartNoAxesColumn,
  ClipboardList,
  HeartPulse,
  Landmark,
  LayoutDashboard,
  ShoppingCart,
  Sparkles,
} from "lucide-react";
import { API_BASE, DRILLDOWN } from "@/lib/api";

const LINKS = [
  {
    label: "Financeiro",
    href: DRILLDOWN.receita,
    Icon: Landmark,
  },
  {
    label: "Compras",
    href: "https://kph-os-compras.vercel.app/cardapio",
    Icon: ShoppingCart,
  },
  {
    label: "Análise de vendas",
    href: `${API_BASE}/financeiro/dre/receita/analise-vendas`,
    Icon: ChartNoAxesColumn,
  },
  {
    label: "Ficha Técnica",
    href: "https://kph-os-compras.vercel.app/cardapio",
    Icon: ClipboardList,
  },
  {
    label: "Inteligência",
    href: "https://kph-os-inteligencia.vercel.app/inteligencia/inbox",
    Icon: Sparkles,
  },
  {
    label: "Serena",
    href: "https://madonna-painel.vercel.app/",
    Icon: HeartPulse,
  },
] as const;

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-16 flex-col border-r border-white/5 bg-bg lg:w-56">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center px-2 lg:justify-start lg:px-5">
        <span
          className="text-lg font-semibold tracking-tight text-fg"
          style={{ fontFamily: "var(--font-fraunces)" }}
        >
          <span className="hidden lg:inline">
            KPH <span className="text-gold">OS</span>
          </span>
          <span className="lg:hidden">
            K<span className="text-gold">·</span>
          </span>
        </span>
      </div>

      <nav className="mt-2 flex flex-col gap-1 px-2 lg:px-3">
        {/* Dashboard — item ativo */}
        <span
          aria-current="page"
          className="flex items-center justify-center gap-3 rounded-full bg-gold px-0 py-2.5 text-sm font-semibold text-bg lg:justify-start lg:px-4"
        >
          <LayoutDashboard size={18} strokeWidth={2.2} aria-hidden />
          <span className="hidden lg:inline">Dashboard</span>
        </span>

        {LINKS.map(({ label, href, Icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            title={label}
            className="flex items-center justify-center gap-3 rounded-full px-0 py-2.5 text-sm text-muted transition-colors hover:bg-white/5 hover:text-fg lg:justify-start lg:px-4"
          >
            <Icon size={18} strokeWidth={2} aria-hidden />
            <span className="hidden lg:inline">{label}</span>
          </a>
        ))}
      </nav>

      <div className="mt-auto hidden px-5 pb-5 text-[11px] text-muted/60 lg:block">
        KPH Participações
      </div>
    </aside>
  );
}
