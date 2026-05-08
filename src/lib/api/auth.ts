import { apiFetch } from "./client";

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user_id: string;
  email: string;
}

export interface MagicLinkResponse {
  message: string;
}

export interface RegisterPayload {
  email: string;
  username: string;
  password: string;
  name?: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

/** POST /api/auth/magic-link */
export function requestMagicLink(email: string): Promise<MagicLinkResponse> {
  return apiFetch<MagicLinkResponse>("/api/auth/magic-link", {
    method: "POST",
    json: { email },
    auth: false,
    guest: false,
  });
}

/** POST /api/auth/callback */
export function magicLinkCallback(email: string, token: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/api/auth/callback", {
    method: "POST",
    json: { email, token },
    auth: false,
    guest: false,
  });
}

/** POST /api/auth/register */
export function register(payload: RegisterPayload): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/api/auth/register", {
    method: "POST",
    json: payload,
    auth: false,
    guest: false,
  });
}

/** POST /api/auth/login */
export function login(payload: LoginPayload): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/api/auth/login", {
    method: "POST",
    json: payload,
    auth: false,
    guest: false,
  });
}

/** POST /api/auth/refresh */
export function refresh(refresh_token: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/api/auth/refresh", {
    method: "POST",
    json: { refresh_token },
    auth: false,
    guest: false,
  });
}

/** POST /api/auth/forgot-password */
export function forgotPassword(email: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/api/auth/forgot-password", {
    method: "POST",
    json: { email },
    auth: false,
    guest: false,
  });
}

/** POST /api/auth/reset-password */
export function resetPassword(token: string, new_password: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/api/auth/reset-password", {
    method: "POST",
    json: { token, new_password },
    auth: false,
    guest: false,
  });
}

/** POST /api/auth/logout */
export function logoutApi(token: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/api/auth/logout", {
    method: "POST",
    json: { token },
    auth: false,
    guest: false,
  });
}
