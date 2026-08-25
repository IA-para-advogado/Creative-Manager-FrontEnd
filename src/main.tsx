import { createRoot } from "react-dom/client";
import "./global.css";
import App from "./App.tsx";

import { Toaster } from "sonner";

createRoot(document.getElementById("root")!).render(
    <>
        <Toaster richColors position="top-left" theme="dark" />
        <App />
    </>,
);
