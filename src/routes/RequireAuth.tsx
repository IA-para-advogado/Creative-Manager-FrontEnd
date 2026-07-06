import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";

// Guarda da área logada: sem token salvo, redireciona para o login.
// Usa a mesma chave gravada no login (@CM:access_token).
export function RequireAuth({ children }: { children: ReactNode }) {
    const token = localStorage.getItem("@CM:access_token");

    // `replace` evita deixar a rota privada no histórico ao mandar pro login.
    if (!token) return <Navigate to="/auth/login" replace />;

    return <>{children}</>;
}
