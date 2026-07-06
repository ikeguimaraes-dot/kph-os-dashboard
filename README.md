# KPH Dashboard

UI executiva (cards) do KPH OS. **UI pura**: sem Supabase, sem service role,
sem rotas de API de dados. Consome uma única API agregadora já pronta em
produção:

```
GET https://kph-os-financeiro.vercel.app/api/dashboard?unidade=<unit_id>&mes=<YYYY-MM>
```

Stack: **Next.js 16** (App Router) + **TypeScript** + **Tailwind CSS v4**.

## Rodando localmente

```bash
cp .env.example .env.local   # opcional (há default de produção embutido)
npm install
npm run dev                  # http://localhost:3000
npm run build                # build de produção
```

## Variável de ambiente

| Variável                     | Obrigatória | Default                                 |
| ---------------------------- | ----------- | --------------------------------------- |
| `NEXT_PUBLIC_FINANCEIRO_URL` | Não         | `https://kph-os-financeiro.vercel.app`  |

Se ausente, o app usa o default de produção. Defina-a na Vercel apenas se
apontar para outro ambiente da API.

## Unidades

| Nome              | `unidade` (id)                          |
| ----------------- | --------------------------------------- |
| Meet & Eat        | `674eac8c-5a38-4a42-aa60-0a666387909b`  |
| Madonna SP Itaim  | `f9c6c7fc-2ecc-4f79-98ce-c3118b670182`  |

Seletores de unidade e mês são estado local (`useState`) — nunca `router.push`.
Uma única chamada por combinação unidade+mês; refetch ao trocar seletor.

## Contrato da API (tipado em `lib/api.ts`)

Cada indicador numérico: `{ valor, valor_mes_anterior, delta_pct, sem_dados }`.
`delta_pct = null` quando o mês anterior não tem dados → delta não é exibido.

- `ticket_medio_mes` — traz `valor` **e** `media_diaria`. Exibimos a
  **média diária** (base consumo, padrão Lorean), não faturamento÷clientes.
- `cmv_mes` — traz `cmv_pct` / `cmv_pct_mes_anterior` (frações).
- `produto_mais_vendido` — `produto`, `grupo`, `valor_liquido`, `quantidade`,
  `periodo_label` (badge dourado — importação manual).
- `alerta_importacao` — `{ datas_faltantes, total }`.
- `alerta_contas_faltantes` — `{ nomes, sem_empresa }`.

Semântica do delta: receita/clientes/ticket subindo = verde; despesa/CMV
subindo = vermelho. `sem_dados = true` → o card mostra "sem dados" em vermelho
(nunca zero silencioso).

## Deploy na Vercel (checklist — feito manualmente pelo dono)

1. **New Project → Import Git Repository** → `ikeguimaraes-dot/kph-os-dashboard`.
2. Framework Preset: **Next.js** (detectado automaticamente). Build/Output
   padrão — **não** definir `basePath`, **não** alterar output.
3. **Environment Variables** (opcional): `NEXT_PUBLIC_FINANCEIRO_URL` =
   `https://kph-os-financeiro.vercel.app` (Production + Preview). Pode pular se
   for usar o default embutido.
4. **Deploy**. Nada de banco, secrets ou service role — é UI pura.
