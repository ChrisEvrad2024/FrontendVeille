// ===== src/app/core/models/osm.model.ts =====
export interface OsmGeocodeResult {
    success: boolean;
    results?: OsmPlace[];
    best_match?: OsmPlace;
    query?: string;
    error?: string;
    suggestions?: OsmPlace[];
}

export interface OsmPlace {
    latitude: number;
    longitude: number;
    display_name: string;
    formatted_address: string;
    confidence: number;
    osm_id?: string;
    osm_type?: string;
    place_rank?: number;
    address_details?: any;
}

export interface OsmReverseResult {
    success: boolean;
    formatted_address?: string;
    display_name?: string;
    address_components?: any;
    osm_id?: string;
    osm_type?: string;
    place_rank?: number;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
    error?: string;
}

export interface OsmValidationResult {
    valid: boolean;
    distance_km?: number;
    tolerance_km?: number;
    geocoded_address?: string;
    geocoded_coordinates?: {
        latitude: number;
        longitude: number;
    };
    confidence?: number;
    suggestions?: OsmPlace[];
    error?: string;
}

export interface OsmNearbyResult {
    success: boolean;
    pois?: OsmPoi[];
    center?: {
        latitude: number;
        longitude: number;
    };
    radius?: number;
    total?: number;
    error?: string;
}

export interface OsmPoi {
    osm_id: string;
    osm_type: string;
    name: string;
    amenity?: string;
    latitude: number;
    longitude: number;
    distance_km: number;
    tags: any;
}