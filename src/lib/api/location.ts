import { apiFetch } from "./client";
import { ApiError } from "./types";

// Backend currently exposes location lookups under `/api/shipping/*`.
// We re-expose them here under a stable `locationApi` namespace so frontend
// callers don't have to care, and so a future `/api/location/*` move is
// transparent. Also adds `searchLocations()` — graceful fallback if the
// backend search endpoint isn't deployed yet (see MISSING_API.md).

// ─── Models (match crates/blurp-shipping/src/location.rs) ─────

export interface Province {
  province_id: string;
  province: string;
}

export interface City {
  city_id: string;
  province_id: string;
  province: string; // empty from RajaOngkir, may be filled later
  city_name: string;
  postal_code: string; // empty from RajaOngkir
}

export interface District {
  district_id: string;
  city_id: string;
  city_name: string; // empty from RajaOngkir
  province: string; // empty from RajaOngkir
  district_name: string;
}

/** Unified search hit — what the address form actually needs. */
export interface LocationSearchResult {
  /** Numeric district id (RajaOngkir). Stored on user_addresses.district_id. */
  district_id: number;
  label: string; // human-readable full location
  province: string;
  city: string;
  district: string;
  subdistrict?: string;
  postal_code?: string;
}

// ─── Endpoints ────────────────────────────────────────────────

/** GET /api/shipping/provinces */
export function listProvinces(): Promise<Province[]> {
  return apiFetch<Province[]>("/api/shipping/provinces", {
    method: "GET",
    auth: false,
    guest: false,
  });
}

/** GET /api/shipping/cities?province_id=X */
export function listCities(province_id: string | number): Promise<City[]> {
  return apiFetch<City[]>("/api/shipping/cities", {
    method: "GET",
    auth: false,
    guest: false,
    query: { province_id: String(province_id) },
  });
}

/** GET /api/shipping/districts?city_id=X */
export function listDistricts(city_id: string | number): Promise<District[]> {
  return apiFetch<District[]>("/api/shipping/districts", {
    method: "GET",
    auth: false,
    guest: false,
    query: { city_id: String(city_id) },
  });
}

/**
 * Free-text location search.
 *
 * Tries `/api/shipping/locations/search?q=...` first (proposed — see
 * MISSING_API.md). If the backend returns 404, throws `ApiError` with
 * `code === "NOT_IMPLEMENTED"` so callers can fall back to cascading
 * province → city → district selects.
 */
export async function searchLocations(
  q: string,
  limit = 10,
): Promise<LocationSearchResult[]> {
  const trimmed = q.trim();
  if (trimmed.length < 3) return [];
  try {
    return await apiFetch<LocationSearchResult[]>("/api/shipping/locations/search", {
      method: "GET",
      auth: false,
      guest: false,
      query: { q: trimmed, limit },
    });
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      throw new ApiError(
        "Location search not implemented on backend yet.",
        "NOT_IMPLEMENTED",
        404,
      );
    }
    throw err;
  }
}
