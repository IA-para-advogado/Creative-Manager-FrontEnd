import { createBrowserRouter, Outlet } from "react-router-dom";
import { Layout } from "../components/Layout";
import { RequireAuth } from "./RequireAuth";
import { PublicOnlyRoute } from "./PublicOnlyRoute";
import { DashboardPage } from "../pages/Dashboard";
import { HistoryPage } from "../pages/History";
import { SettingsPage } from "../pages/Settings";
import { LoginPage } from "../pages/Auth/Login";
import { RegisterPage } from "../pages/Auth/Register";
import { ForgotPasswordPage } from "../pages/Auth/ForgotPassword";
import { ResetPasswordPage } from "../pages/Auth/ResetPassword";
import { EmailConfirmPage } from "../pages/Auth/ConfirmEmail";
import { ConfirmedPage } from "../pages/Auth/Confirmed";

function PublicLayout() {
    return <Outlet />;
}

export const router = createBrowserRouter([
    // Área pública (autenticação) — se já estiver logado, redireciona para o dashboard "/"
    {
        path: "/auth",
        element: (
            <PublicOnlyRoute>
                <PublicLayout />
            </PublicOnlyRoute>
        ),
        children: [
            { path: "login", element: <LoginPage /> },
            { path: "register", element: <RegisterPage /> },
            { path: "forgotpassword", element: <ForgotPasswordPage /> },
            { path: "resetpassword", element: <ResetPasswordPage /> },
            { path: "emailconfirm", element: <EmailConfirmPage /> },
            { path: "confirmed", element: <ConfirmedPage /> },
        ],
    },

    // Área privada (logada) — protegida pelo guard e embrulhada pelo Layout.
    {
        element: (
            <RequireAuth>
                <Layout />
            </RequireAuth>
        ),
        children: [
            { path: "/", element: <DashboardPage /> },
            { path: "historico", element: <HistoryPage /> },
            { path: "configuracoes", element: <SettingsPage /> },
        ],
    },
]);
