import { apiFetch } from "./client";

// ─── Models (mirror crates/blurp-order/src/models.rs) ────────

export interface Address {
  name: string;
  email?: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
  district_id: number;
}

export interface ShippingOption {
  courier_code: string;
  courier_name: string;
  service_code: string;
  service_name: string;
  cost_idr: number;
  etd: string;
}

export interface ShippingQuoteResponse {
  subtotal_idr: number;
  total_weight_grams: number;
  shipping_options: ShippingOption[];
}

export interface OrderItemDetail {
  id: string;
  variant_id: string;
  product_name: string;
  variant_name: string;
  sku: string;
  quantity: number;
  unit_price_idr: number;
  subtotal_idr: number;
  image_url: string | null;
}

export interface OrderDetail {
  id: string;
  user_id: string | null;
  order_number: string;
  status: string;
  subtotal_idr: number;
  shipping_cost_idr: number;
  tax_idr: number;
  total_idr: number;
  shipping_address: Record<string, unknown>;
  billing_address: Record<string, unknown> | null;
  notes: string | null;
  courier_code: string | null;
  service_code: string | null;
  service_name: string | null;
  created_at: string | null;
  updated_at: string | null;
  items: OrderItemDetail[];
  guest_tracking_token?: string;
}

export interface ShippingQuoteRequest {
  shipping_address: Address;
}

export interface CheckoutRequest {
  shipping_address: Address;
  billing_address?: Address;
  notes?: string;
  courier_code: string;
  service_code: string;
}

// ─── Endpoints ───────────────────────────────────────────────

/** POST /api/orders/shipping-quote (auth required) */
export function shippingQuote(req: ShippingQuoteRequest): Promise<ShippingQuoteResponse> {
  return apiFetch<ShippingQuoteResponse>("/api/orders/shipping-quote", {
    method: "POST",
    json: req,
  });
}

/** POST /api/orders/checkout (auth or X-Guest-ID) */
export function checkout(req: CheckoutRequest): Promise<OrderDetail> {
  return apiFetch<OrderDetail>("/api/orders/checkout", {
    method: "POST",
    json: req,
  });
}

/** GET /api/orders — list current user's orders */
export function listMyOrders(): Promise<OrderDetail[]> {
  return apiFetch<OrderDetail[]>("/api/orders", { method: "GET" });
}

/** GET /api/orders/{id} — owned order detail */
export function getOrder(id: string): Promise<OrderDetail> {
  return apiFetch<OrderDetail>(`/api/orders/${encodeURIComponent(id)}`, { method: "GET" });
}

/** POST /api/orders/guest/lookup */
export function guestOrderLookup(token: string): Promise<OrderDetail> {
  return apiFetch<OrderDetail>("/api/orders/guest/lookup", {
    method: "POST",
    json: { token },
    auth: false,
    guest: false,
  });
}
