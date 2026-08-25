import { createContext, useContext, useState, ReactNode } from "react";
import { type AnalysisResult } from "../lib/meta";

export type Tab = "overview" | "conjuntos" | "compare" | "report";

interface CsvContextData {
    analysis: AnalysisResult | null;
    setAnalysis: (a: AnalysisResult | null) => void;
    selected: Set<string>;
    setSelected: (s: Set<string>) => void;
    tab: Tab;
    setTab: (t: Tab) => void;
}

const CsvContext = createContext<CsvContextData | undefined>(undefined);

export function CsvProvider({ children }: { children: ReactNode }) {
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [tab, setTab] = useState<Tab>("overview");

    return (
        <CsvContext.Provider
            value={{
                analysis,
                setAnalysis,
                selected,
                setSelected,
                tab,
                setTab,
            }}
        >
            {children}
        </CsvContext.Provider>
    );
}

export function useCsv() {
    const context = useContext(CsvContext);
    if (!context) {
        throw new Error("useCsv must be used within a CsvProvider");
    }
    return context;
}
