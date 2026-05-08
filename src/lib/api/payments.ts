import { apiFetch } from "./client";

// ─── Models (mirror crates/blurp-payment/src/models.rs) ──────

export interface CreatePaymentRequest {
  order_id: string;
  /** "BANK_TRANSFER" | "EWALLET" | "CREDIT_CARD" | etc. */
  payment_method: string;
}

export interface PaymentResponse {
  payment_id: string;
  order_id: string;
  external_id: string;
  status: string;
  amount_idr: number;
  payment_url: string;
  expires_at: string;
}

// ─── Endpoints ───────────────────────────────────────────────

/** POST /api/payments — Bearer JWT (user) or X-Guest-ID (guest). */
export function createPayment(req: CreatePaymentRequest): Promise<PaymentResponse> {
  return apiFetch<PaymentResponse>("/api/payments", {
    method: "POST",
    json: req,
    auth: true,
    guest: true,
  });
}

/** GET /api/payments/{order_id} — Bearer JWT (user) or X-Guest-ID (guest). */
export function getPaymentByOrder(orderId: string): Promise<PaymentResponse> {
  return apiFetch<PaymentResponse>(`/api/payments/${encodeURIComponent(orderId)}`, {
    method: "GET",
    auth: true,
    guest: true,
  });
}
