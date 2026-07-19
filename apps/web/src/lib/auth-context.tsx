"use client";
/* eslint-disable no-unused-vars */

import { createContext, useContext, useState, type ReactNode } from "react";

interface AuthUser {
  id?: string;
  name?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  theme?: string;
  [key: string]: unknown;
}

type LoginFn = (accessToken: string, authUser: AuthUser) => void;

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: LoginFn;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

function loadToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("fos_access_token");
}

function loadUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem("fos_user");
    return saved ? JSON.parse(saved) : null;
  } catch { return null; }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(loadToken);
  const [user, setUser] = useState<AuthUser | null>(loadUser);

  const login = (accessToken: string, authUser: AuthUser) => {
    localStorage.setItem("fos_access_token", accessToken);
    localStorage.setItem("fos_user", JSON.stringify(authUser));
    setToken(accessToken);
    setUser(authUser);
    window.dispatchEvent(new Event("storage"));
  };

  const logout = () => {
    localStorage.removeItem("fos_access_token");
    localStorage.removeItem("fos_user");
    setToken(null);
    setUser(null);
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
