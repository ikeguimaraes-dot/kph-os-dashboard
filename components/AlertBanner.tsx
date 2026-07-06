import { TriangleAlert } from "lucide-react";
import type { AlertaContasFaltantes, AlertaImportacao } from "@/lib/api";
import { formatWeekdayNumeric } from "@/lib/format";

interface AlertBannerProps {
  importacao: AlertaImportacao;
  contas: AlertaContasFaltantes;
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-alert-border bg-alert-bg px-3 py-1.5 text-xs text-fg">
      <TriangleAlert size={13} className="shrink-0 text-neg" aria-hidden />
      {children}
    </span>
  );
}

/** Faixa de alertas compacta (pills). Só renderiza quando há alerta. */
export function AlertBanner({ importacao, contas }: AlertBannerProps) {
  const temImportacao = importacao?.datas_faltantes?.length > 0;
  const temContas = contas?.nomes?.length > 0;

  if (!temImportacao && !temContas) return null;

  return (
    <div role="alert" className="flex flex-wrap gap-2">
      {temImportacao && (
        <Pill>
          <span className="text-muted">Sem importação:</span>
          <span className="tabular-nums">
            {importacao.datas_faltantes.map(formatWeekdayNumeric).join(" · ")}
          </span>
        </Pill>
      )}
      {temContas && (
        <Pill>
          <span className="text-muted">Contas não lançadas:</span>
          {contas.nomes.join(", ")}
        </Pill>
      )}
    </div>
  );
}
