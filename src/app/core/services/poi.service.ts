// ===== src/app/core/services/poi.service.ts - VERSION API RÉELLE =====
import { Injectable, inject } from '@angular/core';
import { Observable, map, catchError, throwError } from 'rxjs';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
    Poi,
    PoiCreateRequest,
    PoiUpdateRequest,
    PoiSearchFilters,
    NearbyPoiRequest,
    ApiResponse,
    SearchResult
} from '../models';

@Injectable({
    providedIn: 'root'
})
export class PoiService {
    private http = inject(HttpClient);
    private readonly apiUrl = environment.apiUrl;

    /**
     * Rechercher des POI avec l'API avancée
     */
    searchPoi(filters: PoiSearchFilters = {}): Observable<ApiResponse<SearchResult<Poi>>> {
        let params = new HttpParams();

        // Mapper les filtres frontend vers les paramètres API backend
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params = params.set(key, value.toString());
            }
        });

        return this.http.get<any>(`${this.apiUrl}/poi`, { params }).pipe(
            map(response => {
                // Transformer la réponse backend vers le format frontend
                return {
                    data: {
                        data: response.data || [],
                        pagination: response.pagination
                    },
                    message: 'POI récupérés avec succès',
                    status: 200
                };
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Rechercher des POI approuvés uniquement
     */
    getApprovedPois(filters: PoiSearchFilters = {}): Observable<Poi[]> {
        const approvedFilters = { ...filters, status: 'approved' as const };

        return this.searchPoi(approvedFilters).pipe(
            map(response => response.data?.data || [])
        );
    }

    /**
     * Obtenir un POI par ID
     */
    getPoiById(id: number): Observable<ApiResponse<Poi>> {
        return this.http.get<any>(`${this.apiUrl}/poi/${id}`).pipe(
            map(response => ({
                data: response.data,
                message: 'POI récupéré avec succès',
                status: 200
            })),
            catchError(this.handleError)
        );
    }

    /**
     * Rechercher des POI à proximité
     */
    getNearbyPoi(request: NearbyPoiRequest): Observable<ApiResponse<Poi[]>> {
        let params = new HttpParams()
            .set('latitude', request.latitude.toString())
            .set('longitude', request.longitude.toString());

        if (request.radius) {
            params = params.set('radius', request.radius.toString());
        }
        if (request.limit) {
            params = params.set('limit', request.limit.toString());
        }

        return this.http.get<any>(`${this.apiUrl}/poi/nearby`, { params }).pipe(
            map(response => ({
                data: response.data || response, // Backend peut retourner directement le tableau
                message: 'POI à proximité récupérés',
                status: 200
            })),
            catchError(this.handleError)
        );
    }

    /**
     * Créer un nouveau POI
     */
    createPoi(poiData: PoiCreateRequest, images?: File[]): Observable<ApiResponse<Poi>> {
        const formData = new FormData();

        // Ajouter les données du POI
        Object.entries(poiData).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                formData.append(key, value.toString());
            }
        });

        // Ajouter les images si présentes
        if (images && images.length > 0) {
            images.forEach((image) => {
                formData.append('images', image, image.name);
            });
        }

        return this.http.post<any>(`${this.apiUrl}/poi`, formData).pipe(
            map(response => ({
                data: response.data,
                message: response.message || 'POI créé avec succès',
                status: 201
            })),
            catchError(this.handleError)
        );
    }

    /**
     * Mettre à jour un POI
     */
    updatePoi(id: number, poiData: PoiUpdateRequest): Observable<ApiResponse<Poi>> {
        return this.http.put<any>(`${this.apiUrl}/poi/${id}`, poiData).pipe(
            map(response => ({
                data: response.data,
                message: response.message || 'POI mis à jour avec succès',
                status: 200
            })),
            catchError(this.handleError)
        );
    }

    /**
     * Supprimer un POI
     */
    deletePoi(id: number): Observable<ApiResponse<any>> {
        return this.http.delete<any>(`${this.apiUrl}/poi/${id}`).pipe(
            map(response => ({
                data: response,
                message: response.message || 'POI supprimé avec succès',
                status: 200
            })),
            catchError(this.handleError)
        );
    }

    /**
     * Obtenir les statistiques d'un POI
     */
    getPoiStats(id: number): Observable<ApiResponse<any>> {
        return this.http.get<any>(`${this.apiUrl}/poi/${id}/stats`).pipe(
            map(response => ({
                data: response.data || response,
                message: 'Statistiques récupérées',
                status: 200
            })),
            catchError(this.handleError)
        );
    }

    /**
     * Upload d'images pour un POI existant
     */
    uploadImages(id: number, images: File[]): Observable<ApiResponse<any>> {
        const formData = new FormData();
        images.forEach((image) => {
            formData.append('images', image, image.name);
        });

        return this.http.post<any>(`${this.apiUrl}/poi/${id}/upload-images`, formData).pipe(
            map(response => ({
                data: response.data || response,
                message: response.message || 'Images uploadées avec succès',
                status: 200
            })),
            catchError(this.handleError)
        );
    }

    /**
     * Obtenir les POI par catégorie
     */
    getPoiByCategory(categoryId: number): Observable<Poi[]> {
        return this.getApprovedPois({ category_id: categoryId });
    }

    /**
     * Obtenir les POI populaires (mieux notés)
     */
    getPopularPois(limit: number = 10): Observable<Poi[]> {
        return this.getApprovedPois({
            limit,
            sort_by: 'rating',
            sort_order: 'desc'
        });
    }

    /**
     * Obtenir les POI récents
     */
    getRecentPois(limit: number = 10): Observable<Poi[]> {
        return this.getApprovedPois({
            limit,
            sort_by: 'created_at',
            sort_order: 'desc'
        });
    }

    /**
     * Calculer la distance entre deux points (formule de Haversine)
     */
    calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // Rayon de la Terre en kilomètres
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /**
     * Convertir des degrés en radians
     */
    private deg2rad(deg: number): number {
        return deg * (Math.PI / 180);
    }

    /**
     * Obtenir les POI dans un rayon donné
     */
    getPoiInRadius(centerLat: number, centerLng: number, radiusKm: number): Observable<Poi[]> {
        return this.getNearbyPoi({
            latitude: centerLat,
            longitude: centerLng,
            radius: radiusKm
        }).pipe(
            map(response => response.data || [])
        );
    }

    /**
     * Trier les POI par distance depuis un point
     */
    sortPoiByDistance(pois: Poi[], fromLat: number, fromLng: number): Poi[] {
        return pois.map(poi => ({
            ...poi,
            distance: this.calculateDistance(fromLat, fromLng, poi.latitude, poi.longitude)
        })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }

    /**
     * Recherche avancée avec pagination cursor
     */
    searchAdvanced(filters: any = {}): Observable<SearchResult<Poi>> {
        let params = new HttpParams();

        // Ajouter tous les filtres supportés par l'API backend
        const supportedFilters = [
            'q', 'quartier_id', 'category_id', 'is_restaurant', 'is_transport',
            'is_stadium', 'is_booking', 'is_verified', 'status', 'page', 'limit',
            'sort_by', 'sort_order', 'cursor', 'useCursor'
        ];

        supportedFilters.forEach(filter => {
            if (filters[filter] !== undefined && filters[filter] !== null && filters[filter] !== '') {
                params = params.set(filter, filters[filter].toString());
            }
        });

        return this.http.get<any>(`${this.apiUrl}/poi`, { params }).pipe(
            map(response => ({
                data: response.data || [],
                pagination: response.pagination,
                filters: filters
            })),
            catchError(this.handleError)
        );
    }

    /**
     * Gérer les erreurs HTTP
     */
    private handleError = (error: HttpErrorResponse): Observable<never> => {
        let errorMessage = 'Une erreur est survenue';

        if (error.error) {
            // Erreur du backend
            if (typeof error.error === 'string') {
                errorMessage = error.error;
            } else if (error.error.message) {
                errorMessage = error.error.message;
            } else if (error.error.detail) {
                errorMessage = error.error.detail;
            }
        } else if (error.message) {
            errorMessage = error.message;
        }

        console.error('❌ Erreur API POI:', {
            status: error.status,
            message: errorMessage,
            url: error.url,
            error: error.error
        });

        return throwError(() => new Error(errorMessage));
    };

    /**
     * Construire les paramètres de recherche compatibles avec l'API backend
     */
    buildSearchParams(filters: PoiSearchFilters): { [key: string]: any } {
        const params: { [key: string]: any } = {};

        // Liste des propriétés supportées par l'API backend
        const supportedProperties = [
            'q', 'quartier_id', 'category_id', 'is_restaurant', 'is_transport',
            'is_stadium', 'is_booking', 'is_verified', 'status', 'page',
            'limit', 'sort_by', 'sort_order', 'rating_min', 'rating_max',
            'latitude', 'longitude', 'radius', 'cursor', 'useCursor',
            'created_by', 'user_id', 'is_favorite'
        ];

        // Parcourir dynamiquement toutes les propriétés
        supportedProperties.forEach(prop => {
            const value = (filters as any)[prop];
            if (value !== undefined && value !== null && value !== '') {
                params[prop] = value;
            }
        });

        return params;
    }

    /**
     * Vérifier la santé de l'API POI
     */
    healthCheck(): Observable<boolean> {
        return this.http.get(`${this.apiUrl}/poi?limit=1`).pipe(
            map(() => true),
            catchError(() => throwError(() => new Error('API POI non disponible')))
        );
    }

    /**
     * Obtenir les métadonnées des POI (pour les filtres)
     */
    getMetadata(): Observable<any> {
        // Cette méthode pourrait appeler un endpoint dédié pour récupérer
        // les catégories, quartiers, etc. En attendant, on utilise les POI existants
        return this.getApprovedPois({ limit: 1000 }).pipe(
            map(pois => {
                const categories = new Map();
                const quartiers = new Map();

                pois.forEach(poi => {
                    if (poi.Category) {
                        categories.set(poi.Category.id, poi.Category);
                    }
                    if (poi.Quartier) {
                        quartiers.set(poi.Quartier.id, poi.Quartier);
                    }
                });

                return {
                    categories: Array.from(categories.values()),
                    quartiers: Array.from(quartiers.values()),
                    totalPois: pois.length
                };
            })
        );
    }
}