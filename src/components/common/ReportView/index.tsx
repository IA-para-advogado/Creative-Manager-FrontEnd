import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Printer } from "lucide-react";
import {
    summarizeRows,
    formatMetric,
    METRIC_LABELS,
    DISPLAY_METRICS,
    type AnalysisRow,
    type Totals,
    type MetricKey,
} from "../../../lib/meta";

interface ReportViewProps {
    rows: AnalysisRow[]; // já recortadas pelo filtro de campanha
    totals: Totals; // agregados do recorte
    detected: MetricKey[];
    period: { start: string | null; end: string | null };
    recorteLabel: string; // "Todas as campanhas", o nome da campanha ou "N campanhas selecionadas"
    recorteCampaigns?: string[]; // nomes do recorte parcial; vazio quando é "todas"
    hasAdsetData: boolean; // false em export de nível campanha
}

// Métricas exibidas nas TABELAS do relatório (enxutas para caber na página).
const TABLE_METRICS: MetricKey[] = ["spend", "roas", "ctr", "cpc", "costPerResult", "results", "revenue"];

const fmtDate = (iso: string | null): string => {
    if (!iso) return "?";
    const [y, m, d] = iso.split("-");
    return d && m && y ? `${d}/${m}/${y}` : iso;
};

interface DimRow {
    name: string;
    campaign: string;
    totals: Totals;
}

// Agrupa por dimensão e recalcula os totais de cada grupo (mesma lógica das tabelas).
function byDimension(rows: AnalysisRow[], key: "campaign" | "adset"): DimRow[] {
    const map = new Map<string, AnalysisRow[]>();
    for (const r of rows) {
        const id = key === "campaign" ? r.campaign : `${r.campaign}|||${r.adset}`;
        const list = map.get(id) ?? [];
        list.push(r);
        map.set(id, list);
    }
    return [...map.values()]
        .map((group) => ({
            name: key === "campaign" ? group[0].campaign : group[0].adset,
            campaign: group[0].campaign,
            totals: summarizeRows(group),
        }))
        .sort((a, b) => (b.totals.spend ?? 0) - (a.totals.spend ?? 0));
}

