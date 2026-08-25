import { createBrowserRouter } from "react-router-dom";
import { Layout } from "../components/Layout";
import { RequireAuth } from "./RequireAuth";
import { DashboardPage } from "../pages/Dashboard";
import { SettingsPage } from "../pages/Settings";
import { LoginPage } from "../pages/Auth/Login";
import { RegisterPage } from "../pages/Auth/Register";
import { ForgotPasswordPage } from "../pages/Auth/ForgotPassword";
import { ResetPasswordPage } from "../pages/Auth/ResetPassword";
import { EmailConfirmPage } from "../pages/Auth/ConfirmEmail";
import { ConfirmedPage } from "../pages/Auth/Confirmed";

export const router = createBrowserRouter([
    // Área pública (autenticação) — sem o shell logado.
    {
        path: "/auth",
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
            { path: "configuracoes", element: <SettingsPage /> },
            // Próximas telas (Histórico...) entram aqui.
        ],
    },
]);
