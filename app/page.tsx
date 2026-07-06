"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  DRILLDOWN,
  UNIDADES,
  fetchDashboard,
  type DashboardData,
} from "@/lib/api";
import {
  currentMonth,
  formatAtualizadoEm,
  formatBRL,
  formatBRL0,
  formatDecimal1,
  formatInt,
  formatPctFraction,
  formatWeekdayMonth,
  monthOptions,
  ultimoDiaUtil,
} from "@/lib/format";
import { INDICADORES_MANUAIS } from "@/lib/indicadores-manuais";
import { MetricCard } from "@/components/MetricCard";
import { AlertBanner } from "@/components/AlertBanner";
import { DashboardSkeleton } from "@/components/CardSkeleton";
import { Sidebar } from "@/components/Sidebar";
import { Sparkline } from "@/components/Sparkline";
import { CountUp } from "@/components/CountUp";
import { Delta } from "@/components/Delta";
import { Stagger, Item } from "@/components/motion";
import { FaturamentoChart } from "@/components/charts/FaturamentoChart";
import { CmvGauge } from "@/components/charts/CmvGauge";
import { MixDonut } from "@/components/charts/MixDonut";
import { TopGruposBars } from "@/components/charts/TopGruposBars";

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

  // Dot verde se o último dia útil do mês tem dados importados; vermelho se não.
  const diaUtil = ultimoDiaUtil(mes);
  const serie = data?.serie_diaria_faturamento;
  const dadosEmDia = Boolean(
    diaUtil &&
      serie &&
      !serie.sem_dados &&
      serie.itens.some((p) => p.data === diaUtil),
  );

  return (
    <div className="min-h-screen bg-main">
      <Sidebar />

      <div className="pl-16 lg:pl-56">
        <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <header className="flex flex-col gap-4 pb-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h1
                className="text-3xl font-semibold tracking-tight text-fg sm:text-4xl"
                style={{ fontFamily: "var(--font-fraunces)" }}
              >
                Visão executiva
              </h1>
              {data && !loading && (
                <p className="mt-2 flex items-center gap-2 text-sm text-muted">
                  <span
                    aria-hidden
                    className={`inline-block h-2 w-2 rounded-full ${
                      dadosEmDia ? "animate-pulse-dot bg-pos" : "bg-neg"
                    }`}
                  />
                  atualizado {formatAtualizadoEm(data.gerado_em)}
                  {!dadosEmDia && (
                    <span className="text-neg">· importação pendente</span>
                  )}
                </p>
              )}
            </div>

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
              className="flex flex-col items-start gap-3 rounded-xl border border-alert-border bg-alert-bg p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-fg">
                  Não foi possível carregar o dashboard.
                </p>
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

          {/* Loading */}
          {!error && loading && <DashboardSkeleton />}

          {/* Conteúdo */}
          {!error && !loading && data && (
            <Stagger
              key={`${unidade}-${mes}-${reloadKey}`}
              className="space-y-6"
            >
              <Item>
                <AlertBanner
                  importacao={data.alerta_importacao}
                  contas={data.alerta_contas_faltantes}
                />
              </Item>

              {/* HERO */}
              <Item className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
                <HeroFaturamento data={data} />
                <div className="grid grid-cols-1 gap-4 content-start">
                  <CardCmv data={data} />
                  <CardDespesa data={data} />
                </div>
              </Item>

              {/* LINHA DE GRÁFICOS */}
              <Item className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-[1fr_1.4fr_1fr]">
                <ChartCard
                  label="Mix de pagamentos"
                  semDados={!data.mix_pagamentos || data.mix_pagamentos.sem_dados}
                  drilldownHref={DRILLDOWN.receita}
                >
                  {data.mix_pagamentos && (
                    <MixDonut itens={data.mix_pagamentos.itens} />
                  )}
                </ChartCard>

                <ChartCard
                  label="Top grupos de venda"
                  semDados={!data.top_grupos || data.top_grupos.sem_dados}
                  drilldownHref={DRILLDOWN.analiseVendas}
                >
                  {data.top_grupos && <TopGruposBars itens={data.top_grupos.itens} />}
                </ChartCard>

                <div className="grid grid-cols-1 gap-4 content-start sm:grid-cols-2 xl:grid-cols-1">
                  <MetricCard
                    label="Ticket médio"
                    value={
                      data.ticket_medio_mes.media_diaria != null
                        ? formatBRL(data.ticket_medio_mes.media_diaria)
                        : undefined
                    }
                    note="base consumo (padrão Lorean)"
                    semDados={
                      data.ticket_medio_mes.sem_dados ||
                      data.ticket_medio_mes.media_diaria == null
                    }
                    delta={{
                      pct: data.ticket_medio_mes.delta_pct,
                      higherIsGood: true,
                    }}
                    drilldownHref={DRILLDOWN.receita}
                  />
                  <MetricCard
                    label="Clientes no mês"
                    value={
                      data.clientes_mes.valor != null
                        ? formatInt(data.clientes_mes.valor)
                        : undefined
                    }
                    semDados={
                      data.clientes_mes.sem_dados || data.clientes_mes.valor == null
                    }
                    delta={{ pct: data.clientes_mes.delta_pct, higherIsGood: true }}
                    drilldownHref={DRILLDOWN.receita}
                  />
                </div>
              </Item>

              {/* MELHOR DIA + GORJETA */}
              <Item className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <MetricCard
                  label="Melhor dia"
                  value={
                    data.melhor_dia.valor != null
                      ? formatBRL(data.melhor_dia.valor)
                      : undefined
                  }
                  sub={
                    data.melhor_dia.data
                      ? formatWeekdayMonth(data.melhor_dia.data)
                      : undefined
                  }
                  semDados={data.melhor_dia.sem_dados || data.melhor_dia.valor == null}
                  delta={{ pct: data.melhor_dia.delta_pct, higherIsGood: true }}
                  drilldownHref={DRILLDOWN.receita}
                />
                <CardGorjeta data={data} />
              </Item>

              {/* PRODUTO E DESPESA */}
              <Item className="space-y-4">
                <SectionTitle>Produto e despesa</SectionTitle>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <MetricCard
                    label="Produto mais vendido"
                    value={data.produto_mais_vendido.produto ?? undefined}
                    sub={
                      data.produto_mais_vendido.valor_liquido != null ? (
                        <>
                          {formatBRL(data.produto_mais_vendido.valor_liquido)}
                          {" · "}
                          {formatInt(data.produto_mais_vendido.quantidade ?? 0)} un
                        </>
                      ) : undefined
                    }
                    badge={data.produto_mais_vendido.periodo_label ?? undefined}
                    semDados={
                      data.produto_mais_vendido.sem_dados ||
                      data.produto_mais_vendido.produto == null
                    }
                    drilldownHref={DRILLDOWN.analiseVendas}
                  />
                  <MetricCard
                    label="Maior conta de despesa"
                    value={
                      data.maior_conta.valor != null
                        ? formatBRL(data.maior_conta.valor)
                        : undefined
                    }
                    sub={data.maior_conta.nome ?? undefined}
                    semDados={
                      data.maior_conta.sem_dados || data.maior_conta.valor == null
                    }
                    delta={{ pct: data.maior_conta.delta_pct, higherIsGood: false }}
                    drilldownHref={DRILLDOWN.gerencial}
                  />
                </div>
              </Item>

              {/* EQUIPE E MARKETING */}
              <Item className="space-y-4">
                <SectionTitle>Equipe e marketing</SectionTitle>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {(() => {
                    const ft = data.funcionario_top;
                    const ftSemDados = !ft || ft.sem_dados || ft.funcionario == null;
                    return (
                      <MetricCard
                        label="Funcionário que mais vendeu"
                        value={ft?.funcionario ?? undefined}
                        sub={ft?.valor != null ? formatBRL(ft.valor) : undefined}
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
              </Item>

              <Item>
                <p className="pt-2 text-center text-xs text-muted">
                  Dados gerados em{" "}
                  {new Intl.DateTimeFormat("pt-BR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  }).format(new Date(data.gerado_em))}
                </p>
              </Item>
            </Stagger>
          )}
        </div>
      </div>
    </div>
  );
}

/* --- Cards compostos do layout novo --- */

function HeroFaturamento({ data }: { data: DashboardData }) {
  const f = data.faturamento_mes;
  const semDados = f.sem_dados || f.valor == null;
  const serie = data.serie_diaria_faturamento;
  const temSerie = serie && !serie.sem_dados && serie.itens.length > 1;

  return (
    <div className="flex flex-col rounded-xl bg-card p-6 ring-1 ring-white/5 transition-all duration-200 hover:-translate-y-0.5 hover:ring-edge motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <span className="text-xs uppercase tracking-wide text-muted">
        Faturamento do mês
      </span>

      {semDados ? (
        <p className="mt-3 text-3xl font-semibold text-neg">sem dados</p>
      ) : (
        <>
          <p className="mt-2 text-4xl font-semibold leading-tight text-gold sm:text-5xl">
            <CountUp value={f.valor as number} format={formatBRL} />
          </p>
          <div className="mt-2">
            <Delta pct={f.delta_pct} higherIsGood />
          </div>
          {temSerie && (
            <div className="mt-4">
              <FaturamentoChart
                itens={serie.itens}
                melhorDia={data.melhor_dia.data}
              />
            </div>
          )}
        </>
      )}

      <a
        href={DRILLDOWN.receita}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-1 border-t border-white/5 pt-3 text-xs text-muted transition-colors hover:text-gold"
      >
        Ver detalhe
        <span aria-hidden>↗</span>
      </a>
    </div>
  );
}

function CardCmv({ data }: { data: DashboardData }) {
  const c = data.cmv_mes;
  const semDados = c.sem_dados || c.cmv_pct == null || c.valor == null;

  return (
    <div className="flex flex-col rounded-xl bg-card p-5 ring-1 ring-white/5 transition-all duration-200 hover:-translate-y-0.5 hover:ring-edge motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <span className="text-xs uppercase tracking-wide text-muted">CMV do mês</span>
      <div className="mt-3 flex-1">
        {semDados ? (
          <p className="text-2xl font-semibold text-neg">sem dados</p>
        ) : (
          <>
            <CmvGauge pct={c.cmv_pct as number} valor={c.valor as number} />
            <div className="mt-2">
              <Delta pct={c.delta_pct} higherIsGood={false} />
            </div>
          </>
        )}
      </div>
      <a
        href={DRILLDOWN.cmv}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-1 border-t border-white/5 pt-3 text-xs text-muted transition-colors hover:text-gold"
      >
        Ver detalhe
        <span aria-hidden>↗</span>
      </a>
    </div>
  );
}

function CardDespesa({ data }: { data: DashboardData }) {
  const d = data.despesa_total_mes;
  return (
    <MetricCard
      label="Despesa total"
      value={d.valor != null ? formatBRL(d.valor) : undefined}
      sub={
        data.maior_conta.nome
          ? `maior conta: ${data.maior_conta.nome}`
          : undefined
      }
      semDados={d.sem_dados || d.valor == null}
      delta={{ pct: d.delta_pct, higherIsGood: false }}
      drilldownHref={DRILLDOWN.gerencial}
    />
  );
}

function CardGorjeta({ data }: { data: DashboardData }) {
  const g = data.gorjeta_mes;
  const semDados = !g || g.sem_dados || g.valor == null;
  return (
    <MetricCard
      label="Gorjeta do mês"
      value={g?.valor != null ? formatBRL(g.valor) : undefined}
      sub={
        g?.pct_sobre_faturamento != null
          ? `${formatPctFraction(g.pct_sobre_faturamento)} do faturamento`
          : undefined
      }
      semDados={semDados}
      delta={g ? { pct: g.delta_pct, higherIsGood: true } : undefined}
      chart={
        g && g.serie_diaria?.length > 1 ? (
          <Sparkline values={g.serie_diaria.map((p) => p.valor)} />
        ) : undefined
      }
      drilldownHref={DRILLDOWN.receita}
    />
  );
}

/** Card wrapper para gráficos maiores (donut, barras). */
function ChartCard({
  label,
  semDados,
  drilldownHref,
  children,
}: {
  label: string;
  semDados: boolean;
  drilldownHref: string;
  children: ReactNode;
}) {
  return (
    <div className="flex h-full flex-col rounded-xl bg-card p-5 ring-1 ring-white/5 transition-all duration-200 hover:-translate-y-0.5 hover:ring-edge motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <span className="text-xs uppercase tracking-wide text-muted">{label}</span>
      <div className="mt-4 flex-1">
        {semDados ? (
          <p className="text-2xl font-semibold text-neg">sem dados</p>
        ) : (
          children
        )}
      </div>
      <a
        href={drilldownHref}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-1 border-t border-white/5 pt-3 text-xs text-muted transition-colors hover:text-gold"
      >
        Ver detalhe
        <span aria-hidden>↗</span>
      </a>
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
