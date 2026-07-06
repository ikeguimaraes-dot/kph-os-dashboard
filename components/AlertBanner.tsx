import type { AlertaContasFaltantes, AlertaImportacao } from "@/lib/api";
import { formatWeekdayNumeric } from "@/lib/format";

interface AlertBannerProps {
  importacao: AlertaImportacao;
  contas: AlertaContasFaltantes;
}

/** Faixa de alertas. Só renderiza quando há algo a alertar. */
export function AlertBanner({ importacao, contas }: AlertBannerProps) {
  const temImportacao = importacao?.datas_faltantes?.length > 0;
  const temContas = contas?.nomes?.length > 0;

  if (!temImportacao && !temContas) return null;

  return (
    <div
      role="alert"
      className="rounded-xl border border-alert-border bg-alert-bg p-4"
    >
      <div className="flex items-center gap-2">
        <span aria-hidden className="text-neg">
          ⚠
        </span>
        <h2 className="text-sm font-semibold text-fg">Alertas de dados</h2>
      </div>

      <div className="mt-3 space-y-3 text-sm">
        {temImportacao && (
          <div>
            <p className="text-muted">Dias sem importação:</p>
            <ul className="mt-1 flex flex-wrap gap-2">
              {importacao.datas_faltantes.map((d) => (
                <li
                  key={d}
                  className="rounded-md bg-white/5 px-2 py-1 text-fg tabular-nums"
                >
                  {formatWeekdayNumeric(d)}
                </li>
              ))}
            </ul>
          </div>
        )}

        {temContas && (
          <div>
            <p className="text-muted">Contas esperadas não lançadas:</p>
            <ul className="mt-1 flex flex-wrap gap-2">
              {contas.nomes.map((nome) => (
                <li
                  key={nome}
                  className="rounded-md bg-white/5 px-2 py-1 text-fg"
                >
                  {nome}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
