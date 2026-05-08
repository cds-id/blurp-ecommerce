"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  clearSession,
  getAccessToken,
  setAccessToken,
  setRefreshToken,
  setStoredUser,
  type StoredUser,
} from "@/src/lib/auth/session";
import {
  login as loginApi,
  register as registerApi,
  requestMagicLink as requestMagicLinkApi,
  magicLinkCallback as magicLinkCallbackApi,
  logoutApi,
  forgotPassword as forgotPasswordApi,
  resetPassword as resetPasswordApi,
  type AuthResponse,
  type LoginPayload,
  type RegisterPayload,
} from "@/src/lib/api/auth";
import {
  changePassword as changePasswordApi,
  getMe,
  updateMe as updateMeApi,
  type UserProfile,
  type UpdateProfilePayload,
  type ChangePasswordPayload,
} from "@/src/lib/api/users";

interface AuthContextValue {
  /** Cached light user (id + email) — instantly available. */
  user: StoredUser | null;
  /** Full profile fetched from /api/users/me (null until loaded). */
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (payload: LoginPayload) => Promise<AuthResponse>;
  register: (payload: RegisterPayload) => Promise<AuthResponse>;
  requestMagicLink: (email: string) => Promise<void>;
  completeMagicLink: (email: string, token: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;

  refreshProfile: () => Promise<UserProfile | null>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<UserProfile>;
  changePassword: (payload: ChangePasswordPayload) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, new_password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function persistAuth(res: AuthResponse): StoredUser {
  const user: StoredUser = { id: res.user_id, email: res.email };
  setAccessToken(res.access_token);
  setRefreshToken(res.refresh_token);
  setStoredUser(user);
  return user;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async (): Promise<UserProfile | null> => {
    if (!getAccessToken()) {
      setProfile(null);
      return null;
    }
    try {
      const p = await getMe();
      setProfile(p);
      const cached: StoredUser = { id: p.id, email: p.email };
      setStoredUser(cached);
      setUser(cached);
      return p;
    } catch {
      // Token invalid / refresh failed → clear.
      clearSession();
      setUser(null);
      setProfile(null);
      return null;
    }
  }, []);

  // Boot
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = getAccessToken();
      if (!token) {
        setIsLoading(false);
        return;
      }
      // Eager seed from localStorage.
      const cachedRaw = typeof window !== "undefined" ? window.localStorage.getItem("blurp.user") : null;
      if (cachedRaw) {
        try {
          setUser(JSON.parse(cachedRaw) as StoredUser);
        } catch {
          /* ignore */
        }
      }
      await fetchProfile();
      if (!cancelled) setIsLoading(false);
    })();

    function onStorage(e: StorageEvent) {
      if (!e.key || e.key.startsWith("blurp.")) {
        if (!getAccessToken()) {
          setUser(null);
          setProfile(null);
        } else {
          fetchProfile();
        }
      }
    }
    window.addEventListener("storage", onStorage);
    return () => {
      cancelled = true;
      window.removeEventListener("storage", onStorage);
    };
  }, [fetchProfile]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const res = await loginApi(payload);
      setUser(persistAuth(res));
      await fetchProfile();
      return res;
    },
    [fetchProfile],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const res = await registerApi(payload);
      setUser(persistAuth(res));
      await fetchProfile();
      return res;
    },
    [fetchProfile],
  );

  const requestMagicLink = useCallback(async (email: string) => {
    await requestMagicLinkApi(email);
  }, []);

  const completeMagicLink = useCallback(
    async (email: string, token: string) => {
      const res = await magicLinkCallbackApi(email, token);
      setUser(persistAuth(res));
      await fetchProfile();
      return res;
    },
    [fetchProfile],
  );

  const logout = useCallback(async () => {
    const token = getAccessToken();
    if (token) {
      try {
        await logoutApi(token);
      } catch {
        /* ignore */
      }
    }
    clearSession();
    setUser(null);
    setProfile(null);
  }, []);

  const updateProfile = useCallback(async (payload: UpdateProfilePayload) => {
    const updated = await updateMeApi(payload);
    setProfile(updated);
    const cached: StoredUser = { id: updated.id, email: updated.email };
    setStoredUser(cached);
    setUser(cached);
    return updated;
  }, []);

  const changePassword = useCallback(async (payload: ChangePasswordPayload) => {
    await changePasswordApi(payload);
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    await forgotPasswordApi(email);
  }, []);

  const resetPassword = useCallback(async (token: string, new_password: string) => {
    await resetPasswordApi(token, new_password);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      requestMagicLink,
      completeMagicLink,
      logout,
      refreshProfile: fetchProfile,
      updateProfile,
      changePassword,
      forgotPassword,
      resetPassword,
    }),
    [
      user,
      profile,
      isLoading,
      login,
      register,
      requestMagicLink,
      completeMagicLink,
      logout,
      fetchProfile,
      updateProfile,
      changePassword,
      forgotPassword,
      resetPassword,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function useOptionalAuth(): AuthContextValue | null {
  return useContext(AuthContext);
}
