import { useEffect, useRef, useState } from "react";
import { Filter, Check, ChevronDown } from "lucide-react";

interface CampaignFilterProps {
    campaigns: string[]; // todas as campanhas do arquivo, já ordenadas por gasto
    selected: Set<string>;
    onChange: (next: Set<string>) => void;
}

// Filtro de campanhas com seleção múltipla. Substitui o <select> simples, que
// só permitia "uma" ou "todas" — aqui o usuário monta o recorte que quiser, e
// esse recorte vale para os KPIs, a tabela de conjuntos e o relatório.
export function CampaignFilter({ campaigns, selected, onChange }: CampaignFilterProps) {
    const [open, setOpen] = useState<boolean>(false);
    const boxRef = useRef<HTMLDivElement>(null);

    // Fecha ao clicar fora ou apertar Esc — comportamento esperado de dropdown.
    useEffect(() => {
        if (!open) return;

        function onPointerDown(e: MouseEvent) {
            if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
        }
        function onKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") setOpen(false);
        }

        document.addEventListener("mousedown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("mousedown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open]);

    const isAll = selected.size === campaigns.length && campaigns.length > 0;

    function toggle(name: string) {
        const next = new Set(selected);
        if (next.has(name)) {
            next.delete(name);
        } else {
            next.add(name);
        }
        onChange(next);
    }

    // Rótulo do botão: resume o recorte sem estourar a largura.
    const label =
        selected.size === 0
            ? "Nenhuma campanha"
            : isAll
              ? "Todas as campanhas"
              : selected.size === 1
                ? [...selected][0]
                : `${selected.size} campanhas`;

    return (
        <div ref={boxRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="true"
                aria-expanded={open}
                // Largura fixa: o rótulo varia de "Todas as campanhas" ao nome
                // inteiro de uma campanha, e um botão elástico faria o cabeçalho
                // inteiro se deslocar a cada troca de recorte.
                className={`flex w-full items-center gap-2 rounded-md border bg-surface px-3 py-2 text-sm text-text transition-colors sm:w-[15rem] ${
                    open ? "border-primary" : "border-border hover:border-primary/60"
                }`}
            >
                <Filter size={16} className="shrink-0 text-text-muted" />
                <span className="flex-1 truncate text-left" title={label}>
                    {label}
                </span>
                <ChevronDown
                    size={16}
                    className={`shrink-0 text-text-muted transition-transform ${open ? "rotate-180" : ""}`}
                />
            </button>

            {open && (
                <div className="absolute right-0 z-20 mt-2 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-border bg-surface shadow-xl">
                    {/* Atalhos: montar o recorte inteiro ou zerar para escolher poucas. */}
                    <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
                        <span className="text-xs text-text-muted">
                            {selected.size} de {campaigns.length} selecionadas
                        </span>
                        <div className="flex gap-1">
                            <button
                                type="button"
                                onClick={() => onChange(new Set(campaigns))}
                                className="rounded px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
                            >
                                Todas
                            </button>
                            <button
                                type="button"
                                onClick={() => onChange(new Set())}
                                className="rounded px-2 py-1 text-xs font-medium text-text-muted hover:bg-background hover:text-text"
                            >
                                Limpar
                            </button>
                        </div>
                    </div>

                    <ul className="max-h-72 overflow-y-auto py-1">
                        {campaigns.map((name) => {
                            const checked = selected.has(name);
                            return (
                                <li key={name}>
                                    <button
                                        type="button"
                                        onClick={() => toggle(name)}
                                        className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-background"
                                    >
                                        <span
                                            className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                                                checked
                                                    ? "border-primary bg-primary text-white"
                                                    : "border-border"
                                            }`}
                                        >
                                            {checked && <Check size={12} strokeWidth={3} />}
                                        </span>
                                        <span className={checked ? "text-text" : "text-text-muted"}>
                                            {name}
                                        </span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
}
