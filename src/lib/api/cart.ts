import { apiFetch } from "./client";

// ─── Models (mirror crates/blurp-cart/src/models.rs) ─────────

export interface CartLineItem {
  cart_item_id: string;
  variant_id: string;
  product_id: string;
  product_name: string;
  variant_name: string;
  sku: string;
  price_idr: number;
  quantity: number;
  subtotal_idr: number;
  image_url: string | null;
}

export interface CartSummary {
  cart_id: string;
  user_id: string | null;
  guest_id: string | null;
  line_items: CartLineItem[];
  total_items: number;
  subtotal_idr: number;
  coupon_discount_idr: number | null;
}

/** Backend `CartResponse` is flattened: summary fields at top-level + optional meta. */
export type CartResponse = CartSummary & {
  meta?: { saved_for_later: boolean } | null;
};

export interface AddCartItemRequest {
  variant_id: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

// ─── Endpoints ───────────────────────────────────────────────

/** GET /api/cart (auth or X-Guest-ID) */
export function getCart(): Promise<CartResponse> {
  return apiFetch<CartResponse>("/api/cart", { method: "GET" });
}

/** POST /api/cart/items (auth or X-Guest-ID) */
export function addCartItem(req: AddCartItemRequest): Promise<CartLineItem> {
  return apiFetch<CartLineItem>("/api/cart/items", { method: "POST", json: req });
}

/** PUT /api/cart/items/{id} */
export function updateCartItem(id: string, req: UpdateCartItemRequest): Promise<{ updated: boolean }> {
  return apiFetch<{ updated: boolean }>(`/api/cart/items/${encodeURIComponent(id)}`, {
    method: "PUT",
    json: req,
  });
}

/** DELETE /api/cart/items/{id} */
export function removeCartItem(id: string): Promise<void> {
  return apiFetch<void>(`/api/cart/items/${encodeURIComponent(id)}`, { method: "DELETE" });
}

/** DELETE /api/cart */
export function clearCart(): Promise<void> {
  return apiFetch<void>("/api/cart", { method: "DELETE" });
}

