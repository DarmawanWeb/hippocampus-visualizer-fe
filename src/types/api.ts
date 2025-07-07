export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiError {
  message: string;
  error?: string;
  statusCode: number;
}
