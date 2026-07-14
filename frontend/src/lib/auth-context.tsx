"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  api,
  clearToken,
  getToken,
  registerUnauthorizedHandler,
  setToken,
} from "@/lib/api";
import { ENDPOINTS } from "@/lib/constants";
import type { AuthResponse, Role, User } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  role: Role | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  hasRole: (...roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    router.replace("/login");
  }, [router]);

  // A 401 on any authenticated request means the session died. The api layer
  // calls this once, from one place, so we never get duplicate redirects.
  useEffect(() => {
    registerUnauthorizedHandler(() => {
      clearToken();
      setUser(null);
      router.replace("/login");
    });
  }, [router]);

  // Session restore. We ask the backend who we are rather than decoding the
  // JWT locally: a locally-decoded token can be expired or revoked and still
  // look valid, and /auth/me is the only thing that actually knows.
  useEffect(() => {
    let cancelled = false;

    async function restoreSession(): Promise<void> {
      if (getToken()) {
        try {
          const { user: restored } = await api.get<{ user: User }>(
            ENDPOINTS.auth.me
          );
          if (!cancelled) setUser(restored);
        } catch {
          // Expired or revoked. Drop it and fall through to signed-out.
          clearToken();
        }
      }
      if (!cancelled) setIsLoading(false);
    }

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token, user: signedIn } = await api.post<AuthResponse>(
      ENDPOINTS.auth.login,
      { email, password }
    );
    setToken(token);
    setUser(signedIn);
    return signedIn;
  }, []);

  const hasRole = useCallback(
    (...roles: Role[]) => (user ? roles.includes(user.role) : false),
    [user]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role: user?.role ?? null,
      isLoading,
      isAuthenticated: user !== null,
      login,
      logout,
      hasRole,
    }),
    [user, isLoading, login, logout, hasRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an <AuthProvider>");
  }
  return context;
}
