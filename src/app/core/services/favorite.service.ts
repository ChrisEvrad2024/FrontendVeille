// ===== src/app/core/services/favorite.service.ts =====
import { Injectable, inject } from '@angular/core';
import { Observable, map, catchError, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Favorite, Poi, ApiResponse } from '../models';

@Injectable({
    providedIn: 'root'
})
export class FavoriteService {
    private http = inject(HttpClient);
    private readonly apiUrl = environment.apiUrl;

    /**
     * Obtenir les favoris de l'utilisateur connecté
     */
    getUserFavorites(): Observable<Poi[]> {
        return this.http.get<ApiResponse<Poi[]>>(`${this.apiUrl}/favorites`).pipe(
            map(response => response.data || []),
            catchError(this.handleError)
        );
    }

    /**
     * Ajouter un POI aux favoris
     */
    addToFavorites(poiId: number): Observable<Favorite> {
        return this.http.post<ApiResponse<Favorite>>(`${this.apiUrl}/favorites`, { poi_id: poiId }).pipe(
            map(response => response.data!),
            catchError(this.handleError)
        );
    }

    /**
     * Retirer un POI des favoris
     */
    removeFromFavorites(poiId: number): Observable<boolean> {
        return this.http.delete(`${this.apiUrl}/favorites/${poiId}`).pipe(
            map(() => true),
            catchError(this.handleError)
        );
    }

    /**
     * Vérifier si un POI est en favori
     */
    isFavorite(poiId: number): Observable<boolean> {
        return this.http.get<ApiResponse<{ is_favorite: boolean }>>(`${this.apiUrl}/favorites/check/${poiId}`).pipe(
            map(response => response.data?.is_favorite || false),
            catchError(() => throwError(() => false))
        );
    }

    /**
     * Basculer le statut favori d'un POI
     */
    toggleFavorite(poiId: number): Observable<{ is_favorite: boolean }> {
        return this.http.post<ApiResponse<{ is_favorite: boolean }>>(`${this.apiUrl}/favorites/toggle`, { poi_id: poiId }).pipe(
            map(response => response.data!),
            catchError(this.handleError)
        );
    }

    private handleError = (error: HttpErrorResponse): Observable<never> => {
        console.error('❌ Erreur FavoriteService:', error);
        return throwError(() => new Error(error.error?.message || 'Erreur lors de l\'opération'));
    };
}