// Shared types matching blurp-engine response shape.
// Backend wraps every payload as { data, error, meta }.

export interface ApiErrorBody {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiMeta {
  page?: number;
  per_page?: number;
  total?: number;
  total_pages?: number;
  request_id?: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: ApiErrorBody | null;
  meta: ApiMeta | null;
}

export class ApiError extends Error {
  code: string;
  status: number;
  details?: unknown;

  constructor(message: string, code: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}
