import { apiFetch } from "./client";

export interface ShippingConfig {
  origin_district_id: number;
}

export interface ShippingCostRequest {
  origin_district_id: number;
  destination_district_id: number;
  weight_grams: number;
  couriers: string[];
}

export interface ShippingCostService {
  service_code: string;
  service_name: string;
  description: string;
  cost_idr: number;
  etd: string;
}

export interface ShippingCostCourier {
  courier_code: string;
  courier_name: string;
  services: ShippingCostService[];
}

export interface ShippingCostResponse {
  origin_district_id: number;
  destination_district_id: number;
  weight_grams: number;
  costs: ShippingCostCourier[];
}

/** GET /api/shipping/config (public) */
export function getConfig(): Promise<ShippingConfig> {
  return apiFetch<ShippingConfig>("/api/shipping/config", {
    method: "GET",
    auth: false,
    guest: false,
  });
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

