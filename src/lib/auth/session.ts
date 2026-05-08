// Client-side session storage. JWT access token + guest id.
// Backend issues 15-min access tokens (no refresh flow yet — see MISSING_API.md).

const TOKEN_KEY = "blurp.access_token";
const REFRESH_KEY = "blurp.refresh_token";
const USER_KEY = "blurp.user";
const GUEST_KEY = "blurp.guest_id";

export interface StoredUser {
  id: string;
  email: string;
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getAccessToken(): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string | null): void {
  if (!isBrowser()) return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(REFRESH_KEY);
}

export function setRefreshToken(token: string | null): void {
  if (!isBrowser()) return;
  if (token) window.localStorage.setItem(REFRESH_KEY, token);
  else window.localStorage.removeItem(REFRESH_KEY);
}

export function getStoredUser(): StoredUser | null {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export function setStoredUser(user: StoredUser | null): void {
  if (!isBrowser()) return;
  if (user) window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  else window.localStorage.removeItem(USER_KEY);
}

export function getGuestId(): string | null {
  if (!isBrowser()) return null;
  let id = window.localStorage.getItem(GUEST_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(GUEST_KEY, id);
  }
  return id;
}

export function clearGuestId(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(GUEST_KEY);
}

export function clearSession(): void {
  setAccessToken(null);
  setRefreshToken(null);
  setStoredUser(null);
}

interface JwtClaims {
  sub: string;
  email: string;
  iat: number;
  exp: number;
}

/** Decode JWT (no signature verification — frontend only). */
export function decodeJwt(token: string): JwtClaims | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    // base64url -> base64
    const b64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    const json = typeof atob === "function" ? atob(padded) : Buffer.from(padded, "base64").toString();
    return JSON.parse(json) as JwtClaims;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const claims = decodeJwt(token);
  if (!claims) return true;
  return claims.exp * 1000 < Date.now();
}
