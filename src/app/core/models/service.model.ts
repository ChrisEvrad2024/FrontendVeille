import { Poi } from "./poi.model";

// ===== src/app/core/models/service.model.ts =====
export interface Service {
    id: number;
    name: string;
    description?: string;
    amount: number;
    langue: string;
    is_translate: number;
    translate_id?: number;
    pointinteret_id: number;
    created_at: string;
    updated_at: string;

    // Relations
    PointInterest?: Poi;
}

export interface Price {
    id: number;
    price_name: string;
    amount: number;
    langue: string;
    is_translate: number;
    translate_id?: number;
    pointinteret_id: number;
    created_at: string;
    updated_at: string;

    // Relations
    PointInterest?: Poi;
}

export interface Contact {
    id: number;
    email?: string;
    tel?: string;
    whatsapp?: string;
    url?: string;
    pointinteret_id: number;
    created_at: string;
    updated_at: string;

    // Relations
    PointInterest?: Poi;
}