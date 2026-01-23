export interface LoadingState<T> {
    data: T | null;
    isLoading: boolean;
    error: string | null;
}

export interface ApiError {
    code: number;
    message: string;
    description?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}
