import { Poi } from "./poi.model";
import { User } from "./user.model";

// ===== src/app/core/models/favorite.model.ts =====
export interface Favorite {
    id: number;
    user_id: number;
    poi_id: number;
    created_at: string;
    updated_at: string;

    // Relations
    User?: User;
    PointInterest?: Poi;
}