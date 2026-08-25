import { createContext, useState, useEffect, type ReactNode } from "react";
import { api } from "../api/axios";
import type { User, UserMetadata } from "../types/User";

interface AuthContextData {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    updateUser: (data: Partial<UserMetadata>) => void;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

const STORAGE_TOKEN_KEY = "@CM:access_token";
const STORAGE_USER_KEY = "@CM:user";

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Reidrata a sessão a partir do localStorage
    useEffect(() => {
        try {
            const storedToken = localStorage.getItem(STORAGE_TOKEN_KEY);
            const storedUser = localStorage.getItem(STORAGE_USER_KEY);

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
                api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
            }
        } catch (error) {
            console.error("Erro ao reidratar sessão:", error);
            localStorage.removeItem(STORAGE_TOKEN_KEY);
            localStorage.removeItem(STORAGE_USER_KEY);
        } finally {
            setIsLoading(false);
        }
    }, []);

    async function signIn(email: string, password: string) {
        const response = await api.post("/auth/sign-in", { email, password });
        const authData = response.data?.data || response.data;
        const loggedUser = authData?.user;
        const accessToken = authData?.access_token;

        if (accessToken) {
            localStorage.setItem(STORAGE_TOKEN_KEY, accessToken);
            api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
            setToken(accessToken);
        }

        if (loggedUser) {
            localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(loggedUser));
            setUser(loggedUser);
        }
    }

    async function signOut() {
        try {
            await api.post("/auth/sign-out");
        } catch {
            // Ignora erro se chamada de sign-out falhar
        } finally {
            localStorage.removeItem(STORAGE_TOKEN_KEY);
            localStorage.removeItem(STORAGE_USER_KEY);
            delete api.defaults.headers.common["Authorization"];

            setToken(null);
            setUser(null);
        }
    }

    function updateUser(data: Partial<UserMetadata>) {
        if (!user) return;

        const updatedUser: User = {
            ...user,
            user_metadata: {
                ...user.user_metadata,
                ...data,
            },
        };

        setUser(updatedUser);
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(updatedUser));
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!token && !!user,
                isLoading,
                signIn,
                signOut,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
