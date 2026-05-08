import { apiFetch } from "./client";

export interface ShippingCostDestination {
  district_id: number;
}

export interface ShippingCostItem {
  courier: string;
  service: string;
  description: string | null;
  cost_idr: number;
  etd: string | null;
}

export interface ShippingCostRequest {
  origin_district_id: number;
  destination: ShippingCostDestination;
  couriers: string[];
  weight_grams: number;
}

export interface ShippingCostResponse {
  items: ShippingCostItem[];
}

/** POST /api/shipping/cost (public) */
export function shippingCost(req: ShippingCostRequest): Promise<ShippingCostResponse> {
  return apiFetch<ShippingCostResponse>("/api/shipping/cost", {
    method: "POST",
    json: req,
    auth: false,
    guest: false,
  });
}

