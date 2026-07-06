import Papa from "papaparse";

// ============================================================================
// Camada de dados do Meta Ads (framework-agnóstica).
// Responsabilidades: ler o CSV, detectar quais colunas existem (o schema varia
// de export para export), converter célula vazia em `null` (nunca 0) e agregar
// as métricas RECALCULANDO dos totais — nunca fazendo média das linhas.
// A agregação é exposta em `summarizeRows`/`groupRows` para poder rodar também
// sobre um subconjunto filtrado (ex.: uma única campanha).
// ============================================================================

// Métricas canônicas que o app entende. Um arquivo pode ter só um subconjunto.
export type MetricKey =
    | "spend"
    | "impressions"
    | "reach"
    | "linkClicks"
    | "conversations"
    | "frequency"
    | "ctr"
    | "cpc"
    | "cpm"
    | "results"
    | "costPerResult"
    | "roas"
    | "revenue";

// Rótulos em PT-BR para exibição.
export const METRIC_LABELS: Record<MetricKey, string> = {
    spend: "Gasto",
    impressions: "Impressões",
    reach: "Alcance",
    linkClicks: "Cliques no link",
    conversations: "Conversas por mensagem",
    frequency: "Frequência",
    ctr: "CTR",
    cpc: "CPC",
    cpm: "CPM",
    results: "Resultados",
    costPerResult: "Custo por resultado",
    roas: "ROAS",
    revenue: "Receita",
};

// Dicionário de sinônimos: nome de coluna (minúsculo) → métrica canônica.
// Cobre os nomes do Meta em PT-BR e alguns equivalentes em inglês, para o caso
// de exports com cabeçalho diferente. Só precisamos mapear as colunas de origem;
// results/revenue/ctr são derivadas mais abaixo.
const COLUMN_ALIASES: Record<string, string[]> = {
    campaign: ["nome da campanha", "campaign name"],
    adset: ["nome do conjunto de anúncios", "ad set name"],
    spend: ["valor usado (brl)", "valor gasto", "amount spent (brl)", "spend"],
    impressions: ["impressões", "impressions"],
    reach: ["alcance", "reach"],
    linkClicks: ["cliques no link", "link clicks", "cliques"],
    conversations: ["conversas por mensagem iniciadas"],
    frequency: ["frequência", "frequency"],
    cpc: ["cpc (custo por clique no link)", "cpc"],
    cpm: ["cpm (custo por 1.000 impressões)", "cpm"],
    costPerResult: ["custo por resultado", "cost per result"],
    roas: ["roas de resultados", "roas", "purchase roas"],
    reportStart: ["início dos relatórios", "reporting starts"],
    reportEnd: ["encerramento dos relatórios", "reporting ends"],
};

// Uma linha já normalizada (um conjunto de anúncios). Métrica ausente = null.
export interface AnalysisRow {
    campaign: string;
    adset: string;
    spend: number | null;
    impressions: number | null;
    reach: number | null;
    linkClicks: number | null;
    conversations: number | null;
    frequency: number | null;
    cpc: number | null;
    cpm: number | null;
    costPerResult: number | null;
    roas: number | null;
    results: number | null; // derivada: gasto ÷ custo por resultado
    revenue: number | null; // derivada: gasto × ROAS
}

export interface Totals {
    spend: number | null;
    impressions: number | null;
    reach: number | null;
    linkClicks: number | null;
    conversations: number | null;
    frequency: number | null;
    ctr: number | null; // fração (0–1); formate com fmtPct
    cpc: number | null;
    cpm: number | null;
    results: number | null;
    costPerResult: number | null;
    roas: number | null;
    revenue: number | null;
}

// Quebra por dimensão (campanha ou conjunto), usada nos gráficos.
export interface DimensionBreakdown {
    name: string;
    spend: number;
    impressions: number;
    linkClicks: number;
    results: number | null;
    revenue: number | null;
}

export interface AnalysisResult {
    rows: AnalysisRow[];
    period: { start: string | null; end: string | null };
    detected: MetricKey[]; // métricas que este arquivo sustenta (nível do arquivo)
    totals: Totals; // agregados de TODAS as linhas
    byCampaign: DimensionBreakdown[]; // quebra por campanha (todas as linhas)
}

// Converte célula em número. Vazio/whitespace → null (nunca 0). Aceita vírgula
// decimal (ex.: "1,40") quando não há ponto. NaN → null.
function toNum(value: string | undefined): number | null {
    if (value === undefined) return null;
    const s = value.trim();
    if (s === "") return null;
    const cleaned = s.includes(",") && !s.includes(".") ? s.replace(",", ".") : s;
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
}

