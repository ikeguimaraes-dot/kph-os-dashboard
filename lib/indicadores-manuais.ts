// Valores atualizados manualmente. Futuramente migrar para tabela
// indicadores_manuais no Supabase.

export interface IndicadoresManuais {
  /** Etiqueta exibida nos cards manuais: "manual · <referencia>". */
  referencia: string;
  /** Média do mês. null → card mostra "sem dados" até ser editado aqui. */
  nota_nutricionista: number | null;
  nota_google: number;
  meta_ads_gasto: number;
  ads_clicks: number;
  serena_clientes: number;
}

export const INDICADORES_MANUAIS: IndicadoresManuais = {
  referencia: "jun/26",
  nota_nutricionista: null,
  nota_google: 4.8,
  meta_ads_gasto: 30000,
  ads_clicks: 150,
  serena_clientes: 320,
};
