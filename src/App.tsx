import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { AuthProvider } from "./contexts/AuthContext";
import { CsvProvider } from "./contexts/CsvContext";

function App() {
    return (
        <AuthProvider>
            <CsvProvider>
                <RouterProvider router={router} />
            </CsvProvider>
        </AuthProvider>
    );
}

export default App;