import { createBrowserRouter } from "react-router-dom";
import { HomePage } from "../pages/Home";
import { LoginPage } from "../pages/Auth/Login";
import { RegisterPage } from "../pages/Auth/Register";
import { ForgotPasswordPage } from "../pages/Auth/ForgotPassword";
import { ResetPasswordPage } from "../pages/Auth/ResetPassword";
import { EmailConfirmPage } from "../pages/Auth/ConfirmEmail";
/* import { Layout } from "../components/Layout"*/

export const router = createBrowserRouter([
    {
        // element: <Layout />,

        children: [
            {
                path: "/",
                element: <HomePage />,
            },
            {
                path: "/auth",
                children: [
                    {
                        path: "login",
                        element: <LoginPage />,
                    },
                    {
                        path: "register",
                        element: <RegisterPage />,
                    },
                    {
                        path: "forgotpassword",
                        element: <ForgotPasswordPage />
                    },
                    {
                        path: "resetpassword",
                        element: <ResetPasswordPage />
                    },
                    {
                        path: "emailconfirm",
                        element: <EmailConfirmPage />
                    }
                ],
            },
        ],
    },
]);
