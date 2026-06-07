import { createBrowserRouter } from "react-router-dom";
import { HomePage } from "../pages/Home";
import { LoginPage } from "../pages/Login";
import { RegisterPage } from "../pages/Register";
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
                        path: 'login',
                        element: <LoginPage />
                    },
                    {
                        path: 'register',
                        element: <RegisterPage />
                    }
                ]
            },
            
        ],
    },
]);
