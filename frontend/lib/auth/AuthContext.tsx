"use client";

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import * as authApi from "@/lib/api/auth";
import { clearToken, getToken, setToken } from "@/lib/api/client";
import type { Usuario } from "@/lib/api/types";

interface AuthContextValue {
  user: Usuario | null;
  isLoading: boolean;
  login: (email: string, senha: string) => Promise<Usuario>;
  register: (payload: authApi.RegisterPayload) => Promise<Usuario>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(() => !!getToken());

  useEffect(() => {
    if (!getToken()) return;

    authApi
      .me()
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, senha: string) => {
    const response = await authApi.login({ email, senha });
    setToken(response.accessToken);
    setUser(response.usuario);
    return response.usuario;
  }, []);

  const register = useCallback(async (payload: authApi.RegisterPayload) => {
    const response = await authApi.register(payload);
    setToken(response.accessToken);
    setUser(response.usuario);
    return response.usuario;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return context;
}

export function dashboardPathForPapel(papel: Usuario["papel"]) {
  if (papel === "COLETOR") return "/coletor/dashboard";
  if (papel === "PREFEITURA") return "/prefeitura/dashboard";
  return "/doador/dashboard";
}
