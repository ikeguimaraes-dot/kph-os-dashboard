"use client";

import {
  Area,
  AreaChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useReducedMotion } from "framer-motion";
import type { SerieDiariaPonto } from "@/lib/api";
import { formatBRL } from "@/lib/format";

interface FaturamentoChartProps {
  itens: SerieDiariaPonto[];
  /** "YYYY-MM-DD" do melhor dia — recebe um dot destacado. */
  melhorDia?: string | null;
}

interface Ponto {
  dia: string;
  valor: number;
}

function TooltipEscuro({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value?: number | string }[];
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;
  const v = Number(payload[0].value);
  return (
    <div className="rounded-lg border border-edge bg-card px-3 py-2 text-xs shadow-lg">
      <p className="text-muted">dia {label}</p>
      <p className="mt-0.5 font-medium text-fg tabular-nums">{formatBRL(v)}</p>
    </div>
  );
}

export function FaturamentoChart({ itens, melhorDia }: FaturamentoChartProps) {
  const reduced = useReducedMotion();

  const data: Ponto[] = itens.map((p) => ({
    dia: String(Number(p.data.slice(8, 10))),
    valor: p.valor,
  }));

  const melhorDiaKey = melhorDia ? String(Number(melhorDia.slice(8, 10))) : null;
  const melhorPonto = melhorDiaKey
    ? data.find((p) => p.dia === melhorDiaKey)
    : undefined;

  return (
    <div className="h-44 w-full sm:h-52">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          <defs>
            <linearGradient id="fillGold" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C9A24B" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#C9A24B" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="dia"
            tick={{ fill: "#8A8F99", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval={Math.max(0, Math.ceil(data.length / 7) - 1)}
          />
          <YAxis hide domain={["auto", "auto"]} />
          <Tooltip
            content={<TooltipEscuro />}
            cursor={{ stroke: "#2A2E36", strokeDasharray: "3 3" }}
          />
          <Area
            type="monotone"
            dataKey="valor"
            stroke="#C9A24B"
            strokeWidth={2}
            fill="url(#fillGold)"
            isAnimationActive={!reduced}
            animationDuration={900}
            animationEasing="ease-out"
          />
          {melhorPonto && (
            <ReferenceDot
              x={melhorPonto.dia}
              y={melhorPonto.valor}
              r={4}
              fill="#C9A24B"
              stroke="#0A0C10"
              strokeWidth={2}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
