import { type LucideIcon } from "lucide-react";

interface KpiCardProps {
    label: string;
    // Valor já formatado. null → exibe "–" (métrica ausente/não medida).
    value: string | null;
    icon?: LucideIcon;
    hint?: string;
    // Realce opcional para métrica boa/ruim (usa os tokens success/danger).
    tone?: "default" | "good" | "bad";
}

export function KpiCard({ label, value, icon: Icon, hint, tone = "default" }: KpiCardProps) {
    const valueColor =
        tone === "good" ? "text-success" : tone === "bad" ? "text-danger" : "text-text";

    return (
        <div className="rounded-2xl border border-border bg-surface p-5">
            <div className="mb-2 flex items-center gap-2 text-text-muted">
                {Icon && <Icon size={16} />}
                <span className="text-sm font-medium">{label}</span>
            </div>

            <div className={`text-2xl font-bold ${value === null ? "text-text-muted" : valueColor}`}>
                {value ?? "–"}
            </div>

            {hint && <div className="mt-1 text-xs text-text-muted">{hint}</div>}
        </div>
    );
}
