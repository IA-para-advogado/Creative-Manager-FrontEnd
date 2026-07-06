import axios from "axios";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BACKEND,
});

// Reidrata o header de auth ao carregar o app: o token persiste no localStorage,
// mas o header default do axios é perdido a cada refresh. Sem isso, a área logada
// perderia a autenticação ao recarregar a página.
const token = localStorage.getItem("@CM:access_token");
if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}
