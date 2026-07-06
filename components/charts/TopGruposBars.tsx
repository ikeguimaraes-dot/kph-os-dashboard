"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { TopGrupoItem } from "@/lib/api";
import { formatBRL0 } from "@/lib/format";

// Tons de dourado degradando do acento ao apagado
const TONS = ["#C9A24B", "#B18E43", "#997B3B", "#816833", "#69552B"];

export function TopGruposBars({ itens }: { itens: TopGrupoItem[] }) {
  const reduced = useReducedMotion();
  const max = Math.max(...itens.map((g) => g.valor), 1);

  return (
    <ul className="space-y-3">
      {itens.map((g, i) => {
        const pct = (g.valor / max) * 100;
        return (
          <li key={g.grupo}>
            <div className="mb-1 flex items-baseline justify-between gap-2 text-xs">
              <span className="truncate text-muted">{g.grupo}</span>
              <span className="shrink-0 font-medium text-fg tabular-nums">
                {formatBRL0(g.valor)}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/5">
              <motion.div
                className="h-full rounded-full"
                style={{ background: TONS[i % TONS.length] }}
                initial={{ width: reduced ? `${pct}%` : 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.7, delay: i * 0.08, ease: "easeOut" }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
