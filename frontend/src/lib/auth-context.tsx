"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import api from "./api";
import { TOKEN_COOKIE } from "./constants";
import type { AuthResponse, JwtPayload, LoginPayload, Role, User } from "@/types";

interface AuthContextValue {
  user: User | null;
  role: Role | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  logout: () => void;
  hasRole: (...roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function userFromToken(token: string): User | null {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    if (decoded.exp * 1000 < Date.now()) return null;
    return {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name ?? decoded.email,
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Hydrate from an existing cookie on first load (page refresh).
  useEffect(() => {
    const token = Cookies.get(TOKEN_COOKIE);
    if (token) {
      const decodedUser = userFromToken(token);
      if (decodedUser) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing React state with the browser cookie on mount is the intended use of an effect here
        setUser(decodedUser);
      } else {
        Cookies.remove(TOKEN_COOKIE);
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const { data } = await api.post<AuthResponse>("/auth/login", payload);
    Cookies.set(TOKEN_COOKIE, data.token, {
      expires: 1, // days
      sameSite: "lax",
    });
    setUser(data.user ?? userFromToken(data.token));
    return data.user;
  }, []);

  const logout = useCallback(() => {
    Cookies.remove(TOKEN_COOKIE);
    setUser(null);
    router.push("/login");
  }, [router]);

  const hasRole = useCallback(
    (...roles: Role[]) => !!user && roles.includes(user.role),
    [user]
  );

  const value = useMemo(
    () => ({
      user,
      role: user?.role ?? null,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
      hasRole,
    }),
    [user, isLoading, login, logout, hasRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
