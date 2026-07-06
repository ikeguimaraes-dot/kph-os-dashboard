// Formatação pt-BR e utilitários de data. Evita silêncio de zeros e TZ shift.

const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const NUM = new Intl.NumberFormat("pt-BR");

const PCT1 = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const BRL0 = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const DEC1 = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function formatBRL(v: number): string {
  return BRL.format(v);
}

/** Moeda sem centavos: 30000 → "R$ 30.000". */
export function formatBRL0(v: number): string {
  return BRL0.format(v);
}

/** Número com 1 casa decimal: 4.7 → "4,7". */
export function formatDecimal1(v: number): string {
  return DEC1.format(v);
}

export function formatInt(v: number): string {
  return NUM.format(Math.round(v));
}

/** Recebe fração (0.3142) → "31,4%". */
export function formatPctFraction(frac: number): string {
  return `${PCT1.format(frac * 100)}%`;
}

/** delta_pct já vem como percentual (979.06 → "979,1%"). */
export function formatDeltaPct(pct: number): string {
  return `${PCT1.format(Math.abs(pct))}%`;
}

/** Parse "YYYY-MM-DD" como data LOCAL (sem shift de fuso). */
export function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function weekdayShort(date: Date): string {
  // "seg.", "sáb." → remove o ponto
  return new Intl.DateTimeFormat("pt-BR", { weekday: "short" })
    .format(date)
    .replace(".", "");
}

function monthShort(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", { month: "short" })
    .format(date)
    .replace(".", "");
}

/** Alertas: "seg 29/06". */
export function formatWeekdayNumeric(iso: string): string {
  const d = parseLocalDate(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${weekdayShort(d)} ${dd}/${mm}`;
}

/** Melhor dia: "sáb, 14/jun". */
export function formatWeekdayMonth(iso: string): string {
  const d = parseLocalDate(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  return `${weekdayShort(d)}, ${dd}/${monthShort(d)}`;
}

/** "hoje, 13h" ou "06/07, 13h" a partir do gerado_em da API. */
export function formatAtualizadoEm(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const mesmoDia =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  const hora = `${d.getHours()}h`;
  if (mesmoDia) return `hoje, ${hora}`;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}, ${hora}`;
}

/**
 * Último dia útil (seg–sex) do mês selecionado, limitado a ontem quando
 * o mês é o corrente. null quando não há dia útil elegível (ex.: mês futuro).
 */
export function ultimoDiaUtil(mes: string): string | null {
  const [y, m] = mes.split("-").map(Number);
  const hoje = new Date();
  const ontem = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - 1);
  const fimDoMes = new Date(y, m, 0); // último dia do mês selecionado
  let d = fimDoMes > ontem ? ontem : fimDoMes;
  // recua até um dia útil dentro do mês selecionado
  while (d.getDay() === 0 || d.getDay() === 6) {
    d = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1);
  }
  if (d.getFullYear() !== y || d.getMonth() !== m - 1) return null;
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${String(m).padStart(2, "0")}-${dd}`;
}

/** "YYYY-MM" atual (mês corrente, local). */
export function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/** Lista de meses (mais recente primeiro) a partir de um mês inicial até hoje. */
export function monthOptions(count = 18): { value: string; label: string }[] {
  const now = new Date();
  const out: { value: string; label: string }[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = new Intl.DateTimeFormat("pt-BR", {
      month: "long",
      year: "numeric",
    }).format(d);
    out.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) });
  }
  return out;
}
