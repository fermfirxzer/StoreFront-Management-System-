export interface ApiSuccessResponse<T> {
  status: "success";
  data: T;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiErrorResponse {
  status: "error";
  message: string;
  errors?: unknown;
}

