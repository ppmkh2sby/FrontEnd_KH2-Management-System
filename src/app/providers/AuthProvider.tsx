import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { http } from "@/shared/lib/http";
import {
  clearStoredAccessToken,
  getStoredAccessToken,
  setStoredAccessToken,
} from "@/shared/lib/storage";
import type {
  AuthContextValue,
  AuthMeResponse,
  LoginRequest,
  LoginResponse,
} from "@/shared/types/auth";
import { getPostLoginRoute } from "@/shared/lib/auth";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthMeResponse | null>(null);
  const [token, setToken] = useState<string | null>(getStoredAccessToken());
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const bootstrap = useCallback(async () => {
    const storedToken = getStoredAccessToken();

    if (!storedToken) {
      setIsBootstrapping(false);
      return;
    }

    try {
      const me = await http<AuthMeResponse>("/api/v1/auth/me", {
        method: "GET",
        accessToken: storedToken,
      });

      setToken(storedToken);
      setUser(me);
    } catch {
      clearStoredAccessToken();
      setToken(null);
      setUser(null);
    } finally {
      setIsBootstrapping(false);
    }
  }, []);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const login = useCallback(async (payload: LoginRequest) => {
    const response = await http<LoginResponse>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    setStoredAccessToken(response.accessToken);
    setToken(response.accessToken);

    const me = await http<AuthMeResponse>("/api/v1/auth/me", {
      method: "GET",
      accessToken: response.accessToken,
    });

    setUser(me);

    return getPostLoginRoute(response);
  }, []);

  const logout = useCallback(async () => {
    const currentToken = getStoredAccessToken();

    try {
      if (currentToken) {
        await http<void>("/api/v1/auth/logout", {
          method: "POST",
          accessToken: currentToken,
        });
      }
    } catch {
      // noop: logout client tetap harus bersih walau request gagal
    } finally {
      clearStoredAccessToken();
      setToken(null);
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      isBootstrapping,
      login,
      logout,
    }),
    [user, token, isBootstrapping, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth harus digunakan di dalam AuthProvider.");
  }

  return context;
}