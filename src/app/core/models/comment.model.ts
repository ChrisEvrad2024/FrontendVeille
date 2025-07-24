import { Poi } from "./poi.model";
import { User } from "./user.model";

// ===== src/app/core/models/comment.model.ts =====
export interface Comment {
    id: number;
    content: string;
    poi_id: number;
    user_id: number;
    parent_id?: number;
    status: 'pending' | 'approved' | 'rejected' | 'flagged';
    moderated_by?: number;
    is_edited: boolean;
    edited_at?: string;
    likes_count: number;
    reports_count: number;
    created_at: string;
    updated_at: string;

    // Relations
    PointInterest?: Poi;
    author?: User;
    moderator?: User;
    parent?: Comment;
    replies?: Comment[];
    CommentLikes?: CommentLike[];
    CommentReports?: CommentReport[];

    // Métadonnées pour l'utilisateur connecté
    user_liked?: boolean;
    user_reported?: boolean;
}

export interface CommentLike {
    id: number;
    comment_id: number;
    user_id: number;
    created_at: string;
    updated_at: string;

    // Relations
    Comment?: Comment;
    User?: User;
}

export interface CommentReport {
    id: number;
    comment_id: number;
    user_id: number;
    reason: 'spam' | 'inappropriate' | 'harassment' | 'misinformation' | 'other';
    description?: string;
    status: 'pending' | 'reviewed' | 'dismissed';
    reviewed_by?: number;
    created_at: string;
    updated_at: string;

    // Relations
    Comment?: Comment;
    reporter?: User;
    reviewer?: User;
}

export interface CommentCreateRequest {
    content: string;
    poi_id: number;
    parent_id?: number;
}

export interface CommentUpdateRequest {
    content: string;
}

export interface CommentReportRequest {
    reason: 'spam' | 'inappropriate' | 'harassment' | 'misinformation' | 'other';
    description?: string;
}

export interface CommentListOptions {
    page?: number;
    limit?: number;
    sort_by?: 'created_at' | 'likes_count';
    sort_order?: 'asc' | 'desc';
    status?: 'pending' | 'approved' | 'rejected' | 'flagged';
    include_replies?: boolean;
}