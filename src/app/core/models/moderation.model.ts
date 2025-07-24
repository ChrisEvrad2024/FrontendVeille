import { User } from "./user.model";

// ===== src/app/core/models/moderation.model.ts =====
export interface ModerationAction {
    id: number;
    table_name: string;
    record_id: number;
    action: 'CREATE' | 'UPDATE' | 'DELETE';
    old_values?: any;
    new_values?: any;
    user_id?: number;
    created_at: string;

    // Relations
    User?: User;
}

export interface ModerationStats {
    period: 'day' | 'week' | 'month';
    moderator_id?: number;
    approvals: number;
    rejections: number;
    total: number;
    approval_rate: string;
}

export interface ApprovalRequest {
    comments?: string;
}

export interface RejectionRequest {
    reason: string;
}

export interface ReapprovalRequest {
    comments?: string;
}

export interface PendingPoiFilters {
    page?: number;
    limit?: number;
    sort_by?: 'created_at' | 'name' | 'quartier_id' | 'category_id';
    sort_order?: 'asc' | 'desc';
    quartier_id?: number;
    category_id?: number;
    created_by?: number;
}