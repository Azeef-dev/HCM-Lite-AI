import { createContext, useContext, useEffect, useState } from "react";
import { authApi, api } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    async function loadMe() {
        const token = api.getToken();
        if (!token) {
            setUser(null);
            setLoading(false);
            return null;
        }
        try {
            const data = await authApi.me();
            const u = data.user || data;
            setUser(u);
            return u;
        } catch {
            api.setToken(null);
            setUser(null);
            return null;
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadMe();
    }, []);

    async function login(email, password) {
        const data = await authApi.login({ email, password });
        api.setToken(data.token);
        setUser(data.user);
        return data.user;
    }

    async function registerCompany(payload) {
        const data = await authApi.registerCompany(payload);
        api.setToken(data.token);
        setUser(data.user);
        return data.user;
    }

    async function registerUser(payload) {
        const data = await authApi.registerUser(payload);
        api.setToken(data.token);
        setUser(data.user);
        return data.user;
    }

    function logout() {
        api.setToken(null);
        setUser(null);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                loading,
                login,
                registerCompany,
                registerUser,
                logout,
                refresh: loadMe,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
