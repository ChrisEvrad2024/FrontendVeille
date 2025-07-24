import { CursorPagination, Pagination } from "./api-response.model";

// ===== src/app/core/models/search.model.ts =====
export interface SearchOptions {
    q?: string;
    filters?: SearchFilters;
    pagination?: SearchPagination;
    sort?: SearchSort;
}

export interface SearchFilters {
    category_id?: number;
    quartier_id?: number;
    status?: string;
    is_restaurant?: boolean;
    is_transport?: boolean;
    is_stadium?: boolean;
    is_booking?: boolean;
    is_verified?: boolean;
    rating_min?: number;
    rating_max?: number;
    location?: {
        latitude: number;
        longitude: number;
        radius: number;
    };
}

export interface SearchPagination {
    page?: number;
    limit?: number;
    cursor?: any;
    useCursor?: boolean;
}

export interface SearchSort {
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export interface SearchResult<T> {
    data: T[];
    pagination: Pagination | CursorPagination;
    filters?: SearchFilters;
    total?: number;
}