// Soma ignorando null (não trata null como 0).
function sumNonNull(values: Array<number | null>): number | null {
    const present = values.filter((v): v is number => v !== null);
    if (present.length === 0) return null;
    return present.reduce((acc, v) => acc + v, 0);
}

// Divisão protegida contra null e divisão por zero.
function safeDiv(a: number | null, b: number | null): number | null {
    return a !== null && b !== null && b !== 0 ? a / b : null;
}

// Lê o arquivo CSV e devolve a matriz crua (linhas × colunas), sem cabeçalho
// interpretado — assim lidamos com colunas duplicadas manualmente.
export function parseCsvFile(file: File): Promise<string[][]> {
    return new Promise((resolve, reject) => {
        Papa.parse<string[]>(file, {
            skipEmptyLines: "greedy",
            complete: (result) => resolve(result.data),
            error: (error: Error) => reject(error),
        });
    });
}

// Agrega uma lista de linhas SEMPRE recalculando dos totais (nunca média de
// médias). Roda tanto sobre todas as linhas quanto sobre um subconjunto filtrado.
export function summarizeRows(rows: AnalysisRow[]): Totals {
    const totalSpend = sumNonNull(rows.map((r) => r.spend));
    const totalImpressions = sumNonNull(rows.map((r) => r.impressions));
    const totalLinkClicks = sumNonNull(rows.map((r) => r.linkClicks));
    const totalConversations = sumNonNull(rows.map((r) => r.conversations));
    const totalResults = sumNonNull(rows.map((r) => r.results));
    const totalRevenue = sumNonNull(rows.map((r) => r.revenue));

    // Métricas derivadas usam o GASTO TOTAL no denominador (regra do projeto:
    // "ROAS = soma da receita ÷ soma do gasto"). Assim os cartões ficam coerentes
    // entre si — se Receita < Gasto, o ROAS fica abaixo de 1, como esperado.
    return {
        spend: totalSpend,
        impressions: totalImpressions,
        reach: null, // alcance NÃO é aditivo entre linhas; não somamos ingenuamente
        linkClicks: totalLinkClicks,
        conversations: totalConversations,
        frequency: null, // frequência = impressões/alcance; sem alcance, fica N/A
        ctr: safeDiv(totalLinkClicks, totalImpressions), // fração
        cpc: safeDiv(totalSpend, totalLinkClicks),
        cpm:
            totalSpend !== null && totalImpressions !== null && totalImpressions !== 0
                ? (totalSpend / totalImpressions) * 1000
                : null,
        results: totalResults,
        costPerResult: safeDiv(totalSpend, totalResults),
        roas: safeDiv(totalRevenue, totalSpend),
        revenue: totalRevenue,
    };
}

// Agrupa linhas por dimensão (campanha ou conjunto) e ordena por gasto desc.
export function groupRows(rows: AnalysisRow[], key: "campaign" | "adset"): DimensionBreakdown[] {
    const map = new Map<string, AnalysisRow[]>();
    for (const row of rows) {
        const list = map.get(row[key]) ?? [];
        list.push(row);
        map.set(row[key], list);
    }
    return [...map.entries()]
        .map(([name, list]) => ({
            name,
            spend: sumNonNull(list.map((r) => r.spend)) ?? 0,
            impressions: sumNonNull(list.map((r) => r.impressions)) ?? 0,
            linkClicks: sumNonNull(list.map((r) => r.linkClicks)) ?? 0,
            results: sumNonNull(list.map((r) => r.results)),
            revenue: sumNonNull(list.map((r) => r.revenue)),
        }))
        .sort((a, b) => b.spend - a.spend);
}

