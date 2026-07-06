// Camada de dados — UI pura. Consome a API agregadora já pronta em produção.
// Contrato validado em produção (ver README / inspeção do JSON real).

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
  valor: number;
  valor_mes_anterior: number;
  delta_pct: number | null;
  sem_dados: boolean;
}

export interface MelhorDia extends Indicador {
  data: string; // "YYYY-MM-DD"
}

export interface TicketMedio extends Indicador {
  /** Média diária (base consumo, padrão Lorean) — é o valor que exibimos. */
  media_diaria: number;
  divergente: boolean;
}

export interface Cmv extends Indicador {
  cmv_pct: number; // fração: 0.3142 = 31,42%
  cmv_pct_mes_anterior: number;
}

export interface ProdutoMaisVendido {
  produto: string;
  grupo: string;
  valor_liquido: number;
  quantidade: number;
  periodo_label: string; // ex.: "Jan-Jun 2026" (importação manual)
  sem_dados: boolean;
}

export interface MaiorConta extends Indicador {
  nome: string;
}

/**
 * Funcionário que mais vendeu. Campo pode estar AUSENTE na resposta da API
 * (ainda não shippado) — nesse caso tratamos como sem_dados: true.
 */
export interface FuncionarioTop {
  funcionario: string | null;
  valor_liquido: number | null;
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
  empresa: string;
  mes: string; // "YYYY-MM"
  mes_anterior: string;
  gerado_em: string;
  faturamento_mes: Indicador;
  melhor_dia: MelhorDia;
  ticket_medio_mes: TicketMedio;
  clientes_mes: Indicador;
  produto_mais_vendido: ProdutoMaisVendido;
  cmv_mes: Cmv;
  despesa_total_mes: Indicador;
  maior_conta: MaiorConta;
  /** Novo campo — pode estar ausente enquanto a API não shippa. Ver FuncionarioTop. */
  funcionario_top?: FuncionarioTop;
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
