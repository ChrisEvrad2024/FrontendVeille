// ===== src/app/core/services/quartier.service.ts =====
import { Injectable, inject } from '@angular/core';
import { Observable, map, catchError, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Quartier, Town, ApiResponse } from '../models';

@Injectable({
    providedIn: 'root'
})
export class QuartierService {
    private http = inject(HttpClient);
    private readonly apiUrl = environment.apiUrl;

    /**
     * Obtenir tous les quartiers
     */
    getAllQuartiers(): Observable<Quartier[]> {
        return this.http.get<ApiResponse<Quartier[]>>(`${this.apiUrl}/quartiers`).pipe(
            map(response => response.data || []),
            catchError(this.handleError)
        );
    }

    /**
     * Obtenir les quartiers d'une ville
     */
    getQuartiersByTown(townId: number): Observable<Quartier[]> {
        return this.http.get<ApiResponse<Quartier[]>>(`${this.apiUrl}/towns/${townId}/quartiers`).pipe(
            map(response => response.data || []),
            catchError(this.handleError)
        );
    }

    /**
     * Obtenir un quartier par ID
     */
    getQuartierById(id: number): Observable<Quartier> {
        return this.http.get<ApiResponse<Quartier>>(`${this.apiUrl}/quartiers/${id}`).pipe(
            map(response => response.data!),
            catchError(this.handleError)
        );
    }

    /**
     * Obtenir toutes les villes
     */
    getAllTowns(): Observable<Town[]> {
        return this.http.get<ApiResponse<Town[]>>(`${this.apiUrl}/towns`).pipe(
            map(response => response.data || []),
            catchError(this.handleError)
        );
    }

    /**
     * Créer un nouveau quartier (admin)
     */
    createQuartier(quartierData: Partial<Quartier>): Observable<Quartier> {
        return this.http.post<ApiResponse<Quartier>>(`${this.apiUrl}/quartiers`, quartierData).pipe(
            map(response => response.data!),
            catchError(this.handleError)
        );
    }

    /**
     * Mettre à jour un quartier (admin)
     */
    updateQuartier(id: number, quartierData: Partial<Quartier>): Observable<Quartier> {
        return this.http.put<ApiResponse<Quartier>>(`${this.apiUrl}/quartiers/${id}`, quartierData).pipe(
            map(response => response.data!),
            catchError(this.handleError)
        );
    }

    private handleError = (error: HttpErrorResponse): Observable<never> => {
        console.error('❌ Erreur QuartierService:', error);
        return throwError(() => new Error(error.error?.message || 'Erreur lors de l\'opération'));
    };
}