export function ReportView({
    rows,
    totals,
    detected,
    period,
    recorteLabel,
    recorteCampaigns = [],
    hasAdsetData,
}: ReportViewProps) {
    // Quais blocos entram no relatório.
    const [sections, setSections] = useState({
        resumo: true,
        funil: true,
        campanhas: true,
        conjuntos: false,
    });

    const campaigns = useMemo(() => byDimension(rows, "campaign"), [rows]);
    const conjuntos = useMemo(() => byDimension(rows, "adset"), [rows]);

    const kpiKeys = DISPLAY_METRICS.filter((k) => detected.includes(k) && totals[k] !== null);
    const tableCols = TABLE_METRICS.filter((k) => detected.includes(k));

    const generatedAt = new Date().toLocaleString("pt-BR");

    function handlePrint() {
        toast.message("Abrindo a janela de impressão — escolha 'Salvar como PDF' no destino.");
        // Pequeno atraso para o toast aparecer antes do diálogo travar a tela.
        setTimeout(() => window.print(), 250);
    }

    const toggle = (key: keyof typeof sections) =>
        setSections((prev) => ({ ...prev, [key]: !prev[key] }));

    return (
        <div className="space-y-4">
            {/* Controles: ficam FORA da .print-area, então não saem no PDF. */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-4">
                <div className="flex flex-wrap gap-4 text-sm">
                    {/* "Conjuntos" só entra na lista quando o arquivo tem esse
                        nível — em export de campanha a seção sairia vazia. */}
                    {(hasAdsetData
                        ? (["resumo", "funil", "campanhas", "conjuntos"] as const)
                        : (["resumo", "funil", "campanhas"] as const)
                    ).map((key) => (
                        <label key={key} className="flex cursor-pointer items-center gap-2 text-text-muted">
                            <input
                                type="checkbox"
                                checked={sections[key]}
                                onChange={() => toggle(key)}
                                className="accent-primary"
                            />
                            {key === "resumo" && "Resumo (KPIs)"}
                            {key === "funil" && "Funil"}
                            {key === "campanhas" && "Campanhas"}
                            {key === "conjuntos" && "Conjuntos"}
                        </label>
                    ))}
                </div>
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
                >
                    <Printer size={16} />
                    Exportar PDF
                </button>
            </div>

            {/* A FOLHA do relatório (clara). É a única coisa que sai na impressão. */}
            <div className="print-area mx-auto max-w-4xl rounded-2xl border border-zinc-200 bg-white p-10 text-zinc-900">
                {/* Cabeçalho */}
                <div className="mb-8 flex items-start justify-between border-b border-zinc-200 pb-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#7c3aed] text-sm font-bold text-white">
                            CM
                        </div>
                        <div>
                            <div className="text-lg font-bold">Creative Manager</div>
                            <div className="text-sm text-zinc-500">Relatório de campanha — Meta Ads</div>
                        </div>
                    </div>
                    <div className="text-right text-xs text-zinc-500">Gerado em {generatedAt}</div>
                </div>

                {/* Contexto da análise */}
                <div className="mb-8 grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <div className="text-xs uppercase tracking-wide text-zinc-400">Recorte</div>
                        <div className="font-medium">{recorteLabel}</div>
                    </div>
                    <div>
                        <div className="text-xs uppercase tracking-wide text-zinc-400">Período</div>
                        <div className="font-medium">
                            {fmtDate(period.start)} – {fmtDate(period.end)}
                        </div>
                    </div>
                </div>

                {/* Recorte parcial: nomeia as campanhas incluídas, para o PDF
                    não deixar dúvida sobre o que entrou nos totais. */}
                {recorteCampaigns.length > 1 && (
                    <div className="mb-8 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                        <div className="mb-2 text-xs uppercase tracking-wide text-zinc-400">
                            Campanhas incluídas neste relatório
                        </div>
                        <ol className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
                            {recorteCampaigns.map((name, i) => (
                                <li key={name} className="flex gap-2">
                                    <span className="text-zinc-400">{i + 1}.</span>
                                    <span>{name}</span>
                                </li>
                            ))}
                        </ol>
                    </div>
                )}

                {/* Resumo (KPIs) */}
                {sections.resumo && (
                    <section className="mb-8">
                        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-zinc-500">Resumo</h3>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                            {kpiKeys.map((key) => (
                                <div key={key} className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                                    <div className="text-xs text-zinc-500">{METRIC_LABELS[key]}</div>
                                    <div className="text-lg font-bold">{formatMetric(key, totals[key])}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Funil */}
                {sections.funil && (
                    <section className="mb-8">
                        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-zinc-500">Funil</h3>
                        <ReportFunnel
                            impressions={totals.impressions}
                            clicks={totals.linkClicks}
                            results={totals.results}
                        />
                    </section>
                )}

                {/* Campanhas */}
                {sections.campanhas && (
                    <section className="mb-8">
                        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-zinc-500">Campanhas</h3>
                        <ReportTable rows={campaigns} cols={tableCols} labelHeader="Campanha" />
                    </section>
                )}

                {/* Conjuntos */}
                {hasAdsetData && sections.conjuntos && (
                    <section>
                        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-zinc-500">Conjuntos</h3>
                        <ReportTable rows={conjuntos} cols={tableCols} labelHeader="Conjunto" showCampaign />
                    </section>
                )}

                <div className="mt-10 border-t border-zinc-200 pt-4 text-center text-xs text-zinc-400">
                    Gerado pelo Creative Manager · valores recalculados a partir dos totais.
                </div>
            </div>
        </div>
    );
}

// Funil em barras claras (versão de impressão).
function ReportFunnel({
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
    const stages: Array<{ label: string; value: number | null; color: string }> = [
        { label: "Impressões", value: impressions, color: "#7c3aed" },
        { label: "Cliques no link", value: clicks, color: "#8b5cf6" },
        { label: "Resultados", value: results, color: "#10b981" },
    ];
    return (
        <div className="space-y-3">
            {stages.map((s) => (
                <div key={s.label}>
                    <div className="mb-1 flex justify-between text-sm">
                        <span className="text-zinc-500">{s.label}</span>
                        <span className="font-medium">{formatMetric("impressions", s.value) ?? "–"}</span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-100">
                        <div className="h-full rounded-full" style={{ width: width(s.value), background: s.color }} />
                    </div>
                </div>
            ))}
        </div>
    );
}

// Tabela clara do relatório.
function ReportTable({
    rows,
    cols,
    labelHeader,
    showCampaign = false,
}: {
    rows: DimRow[];
    cols: MetricKey[];
    labelHeader: string;
    showCampaign?: boolean;
}) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
                <thead>
                    <tr className="border-b border-zinc-300 text-left text-zinc-500">
                        <th className="py-2 pr-3 font-medium">{labelHeader}</th>
                        {showCampaign && <th className="py-2 pr-3 font-medium">Campanha</th>}
                        {cols.map((k) => (
                            <th key={k} className="py-2 pl-3 text-right font-medium">
                                {METRIC_LABELS[k]}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r) => (
                        <tr key={`${r.campaign}|||${r.name}`} className="border-b border-zinc-100">
                            <td className="max-w-[220px] truncate py-2 pr-3 font-medium" title={r.name}>
                                {r.name}
                            </td>
                            {showCampaign && (
                                <td className="max-w-[200px] truncate py-2 pr-3 text-zinc-500" title={r.campaign}>
                                    {r.campaign}
                                </td>
                            )}
                            {cols.map((k) => (
                                <td key={k} className="py-2 pl-3 text-right">
                                    {formatMetric(k, r.totals[k]) ?? "–"}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
