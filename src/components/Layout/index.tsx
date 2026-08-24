import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
    LayoutDashboard,
    History,
    Settings,
    LogOut,
    Menu,
    X,
    type LucideIcon,
} from "lucide-react";
import { api } from "../../api/axios";

// Seções da área logada. `ready` marca o que já tem tela pronta; o restante
// aparece como "em breve" e é habilitado conforme cada tela vai sendo construída.
interface NavItem {
    label: string;
    to: string;
    icon: LucideIcon;
    ready: boolean;
}

const NAV_ITEMS: NavItem[] = [
    { label: "Visão geral",   to: "/",              icon: LayoutDashboard, ready: true  },
    { label: "Histórico",     to: "/historico",     icon: History,         ready: false },
    { label: "Configurações", to: "/configuracoes", icon: Settings,        ready: true },
];

// Formato mínimo do usuário salvo no login (objeto de usuário do Supabase).
interface StoredUser {
    email?: string;
    user_metadata?: { name?: string };
}

export function Layout() {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    // Controla o drawer no mobile; a partir de md a sidebar é fixa.
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

    // Usuário gravado no login (@CM:user), com parse protegido.
    const user = readStoredUser();
    const displayName = user?.user_metadata?.name ?? user?.email ?? "Usuário";
    const email = user?.email ?? "";
    const initials = getInitials(displayName);

    // Título da topbar = seção ativa (casa a rota atual com o item do menu).
    const currentSection = NAV_ITEMS.find((item) => item.to === pathname) ?? NAV_ITEMS[0];

    function handleLogout() {
        // Encerra a sessão no back, mas sem travar o logout se a chamada falhar.
        api.post("/auth/sign-out").catch(() => undefined);

        // Limpa o estado local (mesmas chaves gravadas no login) e o header do axios.
        localStorage.removeItem("@CM:access_token");
        localStorage.removeItem("@CM:user");
        delete api.defaults.headers.common["Authorization"];

        toast.success("Sessão encerrada.");
        navigate("/auth/login");
    }

    return (
        <div className="min-h-screen bg-background text-text flex">
            {/* Backdrop do drawer no mobile */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 z-30 bg-black/60 md:hidden"
                />
            )}

            {/* Sidebar: drawer no mobile, fixa a partir de md */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-surface transition-transform duration-300 md:static md:translate-x-0 ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                {/* Marca — mesmo monograma "CM" das telas de Auth, para coerência visual */}
                <div className="flex h-16 items-center gap-3 border-b border-border px-5">
                    <div className="relative h-9 w-9 shrink-0">
                        <div className="absolute inset-0 rounded-full bg-primary" />
                        <div className="absolute inset-[3px] flex items-center justify-center rounded-full bg-background">
                            <span className="text-sm font-extrabold">
                                C<span className="text-primary">M</span>
                            </span>
                        </div>
                    </div>
                    <span className="font-semibold tracking-tight">Creative Manager</span>

                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="ml-auto text-text-muted hover:text-text md:hidden"
                        aria-label="Fechar menu"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navegação entre seções */}
                <nav className="flex-1 space-y-1 overflow-y-auto p-3">
                    {NAV_ITEMS.map((item) =>
                        item.ready ? (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                // `end` evita que a rota "/" fique ativa em todas as outras.
                                end={item.to === "/"}
                                onClick={() => setSidebarOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                        isActive
                                            ? "bg-primary/10 text-primary"
                                            : "text-text-muted hover:bg-background hover:text-text"
                                    }`
                                }
                            >
                                <item.icon size={18} />
                                {item.label}
                            </NavLink>
                        ) : (
                            <div
                                key={item.to}
                                title="Em breve"
                                className="flex cursor-not-allowed items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-text-muted/50"
                            >
                                <item.icon size={18} />
                                {item.label}
                                <span className="ml-auto rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wide text-text-muted/70">
                                    em breve
                                </span>
                            </div>
                        ),
                    )}
                </nav>

                <div className="border-t border-border p-3 text-xs text-text-muted">
                    v1.0.0
                </div>
            </aside>

            {/* Coluna principal */}
            <div className="flex min-w-0 flex-1 flex-col">
                {/* Topbar */}
                <header className="flex h-16 items-center gap-4 border-b border-border bg-surface px-4 md:px-6">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-text-muted hover:text-text md:hidden"
                        aria-label="Abrir menu"
                    >
                        <Menu size={22} />
                    </button>

                    <h1 className="text-lg font-semibold">{currentSection.label}</h1>

                    {/* Usuário + logout */}
                    <div className="ml-auto flex items-center gap-3">
                        <div className="hidden text-right sm:block">
                            <p className="text-sm font-medium leading-tight">{displayName}</p>
                            {email && (
                                <p className="text-xs leading-tight text-text-muted">{email}</p>
                            )}
                        </div>

                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                            {initials}
                        </div>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-background hover:text-text"
                        >
                            <LogOut size={16} />
                            <span className="hidden sm:inline">Sair</span>
                        </button>
                    </div>
                </header>

                {/* Conteúdo das telas filhas (renderizadas pelo router) */}
                <main className="flex-1 p-4 md:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

// Lê e valida o usuário salvo no localStorage; retorna null se ausente/corrompido.
function readStoredUser(): StoredUser | null {
    try {
        const raw = localStorage.getItem("@CM:user");
        return raw ? (JSON.parse(raw) as StoredUser) : null;
    } catch {
        return null;
    }
}

// Gera as iniciais (até 2 letras) a partir do nome exibido.
function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
