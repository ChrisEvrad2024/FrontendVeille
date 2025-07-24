import { Category } from "./category.model";
import { Quartier } from "./location.model";
import { Rating } from "./rating.model";
import { Contact, Price, Service } from "./service.model";
import { User } from "./user.model";

// ===== src/app/core/models/poi.model.ts =====
export interface Poi {
    id: number;
    name: string;
    description: string;
    adress: string;
    latitude: number;
    longitude: number;
    rating: number;
    rating_count: number;
    status: 'pending' | 'approved' | 'rejected';
    is_restaurant: boolean;
    is_transport: boolean;
    is_stadium: boolean;
    is_booking: boolean;
    is_verify: boolean;
    is_recommand: boolean;
    etoile?: number;
    langue: string;
    is_translate: number;
    translate_id?: number;
    image?: string;
    imageUrls?: PoiImageUrls;

    // Relations
    user_id: number;
    created_by: number;
    approved_by?: number;
    category_id: number;
    quartier_id: number;

    // Relations peuplées
    Category?: Category;
    Quartier?: Quartier;
    creator?: User;
    approver?: User;
    user?: User;
    Services?: Service[];
    Prices?: Price[];
    Contacts?: Contact[];
    Comments?: Comment[];
    Ratings?: Rating[];

    // Métadonnées
    created_at: string;
    updated_at: string;
    distance?: number; // Pour les recherches par proximité
    is_favorite?: boolean; // Pour l'utilisateur connecté
}

export interface PoiImageUrls {
    original: string;
    thumbnails: {
        small: string;
        medium: string;
        large: string;
    };
}

export interface PoiCreateRequest {
    name: string;
    description: string;
    adress: string;
    latitude: number;
    longitude: number;
    quartier_id: number;
    category_id: number;
    is_restaurant?: boolean;
    is_transport?: boolean;
    is_stadium?: boolean;
    is_booking?: boolean;
}

export interface PoiUpdateRequest {
    name?: string;
    description?: string;
    adress?: string;
    latitude?: number;
    longitude?: number;
    quartier_id?: number;
    category_id?: number;
    is_restaurant?: boolean;
    is_transport?: boolean;
    is_stadium?: boolean;
    is_booking?: boolean;
}

export interface PoiSearchFilters {
    q?: string;
    quartier_id?: number;
    category_id?: number;
    is_restaurant?: boolean;
    is_transport?: boolean;
    is_stadium?: boolean;
    is_booking?: boolean;
    is_verified?: boolean;
    status?: 'pending' | 'approved' | 'rejected';
    page?: number;
    limit?: number;
    sort_by?: 'name' | 'created_at' | 'rating' | 'rating_count';
    sort_order?: 'asc' | 'desc';
}

export interface NearbyPoiRequest {
    latitude: number;
    longitude: number;
    radius?: number;
    limit?: number;
}