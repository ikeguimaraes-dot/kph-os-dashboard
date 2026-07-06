// Camada de dados — UI pura. Consome a API agregadora já pronta em produção.
// Contrato validado em produção (ver README / inspeção do JSON real).
// Quando sem_dados = true, os campos de valor vêm null e as listas vazias.

export const API_BASE =
  process.env.NEXT_PUBLIC_FINANCEIRO_URL ?? "https://kph-os-financeiro.vercel.app";

export const DRILLDOWN = {
  receita: `${API_BASE}/financeiro/dre/receita`,
  analiseVendas: `${API_BASE}/financeiro/dre/receita/analise-vendas`,
  cmv: `${API_BASE}/financeiro/dre/cmv`,
  gerencial: `${API_BASE}/financeiro/dre/gerencial`,
} as const;

export const UNIDADES = [
  { id: "674eac8c-5a38-4a42-aa60-0a666387909b", nome: "Meet & Eat" },
  { id: "f9c6c7fc-2ecc-4f79-98ce-c3118b670182", nome: "Madonna SP Itaim" },
] as const;

// --- Tipos derivados do JSON REAL da API ---

/** Indicador numérico padrão. delta_pct = null quando mês anterior sem dados. */
export interface Indicador {
  valor: number | null;
  valor_mes_anterior: number | null;
  delta_pct: number | null;
  sem_dados: boolean;
}

export interface MelhorDia extends Indicador {
  data: string | null; // "YYYY-MM-DD"
}

export interface TicketMedio extends Indicador {
  /** Média diária (base consumo, padrão Lorean) — é o valor que exibimos. */
  media_diaria: number | null;
  divergente: boolean;
}

export interface SerieDiariaPonto {
  data: string; // "YYYY-MM-DD"
  valor: number;
}

/** Gorjeta do mês. Ausente na resposta → tratar como sem_dados. */
export interface GorjetaMes extends Indicador {
  pct_sobre_faturamento: number | null; // fração: 0.1099 = 10,99%
  serie_diaria: SerieDiariaPonto[];
}

/** Série diária de faturamento — alimenta o gráfico do hero. */
export interface SerieDiariaFaturamento {
  itens: SerieDiariaPonto[];
  sem_dados: boolean;
}

export interface MixPagamentoItem {
  forma: string;
  valor: number;
  pct: number; // fração
}

export interface MixPagamentos {
  itens: MixPagamentoItem[];
  sem_dados: boolean;
}

export interface TopGrupoItem {
  grupo: string;
  valor: number;
}

export interface TopGrupos {
  itens: TopGrupoItem[];
  sem_dados: boolean;
}

export interface Cmv extends Indicador {
  cmv_pct: number | null; // fração: 0.3142 = 31,42%
  cmv_pct_mes_anterior: number | null;
}

export interface ProdutoMaisVendido {
  produto: string | null;
  grupo: string | null;
  valor_liquido: number | null;
  quantidade: number | null;
  periodo_label: string | null; // ex.: "Jan-Jun 2026" (importação manual)
  sem_dados: boolean;
}

export interface MaiorConta extends Indicador {
  nome: string | null;
}

/**
 * Funcionário que mais vendeu — shape REAL de produção usa `valor`
 * (não valor_liquido). Ausente na resposta → tratar como sem_dados.
 */
export interface FuncionarioTop {
  funcionario: string | null;
  valor: number | null;
  periodo_label: string | null;
  sem_dados: boolean;
}

export interface AlertaImportacao {
  datas_faltantes: string[]; // ["YYYY-MM-DD", ...]
  total: number;
}

export interface AlertaContasFaltantes {
  nomes: string[];
  sem_empresa: boolean;
}

export interface DashboardData {
  unidade: string;
  empresa: string | null;
  mes: string; // "YYYY-MM"
  mes_anterior: string;
  gerado_em: string;
  faturamento_mes: Indicador;
  melhor_dia: MelhorDia;
  ticket_medio_mes: TicketMedio;
  clientes_mes: Indicador;
  /** Pode estar ausente em ambientes antigos da API. */
  gorjeta_mes?: GorjetaMes;
  serie_diaria_faturamento?: SerieDiariaFaturamento;
  mix_pagamentos?: MixPagamentos;
  top_grupos?: TopGrupos;
  produto_mais_vendido: ProdutoMaisVendido;
  funcionario_top?: FuncionarioTop;
  cmv_mes: Cmv;
  despesa_total_mes: Indicador;
  maior_conta: MaiorConta;
  alerta_importacao: AlertaImportacao;
  alerta_contas_faltantes: AlertaContasFaltantes;
}

export async function fetchDashboard(
  unidade: string,
  mes: string,
  signal?: AbortSignal,
): Promise<DashboardData> {
  const url = `${API_BASE}/api/dashboard?unidade=${encodeURIComponent(
    unidade,
  )}&mes=${encodeURIComponent(mes)}`;
  const res = await fetch(url, { signal, cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Falha ao buscar dados (HTTP ${res.status}).`);
  }
  return (await res.json()) as DashboardData;
}
