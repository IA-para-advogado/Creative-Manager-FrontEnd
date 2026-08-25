import { UploadCloud } from "lucide-react";

// Placeholder da Visão geral. Será substituído pelo Dashboard real (tela 3),
// que monta os KPIs e gráficos a partir do CSV.
export function HomePage() {
    return (
        <div className="mx-auto max-w-2xl">
            <div className="rounded-2xl border border-border bg-surface p-8 text-center">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/15">
                    <UploadCloud className="h-7 w-7 text-primary" />
                </div>
                <h2 className="mb-2 text-xl font-bold">Nenhuma análise ainda</h2>
                <p className="text-sm text-text-muted">
                    Suba um CSV de campanha do Meta Ads para gerar os dashboards e o
                    relatório. Esta é a Visão geral — os cartões e gráficos aparecem aqui
                    assim que a primeira análise for criada.
                </p>
            </div>
        </div>
    );
}
