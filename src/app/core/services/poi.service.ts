// src/app/core/services/poi.service.ts
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
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
     * Rechercher des POI
     */
    searchPoi(filters: PoiSearchFilters = {}): Observable<ApiResponse<SearchResult<Poi>>> {
        let params = new HttpParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params = params.set(key, value.toString());
            }
        });

        return this.http.get<ApiResponse<SearchResult<Poi>>>(`${this.apiUrl}/poi`, { params });
    }

    /**
     * Obtenir un POI par ID
     */
    getPoiById(id: number): Observable<ApiResponse<Poi>> {
        return this.http.get<ApiResponse<Poi>>(`${this.apiUrl}/poi/${id}`);
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

        return this.http.get<ApiResponse<Poi[]>>(`${this.apiUrl}/poi/nearby`, { params });
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
            images.forEach((image, index) => {
                formData.append('images', image, image.name);
            });
        }

        return this.http.post<ApiResponse<Poi>>(`${this.apiUrl}/poi`, formData);
    }

    /**
     * Mettre à jour un POI
     */
    updatePoi(id: number, poiData: PoiUpdateRequest): Observable<ApiResponse<Poi>> {
        return this.http.put<ApiResponse<Poi>>(`${this.apiUrl}/poi/${id}`, poiData);
    }

    /**
     * Supprimer un POI
     */
    deletePoi(id: number): Observable<ApiResponse<any>> {
        return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/poi/${id}`);
    }

    /**
     * Obtenir les statistiques d'un POI
     */
    getPoiStats(id: number): Observable<ApiResponse<any>> {
        return this.http.get<ApiResponse<any>>(`${this.apiUrl}/poi/${id}/stats`);
    }

    /**
     * Upload d'images pour un POI existant
     */
    uploadImages(id: number, images: File[]): Observable<ApiResponse<any>> {
        const formData = new FormData();
        images.forEach((image) => {
            formData.append('images', image, image.name);
        });

        return this.http.post<ApiResponse<any>>(`${this.apiUrl}/poi/${id}/upload-images`, formData);
    }
}