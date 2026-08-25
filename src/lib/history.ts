import { type AnalysisResult } from "./meta";

export interface HistoryRecord {
    id: string;
    createdAt: string;
    title: string;
    analysis: AnalysisResult;
}

const STORAGE_KEY = "@CM:history";

export function getHistory(): HistoryRecord[] {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            return JSON.parse(data);
        }
    } catch (error) {
        console.error("Erro ao carregar histórico:", error);
    }
    return [];
}

export function saveToHistory(title: string, analysis: AnalysisResult): boolean {
    try {
        const history = getHistory();
        const newRecord: HistoryRecord = {
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            title,
            analysis,
        };
        history.unshift(newRecord);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
        return true;
    } catch (error) {
        console.error("Erro ao salvar no histórico (limite de espaço?):", error);
        return false;
    }
}

export function removeFromHistory(id: string): void {
    const history = getHistory();
    const newHistory = history.filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
}
