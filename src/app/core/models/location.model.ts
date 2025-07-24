import { Poi } from "./poi.model";

// ===== src/app/core/models/location.model.ts =====
export interface Country {
    id: number;
    code: number;
    name: string;
    continent_name: string;
    flag: string;
    langue: string;
    is_translate: number;
    translate_id?: number;
    created_at: string;
    updated_at: string;

    // Relations
    Towns?: Town[];
}

export interface Town {
    id: number;
    name: string;
    description: string;
    longitude: number;
    latitude: number;
    langue: string;
    is_translate: number;
    translate_id?: number;
    country_id: number;
    created_at: string;
    updated_at: string;

    // Relations
    Country?: Country;
    Quartiers?: Quartier[];
}

export interface Arrondissement {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;

    // Relations
    Quartiers?: Quartier[];
}

export interface Quartier {
    id: number;
    name: string;
    description: string;
    longitude: number;
    latitude: number;
    langue: string;
    is_translate: number;
    translate_id?: number;
    town_id: number;
    arrondissement_id?: number;
    created_at: string;
    updated_at: string;

    // Relations
    Town?: Town;
    Arrondissement?: Arrondissement;
    PointInterests?: Poi[];
}