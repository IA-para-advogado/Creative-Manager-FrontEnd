import { createBrowserRouter } from "react-router-dom";
import { Layout } from "../components/Layout";
import { RequireAuth } from "./RequireAuth";
import { DashboardPage } from "../pages/Dashboard";
import { LoginPage } from "../pages/Auth/Login";
import { RegisterPage } from "../pages/Auth/Register";
import { ForgotPasswordPage } from "../pages/Auth/ForgotPassword";
import { ResetPasswordPage } from "../pages/Auth/ResetPassword";
import { EmailConfirmPage } from "../pages/Auth/ConfirmEmail";

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
            // Próximas telas (Histórico, Configurações...) entram aqui.
        ],
    },
]);
