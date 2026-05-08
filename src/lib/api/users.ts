import { apiFetch } from "./client";
import { decodeJwt, getAccessToken, getStoredUser } from "@/src/lib/auth/session";

// ─── Profile ────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  username: string | null;
  name: string | null;
  phone: string | null;
  is_admin: boolean;
  auth_method: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface UpdateProfilePayload {
  name?: string;
  username?: string;
  phone?: string;
}

/** GET /api/users/me */
export function getMe(): Promise<UserProfile> {
  return apiFetch<UserProfile>("/api/users/me", { method: "GET" });
}

/** PUT /api/users/me */
export function updateMe(payload: UpdateProfilePayload): Promise<UserProfile> {
  return apiFetch<UserProfile>("/api/users/me", { method: "PUT", json: payload });
}

// ─── Password ───────────────────────────────────────────────

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
}

/** POST /api/users/me/password */
export function changePassword(payload: ChangePasswordPayload): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/api/users/me/password", {
    method: "POST",
    json: payload,
  });
}

// ─── Addresses ──────────────────────────────────────────────

export interface UserAddress {
  id: string;
  user_id: string;
  label: string | null;
  name: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
  district_id: number;
  is_default: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface CreateAddressPayload {
  label?: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  postal_code: string;
  country?: string;
  district_id: number;
  is_default?: boolean;
}

export type UpdateAddressPayload = Partial<Omit<CreateAddressPayload, "is_default">>;

/** GET /api/users/me/addresses */
export function listAddresses(): Promise<UserAddress[]> {
  return apiFetch<UserAddress[]>("/api/users/me/addresses", { method: "GET" });
}

/** POST /api/users/me/addresses */
export function createAddress(payload: CreateAddressPayload): Promise<UserAddress> {
  return apiFetch<UserAddress>("/api/users/me/addresses", { method: "POST", json: payload });
}

/** GET /api/users/me/addresses/{id} */
export function getAddress(id: string): Promise<UserAddress> {
  return apiFetch<UserAddress>(`/api/users/me/addresses/${encodeURIComponent(id)}`, {
    method: "GET",
  });
}

/** PUT /api/users/me/addresses/{id} */
export function updateAddress(id: string, payload: UpdateAddressPayload): Promise<UserAddress> {
  return apiFetch<UserAddress>(`/api/users/me/addresses/${encodeURIComponent(id)}`, {
    method: "PUT",
    json: payload,
  });
}

/** DELETE /api/users/me/addresses/{id} */
export function deleteAddress(id: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/api/users/me/addresses/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

/** PUT /api/users/me/addresses/{id}/default */
export function setDefaultAddress(id: string): Promise<UserAddress> {
  return apiFetch<UserAddress>(
    `/api/users/me/addresses/${encodeURIComponent(id)}/default`,
    { method: "PUT" },
  );
}

// ─── Notifications ──────────────────────────────────────────

export interface NotificationPreferences {
  id: string;
  user_id: string;
  order_updates: boolean;
  promotions: boolean;
  security_alerts: boolean;
  newsletter: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export type UpdateNotificationsPayload = Partial<
  Pick<NotificationPreferences, "order_updates" | "promotions" | "security_alerts" | "newsletter">
>;

/** GET /api/users/me/notifications */
export function getNotificationPrefs(): Promise<NotificationPreferences> {
  return apiFetch<NotificationPreferences>("/api/users/me/notifications", { method: "GET" });
}

/** PUT /api/users/me/notifications */
export function updateNotificationPrefs(
  payload: UpdateNotificationsPayload,
): Promise<NotificationPreferences> {
  return apiFetch<NotificationPreferences>("/api/users/me/notifications", {
    method: "PUT",
    json: payload,
  });
}

// ─── JWT-derived fallback ───────────────────────────────────

export interface CurrentUserClaims {
  id: string;
  email: string;
  expired: boolean;
}

/** Fast client-side identity from JWT (no network). */
export function getCurrentUserClaims(): CurrentUserClaims | null {
  const token = getAccessToken();
  if (!token) return null;
  const claims = decodeJwt(token);
  if (!claims) return null;
  const stored = getStoredUser();
  return {
    id: stored?.id ?? claims.sub,
    email: stored?.email ?? claims.email,
    expired: claims.exp * 1000 < Date.now(),
  };
}
