import type { ReactNode } from "react";
import { Delta } from "./Delta";

interface MetricCardProps {
  label: string;
  /** Valor principal (número grande). Ignorado quando semDados. */
  value?: ReactNode;
  /** Linha secundária sob o valor (ex.: data do melhor dia, R$ do CMV). */
  sub?: ReactNode;
  delta?: { pct: number | null; higherIsGood: boolean };
  semDados?: boolean;
  /** Acento dourado no valor (único no card de faturamento). */
  gold?: boolean;
  /** Badge do período (produto — importação manual). */
  badge?: string;
  /** Nota pequena sob o valor (ex.: base consumo). */
  note?: string;
  drilldownHref?: string;
  drilldownLabel?: string;
  /** Etiqueta cinza no rodapé para cards manuais (ex.: "manual · jun/26"). */
  manualTag?: string;
  /** Elemento discreto no rodapé (ex.: sparkline). Oculto quando semDados. */
  chart?: ReactNode;
}

export function MetricCard({
  label,
  value,
  sub,
  delta,
  semDados = false,
  gold = false,
  badge,
  note,
  drilldownHref,
  drilldownLabel = "Ver detalhe",
  manualTag,
  chart,
}: MetricCardProps) {
  return (
    <div className="flex h-full flex-col rounded-xl bg-card p-5 ring-1 ring-white/5 transition-all duration-200 hover:-translate-y-0.5 hover:ring-edge motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs uppercase tracking-wide text-muted">{label}</span>
        {badge && (
          <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[11px] font-medium text-gold">
            {badge}
          </span>
        )}
      </div>

      <div className="mt-3 flex-1">
        {semDados ? (
          <p className="text-2xl font-semibold text-neg">sem dados</p>
        ) : (
          <>
            <p
              className={`text-3xl font-semibold leading-tight tabular-nums ${
                gold ? "text-gold" : "text-fg"
              }`}
            >
              {value}
            </p>
            {sub && <p className="mt-1 text-sm text-muted tabular-nums">{sub}</p>}
            {note && (
              <p className="mt-1 text-[11px] italic text-muted" title={note}>
                {note}
              </p>
            )}
          </>
        )}
      </div>

      <div className="mt-4 min-h-5">
        {!semDados && delta && <Delta pct={delta.pct} higherIsGood={delta.higherIsGood} />}
      </div>

      {!semDados && chart && <div className="mt-3">{chart}</div>}

      {drilldownHref ? (
        <a
          href={drilldownHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1 border-t border-white/5 pt-3 text-xs text-muted transition-colors hover:text-gold"
        >
          {drilldownLabel}
          <span aria-hidden>↗</span>
        </a>
      ) : manualTag ? (
        <span className="mt-4 inline-flex items-center gap-1 border-t border-white/5 pt-3 text-xs text-muted">
          {manualTag}
        </span>
      ) : null}
    </div>
  );
}
