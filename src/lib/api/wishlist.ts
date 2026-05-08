import { apiFetch } from "./client";

export interface WishlistItem {
  id: string;
  variant_id: string;
  product_id?: string;
  added_at?: string;
  // Backend may include product/variant details; keep open-ended.
  [k: string]: unknown;
}

export interface Wishlist {
  id?: string;
  user_id?: string | null;
  items: WishlistItem[];
  [k: string]: unknown;
}

/** GET /api/wishlist (auth or guest) */
export function getWishlist(): Promise<Wishlist> {
  return apiFetch<Wishlist>("/api/wishlist", { method: "GET" });
}

/** POST /api/wishlist — add */
export function addToWishlist(variant_id: string): Promise<Wishlist> {
  return apiFetch<Wishlist>("/api/wishlist", {
    method: "POST",
    json: { variant_id },
  });
}

/** DELETE /api/wishlist — remove (variant id in body) */
export function removeFromWishlist(variant_id: string): Promise<Wishlist> {
  return apiFetch<Wishlist>("/api/wishlist", {
    method: "DELETE",
    json: { variant_id },
  });
}

/** DELETE /api/wishlist/clear */
export function clearWishlist(): Promise<void> {
  return apiFetch<void>("/api/wishlist/clear", { method: "DELETE" });
}

/** POST /api/wishlist/merge — merge guest wishlist into user on login */
export function mergeWishlist(): Promise<Wishlist> {
  return apiFetch<Wishlist>("/api/wishlist/merge", { method: "POST" });
}

/** GET /api/wishlist/check/{variant_id} */
export function checkInWishlist(variant_id: string): Promise<{ in_wishlist: boolean }> {
  return apiFetch<{ in_wishlist: boolean }>(
    `/api/wishlist/check/${encodeURIComponent(variant_id)}`,
    { method: "GET" },
  );
}
