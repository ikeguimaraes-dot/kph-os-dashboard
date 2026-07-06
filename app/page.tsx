"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DRILLDOWN,
  UNIDADES,
  fetchDashboard,
  type DashboardData,
} from "@/lib/api";
import {
  currentMonth,
  formatBRL,
  formatBRL0,
  formatDecimal1,
  formatInt,
  formatPctFraction,
  formatWeekdayMonth,
  monthOptions,
} from "@/lib/format";
import { INDICADORES_MANUAIS } from "@/lib/indicadores-manuais";
import { MetricCard } from "@/components/MetricCard";
import { AlertBanner } from "@/components/AlertBanner";
import { CardSkeletonGrid } from "@/components/CardSkeleton";
import { Sparkline } from "@/components/Sparkline";

const MESES = monthOptions(18);

export default function Home() {
  const [unidade, setUnidade] = useState<string>(UNIDADES[0].id);
  const [mes, setMes] = useState<string>(currentMonth());
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState<number>(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetchDashboard(unidade, mes, controller.signal)
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(
          err instanceof Error ? err.message : "Erro inesperado ao buscar dados.",
        );
        setLoading(false);
      });

    return () => controller.abort();
  }, [unidade, mes, reloadKey]);

  const retry = useCallback(() => setReloadKey((k) => k + 1), []);

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Topo */}
        <header className="flex flex-col gap-4 border-b border-white/5 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <h1
            className="text-3xl font-semibold tracking-tight text-fg sm:text-4xl"
            style={{ fontFamily: "var(--font-fraunces)" }}
          >
            KPH Dashboard
          </h1>

          <div className="flex flex-wrap gap-3">
            <label className="flex flex-col gap-1 text-xs text-muted">
              Unidade
              <select
                value={unidade}
                onChange={(e) => setUnidade(e.target.value)}
                className="rounded-lg border border-white/10 bg-card px-3 py-2 text-sm text-fg"
              >
                {UNIDADES.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nome}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-xs text-muted">
              Mês
              <select
                value={mes}
                onChange={(e) => setMes(e.target.value)}
                className="rounded-lg border border-white/10 bg-card px-3 py-2 text-sm text-fg"
              >
                {MESES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </header>

        {/* Erro */}
        {error && !loading && (
          <div
            role="alert"
            className="mt-6 flex flex-col items-start gap-3 rounded-xl border border-alert-border bg-alert-bg p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium text-fg">Não foi possível carregar o dashboard.</p>
              <p className="text-sm text-muted">{error}</p>
            </div>
            <button
              onClick={retry}
              className="rounded-lg bg-gold px-4 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-90"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Conteúdo */}
        {!error && (
          <main className="mt-6 space-y-10">
            {loading ? (
              <>
                <section className="space-y-4">
                  <SectionTitle>Receita</SectionTitle>
                  <CardSkeletonGrid />
                </section>
                <section className="space-y-4">
                  <SectionTitle>Produto e despesa</SectionTitle>
                  <CardSkeletonGrid />
                </section>
              </>
            ) : data ? (
              <>
                <AlertBanner
                  importacao={data.alerta_importacao}
                  contas={data.alerta_contas_faltantes}
                />

                {/* RECEITA */}
                <section className="space-y-4">
                  <SectionTitle>Receita</SectionTitle>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                      label="Faturamento do mês"
                      value={formatBRL(data.faturamento_mes.valor)}
                      gold
                      semDados={data.faturamento_mes.sem_dados}
                      delta={{
                        pct: data.faturamento_mes.delta_pct,
                        higherIsGood: true,
                      }}
                      drilldownHref={DRILLDOWN.receita}
                    />
                    <MetricCard
                      label="Melhor dia"
                      value={formatBRL(data.melhor_dia.valor)}
                      sub={formatWeekdayMonth(data.melhor_dia.data)}
                      semDados={data.melhor_dia.sem_dados}
                      delta={{ pct: data.melhor_dia.delta_pct, higherIsGood: true }}
                      drilldownHref={DRILLDOWN.receita}
                    />
                    <MetricCard
                      label="Ticket médio"
                      value={formatBRL(data.ticket_medio_mes.media_diaria)}
                      note="base consumo (padrão Lorean)"
                      semDados={data.ticket_medio_mes.sem_dados}
                      delta={{
                        pct: data.ticket_medio_mes.delta_pct,
                        higherIsGood: true,
                      }}
                      drilldownHref={DRILLDOWN.receita}
                    />
                    <MetricCard
                      label="Clientes no mês"
                      value={formatInt(data.clientes_mes.valor)}
                      semDados={data.clientes_mes.sem_dados}
                      delta={{ pct: data.clientes_mes.delta_pct, higherIsGood: true }}
                      drilldownHref={DRILLDOWN.receita}
                    />
                    {(() => {
                      const g = data.gorjeta_mes;
                      const gSemDados = !g || g.sem_dados;
                      return (
                        <MetricCard
                          label="Gorjeta do mês"
                          value={g ? formatBRL(g.valor) : undefined}
                          sub={
                            g
                              ? `${formatPctFraction(g.pct_sobre_faturamento)} do faturamento`
                              : undefined
                          }
                          semDados={gSemDados}
                          delta={
                            g ? { pct: g.delta_pct, higherIsGood: true } : undefined
                          }
                          chart={
                            g && g.serie_diaria?.length ? (
                              <Sparkline
                                values={g.serie_diaria.map((p) => p.valor)}
                              />
                            ) : undefined
                          }
                          drilldownHref={DRILLDOWN.receita}
                        />
                      );
                    })()}
                  </div>
                </section>

                {/* PRODUTO E DESPESA */}
                <section className="space-y-4">
                  <SectionTitle>Produto e despesa</SectionTitle>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                      label="Produto mais vendido"
                      value={data.produto_mais_vendido.produto}
                      sub={
                        <>
                          {formatBRL(data.produto_mais_vendido.valor_liquido)}
                          {" · "}
                          {formatInt(data.produto_mais_vendido.quantidade)} un
                        </>
                      }
                      badge={data.produto_mais_vendido.periodo_label}
                      semDados={data.produto_mais_vendido.sem_dados}
                      drilldownHref={DRILLDOWN.analiseVendas}
                    />
                    <MetricCard
                      label="CMV do mês"
                      value={formatPctFraction(data.cmv_mes.cmv_pct)}
                      sub={formatBRL(data.cmv_mes.valor)}
                      semDados={data.cmv_mes.sem_dados}
                      delta={{ pct: data.cmv_mes.delta_pct, higherIsGood: false }}
                      drilldownHref={DRILLDOWN.cmv}
                    />
                    <MetricCard
                      label="Despesa total"
                      value={formatBRL(data.despesa_total_mes.valor)}
                      semDados={data.despesa_total_mes.sem_dados}
                      delta={{
                        pct: data.despesa_total_mes.delta_pct,
                        higherIsGood: false,
                      }}
                      drilldownHref={DRILLDOWN.gerencial}
                    />
                    <MetricCard
                      label="Maior conta de despesa"
                      value={formatBRL(data.maior_conta.valor)}
                      sub={data.maior_conta.nome}
                      semDados={data.maior_conta.sem_dados}
                      delta={{ pct: data.maior_conta.delta_pct, higherIsGood: false }}
                      drilldownHref={DRILLDOWN.gerencial}
                    />
                  </div>
                </section>

                {/* EQUIPE E MARKETING */}
                <section className="space-y-4">
                  <SectionTitle>Equipe e marketing</SectionTitle>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {(() => {
                      const ft = data.funcionario_top;
                      const ftSemDados =
                        !ft || ft.sem_dados || ft.funcionario == null;
                      return (
                        <MetricCard
                          label="Funcionário que mais vendeu"
                          value={ft?.funcionario ?? undefined}
                          sub={
                            ft?.valor_liquido != null
                              ? formatBRL(ft.valor_liquido)
                              : undefined
                          }
                          badge={ft?.periodo_label ?? undefined}
                          semDados={ftSemDados}
                          drilldownHref={DRILLDOWN.analiseVendas}
                        />
                      );
                    })()}

                    <MetricCard
                      label="Nota nutricionista — média do mês"
                      value={
                        INDICADORES_MANUAIS.nota_nutricionista != null
                          ? formatDecimal1(INDICADORES_MANUAIS.nota_nutricionista)
                          : undefined
                      }
                      semDados={INDICADORES_MANUAIS.nota_nutricionista == null}
                      manualTag={`manual · ${INDICADORES_MANUAIS.referencia}`}
                    />

                    <MetricCard
                      label="Nota Google"
                      value={`${formatDecimal1(INDICADORES_MANUAIS.nota_google)} ★`}
                      manualTag={`manual · ${INDICADORES_MANUAIS.referencia}`}
                    />

                    <MetricCard
                      label="Gasto Meta Ads no mês"
                      value={formatBRL0(INDICADORES_MANUAIS.meta_ads_gasto)}
                      manualTag={`manual · ${INDICADORES_MANUAIS.referencia}`}
                    />

                    <MetricCard
                      label="Clicks em ads no mês"
                      value={formatInt(INDICADORES_MANUAIS.ads_clicks)}
                      manualTag={`manual · ${INDICADORES_MANUAIS.referencia}`}
                    />

                    <MetricCard
                      label="Serena — clientes atendidos no mês"
                      value={formatInt(INDICADORES_MANUAIS.serena_clientes)}
                      manualTag={`manual · ${INDICADORES_MANUAIS.referencia}`}
                    />
                  </div>
                </section>

                <p className="pt-2 text-center text-xs text-muted">
                  Dados gerados em{" "}
                  {new Intl.DateTimeFormat("pt-BR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  }).format(new Date(data.gerado_em))}
                </p>
              </>
            ) : null}
          </main>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-lg font-medium text-fg"
      style={{ fontFamily: "var(--font-fraunces)" }}
    >
      {children}
    </h2>
  );
}
