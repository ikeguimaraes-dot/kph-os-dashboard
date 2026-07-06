"use client";

import { motion, useReducedMotion } from "framer-motion";
import { formatBRL, formatPctFraction } from "@/lib/format";

interface CmvGaugeProps {
  /** Fração: 0.3142 = 31,42%. */
  pct: number;
  valor: number;
}

// Faixas: verde ≤ 32% · âmbar 32–38% · vermelho > 38%
function faixa(pct: number): { cor: string; label: string } {
  if (pct <= 0.32) return { cor: "#4EA87A", label: "saudável (≤ 32%)" };
  if (pct <= 0.38) return { cor: "#D9913C", label: "atenção (32–38%)" };
  return { cor: "#E0645F", label: "crítico (> 38%)" };
}

// Semicírculo: escala 0–50% de CMV ocupa o arco inteiro.
const ARC_MAX = 0.5;

export function CmvGauge({ pct, valor }: CmvGaugeProps) {
  const reduced = useReducedMotion();
  const { cor, label } = faixa(pct);

  const r = 56;
  const cx = 70;
  const cy = 66;
  const arcLen = Math.PI * r;
  const frac = Math.min(pct / ARC_MAX, 1);
  const d = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;

  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0">
        <svg width={140} height={78} viewBox="0 0 140 78" aria-hidden>
          <path
            d={d}
            fill="none"
            stroke="#2A2E36"
            strokeWidth={10}
            strokeLinecap="round"
          />
          <motion.path
            d={d}
            fill="none"
            stroke={cor}
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={arcLen}
            initial={{ strokeDashoffset: reduced ? arcLen * (1 - frac) : arcLen }}
            animate={{ strokeDashoffset: arcLen * (1 - frac) }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-x-0 bottom-0 text-center">
          <span className="text-xl font-semibold text-fg tabular-nums">
            {formatPctFraction(pct)}
          </span>
        </div>
      </div>
      <div className="min-w-0">
        <p className="text-sm text-fg tabular-nums">{formatBRL(valor)}</p>
        <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: cor }}
            aria-hidden
          />
          {label}
        </p>
      </div>
    </div>
  );
}
