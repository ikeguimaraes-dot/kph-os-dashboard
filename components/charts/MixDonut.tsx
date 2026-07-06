"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useReducedMotion } from "framer-motion";
import type { MixPagamentoItem } from "@/lib/api";
import { formatBRL, formatPctFraction } from "@/lib/format";

// Dourado + azul-acinzentado + cinzas
const CORES = ["#C9A24B", "#5B6B84", "#8A8F99", "#565B66", "#3A3F49", "#2A2E36"];

function TooltipEscuro({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name?: string; value?: number | string }[];
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-edge bg-card px-3 py-2 text-xs shadow-lg">
      <p className="text-muted">{payload[0].name}</p>
      <p className="mt-0.5 font-medium text-fg tabular-nums">
        {formatBRL(Number(payload[0].value))}
      </p>
    </div>
  );
}

export function MixDonut({ itens }: { itens: MixPagamentoItem[] }) {
  const reduced = useReducedMotion();

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="h-36 w-36 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={itens}
              dataKey="valor"
              nameKey="forma"
              innerRadius="72%"
              outerRadius="100%"
              paddingAngle={2}
              stroke="none"
              isAnimationActive={!reduced}
              animationDuration={800}
            >
              {itens.map((item, i) => (
                <Cell key={item.forma} fill={CORES[i % CORES.length]} />
              ))}
            </Pie>
            <Tooltip content={<TooltipEscuro />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="w-full min-w-0 space-y-1.5 text-xs">
        {itens.map((item, i) => (
          <li key={item.forma} className="flex items-center gap-2">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: CORES[i % CORES.length] }}
              aria-hidden
            />
            <span className="truncate text-muted">{item.forma}</span>
            <span className="ml-auto font-medium text-fg tabular-nums">
              {formatPctFraction(item.pct)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
