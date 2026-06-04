export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    page: number;
    perPage: number;
    total: number;
  };
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface PaginationQuery {
  page?: number;
  perPage?: number;
  search?: string;
}
