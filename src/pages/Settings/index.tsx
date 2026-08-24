import { useState } from "react";
import { User, Shield, Key } from "lucide-react";
import { ProfileTab } from "./ProfileTab";
import { AccountTab } from "./AccountTab";
import { SecurityTab } from "./SecurityTab";

type Tab = "profile" | "account" | "security";

export function SettingsPage() {
    const [activeTab, setActiveTab] = useState<Tab>("profile");

    const tabs = [
        { id: "profile", label: "Perfil", icon: User },
        { id: "security", label: "Segurança", icon: Key },
        { id: "account", label: "Conta", icon: Shield },
    ] as const;

    return (
        <div className="mx-auto max-w-4xl space-y-8">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Configurações</h2>
                <p className="text-text-muted mt-1">
                    Gerencie suas informações pessoais e de segurança.
                </p>
            </div>

            <div className="flex flex-col gap-6 md:flex-row">
                {/* Menu lateral de abas (desktop) ou superior (mobile) */}
                <aside className="w-full md:w-64 shrink-0">
                    <nav className="flex space-x-2 md:flex-col md:space-x-0 md:space-y-1 overflow-x-auto pb-2 md:pb-0">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as Tab)}
                                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                                    ? "bg-primary/20 text-primary"
                                    : "text-text-muted hover:bg-surface hover:text-text"
                                    }`}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Conteúdo da aba */}
                <div className="flex-1 min-w-0">
                    {activeTab === "profile" && <ProfileTab />}
                    {activeTab === "security" && <SecurityTab />}
                    {activeTab === "account" && <AccountTab />}
                </div>
            </div>
        </div>
    );
}
