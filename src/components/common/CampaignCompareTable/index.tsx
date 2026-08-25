import { useMemo, useState } from "react";
import {
    summarizeRows,
    formatMetric,
    METRIC_LABELS,
    DISPLAY_METRICS,
    METRIC_DIRECTION,
    type AnalysisResult,
    type MetricKey,
} from "../../../lib/meta";

interface CampaignCompareTableProps {
    analysis: AnalysisResult;
}

export function CampaignCompareTable({ analysis }: CampaignCompareTableProps) {
    // Lista de campanhas (já ordenada por gasto em analysis.byCampaign).
    const campaignNames = useMemo(() => analysis.byCampaign.map((c) => c.name), [analysis]);

    // Por padrão, começa com todas selecionadas.
    const [selected, setSelected] = useState<Set<string>>(() => new Set(campaignNames));

    function toggle(name: string) {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(name)) {
                next.delete(name);
            } else {
                next.add(name);
            }
            return next;
        });
    }

    // Para cada campanha selecionada, recalcula os totais das suas linhas.
    const columns = useMemo(() => {
        return campaignNames
            .filter((name) => selected.has(name))
            .map((name) => ({
                name,
                totals: summarizeRows(analysis.rows.filter((r) => r.campaign === name)),
            }));
    }, [analysis, campaignNames, selected]);

    const metricRows = DISPLAY_METRICS.filter((k) => analysis.detected.includes(k));

    // Para uma métrica, descobre o melhor e o pior valor entre as colunas.
    function bestWorst(metric: MetricKey): { best: number | null; worst: number | null } {
        const values = columns
            .map((c) => c.totals[metric])
            .filter((v): v is number => v !== null);
        if (values.length < 2 || new Set(values).size < 2) return { best: null, worst: null };
        const dir = METRIC_DIRECTION[metric];
        if (dir === "neutral") return { best: null, worst: null };
        const max = Math.max(...values);
        const min = Math.min(...values);
        // "up": maior é melhor; "down": menor é melhor.
        return dir === "up" ? { best: max, worst: min } : { best: min, worst: max };
    }

    function cellClass(metric: MetricKey, value: number | null): string {
        if (value === null) return "text-text-muted";
        const { best, worst } = bestWorst(metric);
        if (best !== null && value === best) return "text-success font-medium";
        if (worst !== null && value === worst) return "text-danger font-medium";
        return "";
    }

    return (
        <div className="space-y-4">
            {/* Seleção de campanhas */}
            <div>
                <div className="mb-2 text-xs font-medium uppercase tracking-wide text-text-muted">
                    Campanhas a comparar ({columns.length} selecionadas)
                </div>
                <div className="flex flex-wrap gap-2">
                    {campaignNames.map((name) => {
                        const on = selected.has(name);
                        return (
                            <button
                                key={name}
                                onClick={() => toggle(name)}
                                title={name}
                                className={`max-w-[240px] truncate rounded-full border px-3 py-1 text-xs transition-colors ${
                                    on
                                        ? "border-primary bg-primary/15 text-primary"
                                        : "border-border text-text-muted hover:text-text"
                                }`}
                            >
                                {name}
                            </button>
                        );
                    })}
                </div>
            </div>

            {columns.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-text-muted">
                    Selecione ao menos uma campanha para comparar.
                </div>
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-border">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="border-b border-border bg-surface">
                                <th className="sticky left-0 z-10 bg-surface px-4 py-3 text-left font-medium text-text-muted">
                                    Métrica
                                </th>
                                {columns.map((c) => (
                                    <th
                                        key={c.name}
                                        className="max-w-[200px] truncate px-4 py-3 text-right font-medium"
                                        title={c.name}
                                    >
                                        {c.name}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {metricRows.map((metric) => (
                                <tr key={metric} className="border-b border-border last:border-0">
                                    <td className="sticky left-0 z-10 whitespace-nowrap bg-surface px-4 py-3 font-medium text-text-muted">
                                        {METRIC_LABELS[metric]}
                                    </td>
                                    {columns.map((c) => {
                                        const value = c.totals[metric];
                                        return (
                                            <td
                                                key={c.name}
                                                className={`whitespace-nowrap px-4 py-3 text-right ${cellClass(metric, value)}`}
                                            >
                                                {formatMetric(metric, value) ?? "–"}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <p className="text-xs text-text-muted">
                Verde = melhor valor da linha; vermelho = pior. Para custo (CPC, CPM, custo por
                resultado) o menor é o melhor. Métricas de volume (gasto, impressões, cliques) não
                recebem cor por não terem um "melhor" absoluto.
            </p>
        </div>
    );
}
