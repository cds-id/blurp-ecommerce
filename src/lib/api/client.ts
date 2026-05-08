import { ApiError, ApiResponse } from "./types";
import {
  clearSession,
  getAccessToken,
  getGuestId,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "@/src/lib/auth/session";

const DEFAULT_BASE_URL = "http://localhost:8080";

export function getApiBaseUrl(): string {
  // Next.js public env. Set NEXT_PUBLIC_API_BASE_URL in .env.local.
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, "");
  }
  return DEFAULT_BASE_URL;
}

export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  /** JSON body. Will be stringified. */
  json?: unknown;
  /** Send Bearer token if available. Default true. */
  auth?: boolean;
  /** Send X-Guest-ID header if no auth. Default true. */
  guest?: boolean;
  /** Query params (string|number|boolean). Skips undefined. */
  query?: Record<string, string | number | boolean | undefined | null>;
  /** Internal: skip 401 auto-refresh (used by the refresh call itself). */
  _skipRefresh?: boolean;
}

function buildUrl(path: string, query?: ApiRequestOptions["query"]): string {
  const base = getApiBaseUrl();
  const url = path.startsWith("http") ? path : `${base}${path.startsWith("/") ? "" : "/"}${path}`;
  if (!query) return url;
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null) continue;
    usp.set(k, String(v));
  }
  const qs = usp.toString();
  return qs ? `${url}?${qs}` : url;
}

// In-flight refresh promise to avoid stampedes.
let refreshInFlight: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  refreshInFlight = (async () => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (!res.ok) {
        clearSession();
        return false;
      }
      const body = (await res.json()) as ApiResponse<{
        access_token: string;
        refresh_token: string;
      }>;
      if (!body.data) {
        clearSession();
        return false;
      }
      setAccessToken(body.data.access_token);
      setRefreshToken(body.data.refresh_token);
      return true;
    } catch {
      clearSession();
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

export async function apiFetch<T = unknown>(
  path: string,
  opts: ApiRequestOptions = {},
): Promise<T> {
  const { json, auth = true, guest = true, query, headers, _skipRefresh, ...rest } = opts;

  const finalHeaders: Record<string, string> = {
    Accept: "application/json",
    ...(headers as Record<string, string> | undefined),
  };

  if (json !== undefined) {
    finalHeaders["Content-Type"] = "application/json";
  }

  if (auth) {
    const token = getAccessToken();
    if (token) finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  if (guest && !finalHeaders["Authorization"]) {
    const gid = getGuestId();
    if (gid) finalHeaders["X-Guest-ID"] = gid;
  }

  const res = await fetch(buildUrl(path, query), {
    ...rest,
    headers: finalHeaders,
    body: json !== undefined ? JSON.stringify(json) : (rest as RequestInit).body,
  });

  // Try parse JSON; backend always returns ApiResponse shape.
  let body: ApiResponse<T> | null = null;
  const text = await res.text();
  if (text) {
    try {
      body = JSON.parse(text) as ApiResponse<T>;
    } catch {
      throw new ApiError(`Invalid JSON from API: ${text.slice(0, 200)}`, "PARSE_ERROR", res.status);
    }
  }

  if (!res.ok || (body && body.error)) {
    // Try refresh once on 401 for authenticated requests.
    if (
      res.status === 401 &&
      auth &&
      !_skipRefresh &&
      getRefreshToken() &&
      getAccessToken()
    ) {
      const ok = await tryRefresh();
      if (ok) {
        return apiFetch<T>(path, { ...opts, _skipRefresh: true });
      }
    }
    const err = body?.error;
    throw new ApiError(
      err?.message ?? `Request failed (${res.status})`,
      err?.code ?? "HTTP_ERROR",
      res.status,
      err?.details,
    );
  }

  if (!body || body.data === null || body.data === undefined) {
    // Allow callers expecting void.
    return undefined as unknown as T;
  }

  return body.data;
}

export async function apiFetchEnvelope<T = unknown>(
  path: string,
  opts: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  const data = await apiFetch<T>(path, opts);
  return { data, error: null, meta: null };
}
