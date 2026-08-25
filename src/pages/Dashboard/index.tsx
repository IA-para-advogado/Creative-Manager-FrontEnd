import { useMemo, useRef, useState, type DragEvent } from "react";
import { toast } from "sonner";
import {
    UploadCloud,
    RefreshCw,
    Wallet,
    TrendingUp,
    Target,
    Eye,
    MousePointerClick,
    Percent,
    DollarSign,
    Gauge,
    ShoppingCart,
    MessageSquare,
    BarChart3,
    LayoutGrid,
    Table,
    GitCompare,
    FileText,
    AlertTriangle,
    Save,
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { useCsv, type Tab } from "../../contexts/CsvContext";
import { Spinner } from "../../components/common/Spinner";
import { KpiCard } from "../../components/common/KpiCard";
import { ConjuntosTable } from "../../components/common/ConjuntosTable";
import { CampaignCompareTable } from "../../components/common/CampaignCompareTable";
import { ReportView } from "../../components/common/ReportView";
import { CampaignFilter } from "../../components/common/CampaignFilter";
import { saveToHistory } from "../../lib/history";
import {
    parseCsvFile,
    buildAnalysis,
    summarizeRows,
    groupRows,
    fmtCurrency,
    fmtInt,
    fmtPct,
    fmtDecimal,
    METRIC_LABELS,
    MAX_FILE_BYTES,
    CsvValidationError,
    type AnalysisResult,
} from "../../lib/meta";

// Cores dos gráficos: espelham os tokens do tema (recharts é SVG e recebe a cor
// direta, então não dá pra usar as classes do Tailwind aqui).
const COLOR_PRIMARY = "#7c3aed";
const COLOR_SUCCESS = "#10b981";
const COLOR_MUTED = "#a1a1aa";
const COLOR_BORDER = "#27272a";
const COLOR_SURFACE = "#18181b";
const COLOR_TEXT = "#fafafa";

const truncate = (s: string, n: number): string => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

// Tamanho de arquivo legível (usado só nas mensagens de erro do upload).
const fmtBytes = (bytes: number): string =>
    bytes >= 1024 * 1024
        ? `${(bytes / (1024 * 1024)).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} MB`
        : `${Math.max(Math.round(bytes / 1024), 1)} KB`;

// "2026-06-28" → "28/06/2026" (sem criar Date, evita fuso).
const fmtDate = (iso: string | null): string => {
    if (!iso) return "?";
    const [y, m, d] = iso.split("-");
    return d && m && y ? `${d}/${m}/${y}` : iso;
};

export function DashboardPage() {
    const { analysis, setAnalysis, selected, setSelected, tab, setTab } = useCsv();
    const [loading, setLoading] = useState<boolean>(false);
    // Recorte atual: conjunto de campanhas escolhidas. Começa com todas quando
    // um arquivo é carregado, e o usuário pode reduzir para quantas quiser.
    const inputRef = useRef<HTMLInputElement>(null);

    function handleSave() {
        if (!analysis) return;
        const title = `Análise (${fmtDate(analysis.period.start)} a ${fmtDate(analysis.period.end)})`;
        const success = saveToHistory(title, analysis);
        if (success) {
            toast.success("Salvo no histórico com sucesso!");
        } else {
            toast.error("Erro ao salvar.", { description: "Pode ser que o arquivo seja muito grande e o navegador não tenha espaço suficiente." });
        }
    }

    async function handleFile(file: File) {
        // Checagens baratas primeiro: nome e tamanho, antes de ler o conteúdo.
        if (!file.name.toLowerCase().endsWith(".csv")) {
            toast.error("Envie um arquivo .csv exportado do Meta Ads.");
            return;
        }
        if (file.size === 0) {
            toast.error("Este arquivo está vazio.");
            return;
        }
        if (file.size > MAX_FILE_BYTES) {
            toast.error(`Arquivo grande demais: ${fmtBytes(file.size)}.`, {
                description: `O limite é ${fmtBytes(MAX_FILE_BYTES)}. Exporte um período menor.`,
            });
            return;
        }

        setLoading(true);
        try {
            const matrix = await parseCsvFile(file);
            const result = buildAnalysis(matrix);
            setAnalysis(result);
            // Novo arquivo → recorte volta a ser todas as campanhas dele.
            setSelected(new Set(result.byCampaign.map((c) => c.name)));
            setTab("overview");
            toast.success(
                `Análise gerada: ${result.byCampaign.length} ${
                    result.byCampaign.length === 1 ? "campanha" : "campanhas"
                }.`,
            );
        } catch (error) {
            console.error("[Dashboard] erro ao processar CSV", error);
            // Arquivo inadequado: dizemos o que faltou. Falha de leitura de
            // verdade (binário, encoding quebrado) cai na mensagem genérica.
            if (error instanceof CsvValidationError) {
                toast.error(error.message, { description: error.detail || undefined });
            } else {
                toast.error("Não foi possível ler este CSV. Confira o arquivo e tente de novo.");
            }
        } finally {
            setLoading(false);
        }
    }

    function onDrop(e: DragEvent<HTMLDivElement>) {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    }

    // Recorte atual (todas as campanhas ou uma só). Alimenta a aba Visão geral e
    // a aba Conjuntos. A aba Comparar tem a própria seleção múltipla.
    const view = useMemo(() => {
        if (!analysis) return null;
        const isAll = selected.size === analysis.byCampaign.length;
        const rows = isAll
            ? analysis.rows
            : analysis.rows.filter((r) => selected.has(r.campaign));
        // Com uma única campanha no recorte, o gráfico desce um nível e mostra
        // os conjuntos dela. Sem dados de conjunto no arquivo, fica por campanha.
        const byAdset = selected.size === 1 && analysis.hasAdsetData;
        return {
            isAll,
            rows,
            byAdset,
            totals: summarizeRows(rows),
            chart: groupRows(rows, byAdset ? "adset" : "campaign").slice(0, 8),
            campaignCount: new Set(rows.map((r) => r.campaign)).size,
        };
    }, [analysis, selected]);

    // Como o recorte aparece no cabeçalho e no relatório impresso.
    const recorteLabel =
        selected.size === 0
            ? "Nenhuma campanha selecionada"
            : !view || view.isAll
              ? "Todas as campanhas"
              : selected.size === 1
                ? [...selected][0]
                : `${selected.size} campanhas selecionadas`;

    const TABS: Array<{ id: Tab; label: string; icon: typeof LayoutGrid }> = [
        { id: "overview", label: "Visão geral", icon: LayoutGrid },
        { id: "conjuntos", label: "Conjuntos", icon: Table },
        { id: "compare", label: "Comparar campanhas", icon: GitCompare },
        { id: "report", label: "Relatório", icon: FileText },
    ];

    return (
        <div className="mx-auto max-w-6xl">
            {/* input escondido, acionado pelo dropzone / botão "Trocar CSV" */}
            <input
                ref={inputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                    e.target.value = ""; // permite reenviar o mesmo arquivo
                }}
            />

            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <div className="flex items-center gap-3 text-text-muted">
                        <Spinner />
                        Processando o CSV…
                    </div>
                </div>
            ) : !analysis || !view ? (
                // ---------- Estado vazio: upload ----------
                <div
                    onClick={() => inputRef.current?.click()}
                    onDrop={onDrop}
                    onDragOver={(e) => e.preventDefault()}
                    className="mx-auto flex max-w-2xl cursor-pointer flex-col items-center rounded-2xl border border-dashed border-border bg-surface p-12 text-center transition-colors hover:border-primary"
                >
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/15">
                        <UploadCloud className="h-7 w-7 text-primary" />
                    </div>
                    <h2 className="mb-2 text-xl font-bold">Suba um CSV do Meta Ads</h2>
                    <p className="max-w-md text-sm text-text-muted">
                        Arraste o arquivo aqui ou clique para selecionar. O sistema detecta
                        automaticamente as colunas presentes e monta os indicadores — os
                        cálculos são feitos a partir dos totais, ignorando métricas ausentes.
                    </p>
                </div>
            ) : (
                // ---------- Estado com análise ----------
                <div className="space-y-6">
                    {/* Cabeçalho + filtro por campanha (oculto na aba Comparar) */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        {/* `min-w-0 flex-1` deixa o título encolher em vez de
                            empurrar os controles para a linha de baixo — nome de
                            campanha pode ser bem mais longo que "Todas as campanhas". */}
                        <div className="min-w-0 flex-1">
                            <h2 className="truncate text-xl font-bold" title={recorteLabel}>
                                {recorteLabel}
                            </h2>
                            <p className="text-sm text-text-muted">
                                Período {fmtDate(analysis.period.start)} – {fmtDate(analysis.period.end)} ·{" "}
                                {view.campaignCount} de {analysis.byCampaign.length}{" "}
                                {analysis.byCampaign.length === 1 ? "campanha" : "campanhas"}
                            </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-3">
                            {tab !== "compare" && (
                                <CampaignFilter
                                    campaigns={analysis.byCampaign.map((c) => c.name)}
                                    selected={selected}
                                    onChange={setSelected}
                                />
                            )}

                            <button
                                onClick={handleSave}
                                className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                            >
                                <Save size={16} />
                                Salvar
                            </button>

                            <button
                                onClick={() => inputRef.current?.click()}
                                className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-surface hover:text-text"
                            >
                                <RefreshCw size={16} />
                                Trocar CSV
                            </button>
                        </div>
                    </div>

                    {/* Abas */}
                    <div className="flex gap-1 border-b border-border">
                        {TABS.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setTab(t.id)}
                                className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                                    tab === t.id
                                        ? "border-primary text-text"
                                        : "border-transparent text-text-muted hover:text-text"
                                }`}
                            >
                                <t.icon size={16} />
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Recorte vazio: sem campanha escolhida não há o que somar.
                        Mostramos um aviso em vez de um dashboard todo em "–". */}
                    {selected.size === 0 && tab !== "compare" ? (
                        <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-warning/15">
                                <AlertTriangle className="h-6 w-6 text-warning" />
                            </div>
                            <h3 className="mb-1 font-semibold">Nenhuma campanha selecionada</h3>
                            <p className="text-sm text-text-muted">
                                Escolha ao menos uma campanha no filtro acima para ver os indicadores.
                            </p>
                        </div>
                    ) : (
                    <>
                    {/* ---------- Aba: Visão geral ---------- */}
                    {tab === "overview" && (
                        <div className="space-y-6">
                            {/* Métricas detectadas neste arquivo */}
                            <div className="rounded-2xl border border-border bg-surface p-4">
                                <div className="mb-2 text-xs font-medium uppercase tracking-wide text-text-muted">
                                    Métricas detectadas neste arquivo
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {analysis.detected.map((key) => (
                                        <span
                                            key={key}
                                            className="rounded-full border border-border bg-background px-3 py-1 text-xs text-text"
                                        >
                                            {METRIC_LABELS[key]}
                                        </span>
                                    ))}
                                </div>

                                {/* Colunas opcionais que não vieram (ausentes do cabeçalho ou
                                    presentes mas vazias): o arquivo é válido, mas o usuário
                                    precisa saber o que deixou de ser calculado. */}
                                {analysis.missingOptional.length > 0 && (
                                    <div className="mt-4 border-t border-border pt-3">
                                        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-text-muted">
                                            <AlertTriangle size={14} className="text-warning" />
                                            Colunas ausentes ou sem dados neste arquivo
                                        </div>
                                        <ul className="space-y-1 text-xs text-text-muted">
                                            {analysis.missingOptional.map((c) => (
                                                <li key={c.label}>
                                                    <span className="text-text">{c.label}</span> — sem ela,
                                                    não é possível calcular {c.unlocks}.
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Cartões de KPI (recalculados para o recorte; ausente = "–") */}
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                                <KpiCard label="Gasto" value={fmtCurrency(view.totals.spend)} icon={Wallet} />
                                <KpiCard label="Receita" value={fmtCurrency(view.totals.revenue)} icon={TrendingUp} />
                                <KpiCard
                                    label="ROAS"
                                    value={view.totals.roas === null ? null : `${fmtDecimal(view.totals.roas)}x`}
                                    icon={Target}
                                    tone={view.totals.roas === null ? "default" : view.totals.roas >= 1 ? "good" : "bad"}
                                    hint="Receita ÷ gasto"
                                />
                                <KpiCard label="Impressões" value={fmtInt(view.totals.impressions)} icon={Eye} />
                                <KpiCard label="Cliques no link" value={fmtInt(view.totals.linkClicks)} icon={MousePointerClick} />
                                <KpiCard label="CTR" value={fmtPct(view.totals.ctr)} icon={Percent} />
                                <KpiCard label="CPC" value={fmtCurrency(view.totals.cpc)} icon={DollarSign} />
                                <KpiCard label="CPM" value={fmtCurrency(view.totals.cpm)} icon={Gauge} />
                                <KpiCard label="Resultados" value={fmtInt(view.totals.results)} icon={ShoppingCart} />
                                <KpiCard label="Custo por resultado" value={fmtCurrency(view.totals.costPerResult)} icon={DollarSign} />
                                {view.totals.conversations !== null && (
                                    <KpiCard
                                        label="Conversas por mensagem"
                                        value={fmtInt(view.totals.conversations)}
                                        icon={MessageSquare}
                                    />
                                )}
                            </div>

                            {/* Funil impressão → clique → resultado */}
                            <div className="rounded-2xl border border-border bg-surface p-5">
                                <h3 className="mb-4 text-sm font-semibold">Funil</h3>
                                <Funnel
                                    impressions={view.totals.impressions}
                                    clicks={view.totals.linkClicks}
                                    results={view.totals.results}
                                />
                            </div>

                            {/* Gasto por campanha (ou por conjunto, quando filtrado) — top 8 */}
                            <div className="rounded-2xl border border-border bg-surface p-5">
                                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
                                    <BarChart3 size={16} className="text-primary" />
                                    {view.byAdset ? "Gasto por conjunto" : "Gasto por campanha"}
                                </h3>
                                <ResponsiveContainer width="100%" height={Math.max(220, view.chart.length * 42)}>
                                    <BarChart
                                        data={view.chart.map((c) => ({ ...c, short: truncate(c.name, 24) }))}
                                        layout="vertical"
                                        margin={{ top: 4, right: 24, bottom: 4, left: 8 }}
                                    >
                                        <CartesianGrid stroke={COLOR_BORDER} horizontal={false} />
                                        <XAxis
                                            type="number"
                                            tick={{ fill: COLOR_MUTED, fontSize: 12 }}
                                            tickFormatter={(v: number) => fmtCurrency(v) ?? ""}
                                        />
                                        <YAxis
                                            type="category"
                                            dataKey="short"
                                            width={170}
                                            tick={{ fill: COLOR_MUTED, fontSize: 12 }}
                                        />
                                        <Tooltip
                                            cursor={{ fill: "rgba(124,58,237,0.08)" }}
                                            contentStyle={{
                                                background: COLOR_SURFACE,
                                                border: `1px solid ${COLOR_BORDER}`,
                                                borderRadius: 8,
                                                color: COLOR_TEXT,
                                            }}
                                            formatter={(v: number) => [fmtCurrency(v) ?? "–", "Gasto"]}
                                        />
                                        <Bar dataKey="spend" fill={COLOR_PRIMARY} radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* ---------- Aba: Conjuntos ---------- */}
                    {tab === "conjuntos" &&
                        (analysis.hasAdsetData ? (
                            <ConjuntosTable
                                rows={view.rows}
                                detected={analysis.detected}
                                showCampaign={selected.size > 1}
                            />
                        ) : (
                            // Export de nível campanha: não há o que detalhar aqui.
                            <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
                                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-warning/15">
                                    <AlertTriangle className="h-6 w-6 text-warning" />
                                </div>
                                <h3 className="mb-2 font-semibold">
                                    Este arquivo não tem dados de conjunto
                                </h3>
                                <p className="mx-auto max-w-md text-sm text-text-muted">
                                    O relatório foi exportado a nível de campanha, então não há
                                    conjuntos de anúncios para detalhar ou comparar. Para ver esta
                                    aba, exporte novamente do Meta Ads escolhendo o detalhamento
                                    por conjunto de anúncios.
                                </p>
                            </div>
                        ))}

                    {/* ---------- Aba: Comparar campanhas ---------- */}
                    {tab === "compare" && <CampaignCompareTable analysis={analysis} />}

                    {/* ---------- Aba: Relatório ---------- */}
                    {tab === "report" && (
                        <ReportView
                            rows={view.rows}
                            totals={view.totals}
                            detected={analysis.detected}
                            period={analysis.period}
                            recorteLabel={recorteLabel}
                            hasAdsetData={analysis.hasAdsetData}
                            // Lista nominal só quando o recorte é parcial: no
                            // relatório impresso o leitor precisa saber quais
                            // campanhas entraram na conta.
                            recorteCampaigns={
                                view.isAll
                                    ? []
                                    : analysis.byCampaign
                                          .map((c) => c.name)
                                          .filter((n) => selected.has(n))
                            }
                        />
                    )}
                    </>
                    )}
                </div>
            )}
        </div>
    );
}

// Funil simples em barras proporcionais (base = impressões). Evita gráfico de
// escala distorcida e deixa as taxas de conversão explícitas.
function Funnel({
    impressions,
    clicks,
    results,
}: {
    impressions: number | null;
    clicks: number | null;
    results: number | null;
}) {
    const base = impressions ?? 0;
    const width = (v: number | null): string =>
        base > 0 && v !== null ? `${Math.max((v / base) * 100, 2)}%` : "0%";
    const rate = (a: number | null, b: number | null): string =>
        a !== null && b !== null && b !== 0
            ? `${((a / b) * 100).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`
            : "–";

    const stages: Array<{ label: string; value: number | null; color: string }> = [
        { label: "Impressões", value: impressions, color: COLOR_PRIMARY },
        { label: "Cliques no link", value: clicks, color: "#6d28d9" },
        { label: "Resultados", value: results, color: COLOR_SUCCESS },
    ];

    return (
        <div className="space-y-3">
            {stages.map((s) => (
                <div key={s.label}>
                    <div className="mb-1 flex justify-between text-sm">
                        <span className="text-text-muted">{s.label}</span>
                        <span className="font-medium">{fmtInt(s.value) ?? "–"}</span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-background">
                        <div className="h-full rounded-full" style={{ width: width(s.value), background: s.color }} />
                    </div>
                </div>
            ))}

            <div className="flex gap-6 pt-1 text-xs text-text-muted">
                <span>CTR (cliques ÷ impressões): <strong className="text-text">{rate(clicks, impressions)}</strong></span>
                <span>Conversão (resultados ÷ cliques): <strong className="text-text">{rate(results, clicks)}</strong></span>
            </div>
        </div>
    );
}
