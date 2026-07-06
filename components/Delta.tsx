import { formatDeltaPct } from "@/lib/format";

interface DeltaProps {
  /** delta_pct da API (já em pontos percentuais). null = mês anterior sem dados. */
  pct: number | null;
  /** true para receita/clientes/ticket (subir = bom); false para despesa/CMV. */
  higherIsGood: boolean;
}

/** Delta com seta e % vs mês anterior. Não renderiza quando pct = null. */
export function Delta({ pct, higherIsGood }: DeltaProps) {
  if (pct === null) return null;

  const neutral = pct === 0;
  const up = pct > 0;
  const isGood = neutral ? true : up === higherIsGood;
  const color = neutral ? "text-muted" : isGood ? "text-pos" : "text-neg";
  const arrow = neutral ? "→" : up ? "▲" : "▼";

  return (
    <span className={`inline-flex items-center gap-1 text-sm font-medium ${color}`}>
      <span aria-hidden>{arrow}</span>
      <span>{formatDeltaPct(pct)}</span>
      <span className="text-muted font-normal">vs. mês anterior</span>
    </span>
  );
}
