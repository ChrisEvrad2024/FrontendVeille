import { Poi } from "./poi.model";

// ===== src/app/core/models/category.model.ts =====
export interface Category {
    id: number;
    name: string;
    slug: string;
    langue: string;
    icon?: string;
    is_translate: number;
    translate_id?: number;
    parent_id?: number;
    created_at: string;
    updated_at: string;

    // Relations
    parent?: Category;
    children?: Category[];
    PointInterests?: Poi[];
}