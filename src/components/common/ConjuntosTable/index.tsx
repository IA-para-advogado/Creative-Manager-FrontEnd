import { useMemo, useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import {
    summarizeRows,
    formatMetric,
    METRIC_LABELS,
    DISPLAY_METRICS,
    type AnalysisRow,
    type MetricKey,
    type Totals,
} from "../../../lib/meta";

interface ConjuntosTableProps {
    rows: AnalysisRow[]; // já recortadas pelo filtro de campanha
    detected: MetricKey[]; // métricas que o arquivo sustenta
    showCampaign: boolean; // mostra a coluna "Campanha" quando é "Todas"
}

interface ConjuntoRow {
    campaign: string;
    adset: string;
    totals: Totals;
}

// Chave de ordenação: uma métrica ou o nome do conjunto.
type SortKey = MetricKey | "adset";

export function ConjuntosTable({ rows, detected, showCampaign }: ConjuntosTableProps) {
    const [sortKey, setSortKey] = useState<SortKey>("spend");
    const [sortDesc, setSortDesc] = useState<boolean>(true);

    // Colunas de métrica = as detectadas, na ordem de exibição padrão.
    const metricCols = DISPLAY_METRICS.filter((k) => detected.includes(k));

    // Agrupa por campanha+conjunto e recalcula os totais de cada conjunto.
    const conjuntos: ConjuntoRow[] = useMemo(() => {
        const map = new Map<string, AnalysisRow[]>();
        for (const r of rows) {
            const key = `${r.campaign}|||${r.adset}`;
            const list = map.get(key) ?? [];
            list.push(r);
            map.set(key, list);
        }
        return [...map.values()].map((group) => ({
            campaign: group[0].campaign,
            adset: group[0].adset,
            totals: summarizeRows(group),
        }));
    }, [rows]);

    // Ordena: por nome (texto) ou por métrica (número, com null sempre no fim).
    const sorted = useMemo(() => {
        const arr = [...conjuntos];
        arr.sort((a, b) => {
            if (sortKey === "adset") {
                return sortDesc ? b.adset.localeCompare(a.adset) : a.adset.localeCompare(b.adset);
            }
            const av = a.totals[sortKey];
            const bv = b.totals[sortKey];
            if (av === null && bv === null) return 0;
            if (av === null) return 1; // null vai pro fim
            if (bv === null) return -1;
            return sortDesc ? bv - av : av - bv;
        });
        return arr;
    }, [conjuntos, sortKey, sortDesc]);

    function toggleSort(key: SortKey) {
        if (key === sortKey) {
            setSortDesc((prev) => !prev);
        } else {
            setSortKey(key);
            setSortDesc(true); // nova coluna começa em ordem decrescente
        }
    }

    // O ícone ocupa um slot de largura fixa mesmo na coluna inativa. Sem isso, a
    // seta muda de coluna a cada clique, a largura das duas colunas muda junto e
    // toda a tabela desliza na horizontal — o clique seguinte, no mesmo ponto da
    // tela, cairia numa coluna vizinha.
    //
    // A seta da coluna ativa é roxa; a que aparece no hover é apagada. São dois
    // sinais distintos: "esta coluna ordena" e "esta coluna é clicável".
    const SortIcon = ({ active }: { active: boolean }) => (
        <span
            aria-hidden="true"
            className={`inline-flex w-3.5 shrink-0 justify-center ${
                active ? "text-primary" : "opacity-0 group-hover:opacity-25"
            }`}
        >
            {active && !sortDesc ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
    );

    // Coluna que ordena fica destacada; as demais permanecem discretas.
    const thClass = (key: SortKey): string =>
        sortKey === key ? "bg-primary/10 text-text" : "text-text-muted hover:text-text";

    return (
        <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full border-collapse text-sm">
                <thead>
                    <tr className="border-b border-border bg-surface">
                        {/* 1ª coluna fixa: nome do conjunto */}
                        <th
                            onClick={() => toggleSort("adset")}
                            className="group sticky left-0 z-10 cursor-pointer bg-surface px-4 py-3 text-left font-medium text-text-muted hover:text-text"
                        >
                            <span className="flex items-center gap-1">
                                Conjunto <SortIcon active={sortKey === "adset"} />
                            </span>
                        </th>
                        {showCampaign && (
                            <th className="px-4 py-3 text-left font-medium text-text-muted">Campanha</th>
                        )}
                        {metricCols.map((key) => (
                            <th
                                key={key}
                                onClick={() => toggleSort(key)}
                                className={`group cursor-pointer whitespace-nowrap px-4 py-3 text-right font-medium transition-colors ${thClass(key)}`}
                            >
                                <span className="flex items-center justify-end gap-1">
                                    {METRIC_LABELS[key]} <SortIcon active={sortKey === key} />
                                </span>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {sorted.map((c) => (
                        <tr key={`${c.campaign}|||${c.adset}`} className="border-b border-border last:border-0">
                            <td
                                className="sticky left-0 z-10 max-w-[220px] truncate bg-surface px-4 py-3 font-medium"
                                title={c.adset}
                            >
                                {c.adset}
                            </td>
                            {showCampaign && (
                                <td className="max-w-[220px] truncate px-4 py-3 text-text-muted" title={c.campaign}>
                                    {c.campaign}
                                </td>
                            )}
                            {metricCols.map((key) => (
                                <td key={key} className="whitespace-nowrap px-4 py-3 text-right">
                                    {formatMetric(key, c.totals[key]) ?? <span className="text-text-muted">–</span>}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
