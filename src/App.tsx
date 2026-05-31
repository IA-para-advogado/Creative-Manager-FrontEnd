import { RouterProvider } from "react-router-dom"
import { router } from '../src/routes/index'

function App() {
    return <RouterProvider router={router} />
}

export default App;