// Constrói a análise a partir da matriz crua do CSV.
export function buildAnalysis(matrix: string[][]): AnalysisResult {
    if (matrix.length < 2) {
        throw new Error("O arquivo não tem linhas de dados suficientes.");
    }

    // Cabeçalho: remove o BOM da primeira célula, se houver.
    const header = matrix[0].map((h, i) => (i === 0 ? h.replace(/^\ufeff/, "") : h).trim());

    // Mapeia índice da coluna → chave canônica (primeira ocorrência vence, então
    // a coluna "Nome do conjunto de anúncios" duplicada é ignorada na 2ª vez).
    const indexOf: Record<string, number> = {};
    header.forEach((name, i) => {
        const lower = name.toLowerCase();
        for (const [canonical, aliases] of Object.entries(COLUMN_ALIASES)) {
            if (aliases.includes(lower) && indexOf[canonical] === undefined) {
                indexOf[canonical] = i;
            }
        }
    });

    const cell = (row: string[], key: string): string | undefined =>
        indexOf[key] === undefined ? undefined : row[indexOf[key]];

    // Normaliza cada linha de dados.
    const dataRows = matrix.slice(1).filter((r) => r.some((c) => c.trim() !== ""));
    const rows: AnalysisRow[] = dataRows.map((r) => {
        const spend = toNum(cell(r, "spend"));
        const costPerResult = toNum(cell(r, "costPerResult"));
        const roas = toNum(cell(r, "roas"));

        // Derivadas, protegidas contra divisão por zero e por null.
        const results =
            spend !== null && costPerResult !== null && costPerResult !== 0
                ? spend / costPerResult
                : null;
        const revenue = spend !== null && roas !== null ? spend * roas : null;

        return {
            campaign: (cell(r, "campaign") ?? "").trim() || "(sem nome)",
            adset: (cell(r, "adset") ?? "").trim() || "(sem nome)",
            spend,
            impressions: toNum(cell(r, "impressions")),
            reach: toNum(cell(r, "reach")),
            linkClicks: toNum(cell(r, "linkClicks")),
            conversations: toNum(cell(r, "conversations")),
            frequency: toNum(cell(r, "frequency")),
            cpc: toNum(cell(r, "cpc")),
            cpm: toNum(cell(r, "cpm")),
            costPerResult,
            roas,
            results,
            revenue,
        };
    });

    const totals = summarizeRows(rows);

    // Métricas "detectadas" (nível do arquivo) = as que têm agregado exibível.
    const detected = (Object.keys(totals) as MetricKey[]).filter((k) => totals[k] !== null);

    const byCampaign = groupRows(rows, "campaign");

    // Período: menor início e maior encerramento presentes.
    const starts = dataRows.map((r) => cell(r, "reportStart")?.trim()).filter(Boolean) as string[];
    const ends = dataRows.map((r) => cell(r, "reportEnd")?.trim()).filter(Boolean) as string[];
    const period = {
        start: starts.length ? starts.sort()[0] : null,
        end: ends.length ? ends.sort()[ends.length - 1] : null,
    };

    return { rows, period, detected, totals, byCampaign };
}

// --- Formatação (pt-BR) --- (retornam null quando o valor é null)
export const fmtCurrency = (v: number | null): string | null =>
    v === null ? null : v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const fmtInt = (v: number | null): string | null =>
    v === null ? null : Math.round(v).toLocaleString("pt-BR");

export const fmtPct = (v: number | null): string | null =>
    v === null ? null : `${(v * 100).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`;

export const fmtDecimal = (v: number | null, digits = 2): string | null =>
    v === null
        ? null
        : v.toLocaleString("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits });

// Direção de "melhor" por métrica (usada no verde/vermelho da comparação).
// "up" = maior é melhor; "down" = menor é melhor; "neutral" = volume, sem cor.
export const METRIC_DIRECTION: Record<MetricKey, "up" | "down" | "neutral"> = {
    spend: "neutral",
    impressions: "neutral",
    reach: "neutral",
    linkClicks: "neutral",
    conversations: "up",
    frequency: "neutral",
    ctr: "up",
    cpc: "down",
    cpm: "down",
    results: "up",
    costPerResult: "down",
    roas: "up",
    revenue: "up",
};

// Ordem de exibição das métricas nas tabelas.
export const DISPLAY_METRICS: MetricKey[] = [
    "spend",
    "revenue",
    "roas",
    "impressions",
    "reach",
    "linkClicks",
    "ctr",
    "cpc",
    "cpm",
    "frequency",
    "results",
    "costPerResult",
    "conversations",
];

// Formata uma métrica pelo seu tipo (moeda, inteiro, %, ROAS, decimal).
export function formatMetric(key: MetricKey, v: number | null): string | null {
    switch (key) {
        case "spend":
        case "cpc":
        case "cpm":
        case "costPerResult":
        case "revenue":
            return fmtCurrency(v);
        case "impressions":
        case "reach":
        case "linkClicks":
        case "conversations":
        case "results":
            return fmtInt(v);
        case "ctr":
            return fmtPct(v);
        case "roas":
            return v === null ? null : `${fmtDecimal(v)}x`;
        case "frequency":
            return fmtDecimal(v);
    }
}
