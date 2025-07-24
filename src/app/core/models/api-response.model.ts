// ===== src/app/core/models/api-response.model.ts =====
export interface ApiResponse<T = any> {
    message?: string;
    data?: T;
    errors?: ApiError[];
    status?: number;
    pagination?: Pagination;
    filters?: any;
}

export interface ApiError {
    field?: string;
    message: string;
    code?: string;
    type?: string;
    title?: string;
    detail?: string;
}

export interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    nextPage?: number;
    prevPage?: number;
    startCursor?: any;
    endCursor?: any;
    nextCursor?: any;
}

export interface CursorPagination {
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
    startCursor: any;
    endCursor: any;
    nextCursor?: any;
    count: number;
}