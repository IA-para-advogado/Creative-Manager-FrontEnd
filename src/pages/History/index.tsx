import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { History, Trash2, Eye, Calendar, Wallet, TrendingUp } from "lucide-react";
import { getHistory, removeFromHistory, type HistoryRecord } from "../../lib/history";
import { useCsv } from "../../contexts/CsvContext";
import { fmtCurrency } from "../../lib/meta";

// "2026-06-28T14:30:00.000Z" -> "28/06/2026 às 14:30"
const fmtDateTime = (iso: string): string => {
    try {
        const d = new Date(iso);
        return d.toLocaleDateString("pt-BR") + " às " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    } catch {
        return iso;
    }
};

export function HistoryPage() {
    const [history, setHistory] = useState<HistoryRecord[]>([]);
    const { setAnalysis, setSelected, setTab } = useCsv();
    const navigate = useNavigate();

    useEffect(() => {
        setHistory(getHistory());
    }, []);

    function handleView(record: HistoryRecord) {
        setAnalysis(record.analysis);
        // Reset selections to view all campaigns of that analysis
        setSelected(new Set(record.analysis.byCampaign.map((c) => c.name)));
        setTab("overview");
        navigate("/");
        toast.success("Análise carregada do histórico.");
    }

    function handleDelete(id: string) {
        if (!confirm("Tem certeza que deseja excluir esta análise salva?")) return;
        removeFromHistory(id);
        setHistory(getHistory());
        toast.success("Item removido.");
    }

    return (
        <div className="mx-auto max-w-4xl space-y-8 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold">Histórico</h1>
                <p className="text-sm text-text-muted mt-1">
                    Análises salvas.
                </p>
            </div>

            {history.length === 0 ? (
                <div
                    className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface text-center shadow-sm"
                    style={{ minHeight: "380px", padding: "72px 24px" }}
                >
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/15">
                        <History className="h-10 w-10 text-primary" />
                    </div>
                    <h2 className="mb-3 text-xl font-bold text-text">Nenhum histórico salvo</h2>
                    <p className="max-w-md text-sm leading-relaxed text-text-muted">
                        Para salvar uma análise, vá até o Dashboard e clique no botão{" "}
                        <span className="font-semibold text-text">"Salvar"</span>.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {history.map((record) => {
                        // Calcula totais rapidamente para mostrar um resumo no card
                        let spend = 0;
                        let revenue = 0;
                        for (const row of record.analysis.rows) {
                            if (row.spend) spend += row.spend;
                            if (row.revenue) revenue += row.revenue;
                        }

                        return (
                            <div key={record.id} className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border bg-surface p-5 transition-all hover:border-primary/50 hover:shadow-md">
                                <div className="space-y-2 flex-1">
                                    <h3 className="text-lg font-semibold text-text group-hover:text-primary transition-colors">{record.title}</h3>
                                    <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted">
                                        <span className="flex items-center gap-1.5">
                                            <Calendar size={14} />
                                            Salvo em: {fmtDateTime(record.createdAt)}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Wallet size={14} />
                                            Gasto: {fmtCurrency(spend)}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <TrendingUp size={14} />
                                            Receita: {fmtCurrency(revenue)}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <History size={14} />
                                            {record.analysis.byCampaign.length} campanhas
                                        </span>
                                    </div>
                                </div>

                                <div className="flex shrink-0 items-center gap-2">
                                    <button
                                        onClick={() => handleView(record)}
                                        className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary/90"
                                    >
                                        <Eye size={16} />
                                        Visualizar
                                    </button>
                                    <button
                                        onClick={() => handleDelete(record.id)}
                                        className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-warning/10 hover:text-warning hover:border-warning/30"
                                        title="Excluir"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
