import { Poi } from "./poi.model";
import { User } from "./user.model";

// ===== src/app/core/models/rating.model.ts =====
export interface Rating {
    id: number;
    rating: number; // 1-5
    poi_id: number;
    user_id: number;
    created_at: string;
    updated_at: string;

    // Relations
    PointInterest?: Poi;
    User?: User;
}

export interface RatingCreateRequest {
    rating: number;
}

export interface RatingDetails {
    poi_id: number;
    poi_name: string;
    overall_rating: number;
    total_ratings: number;
    statistics: {
        count: number;
        average: string;
        min: number;
        max: number;
        distribution: {
            [key: number]: number; // distribution[1] = nombre de notes 1 étoile
        };
    };
    recent_ratings: {
        rating: number;
        user: string;
        created_at: string;
    }[];
}

export interface TopRatedPoiOptions {
    limit?: number;
    min_ratings?: number;
    category_id?: number;
    quartier_id?: number;
}