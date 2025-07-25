// ===== src/app/core/services/category.service.ts =====
import { Injectable, inject } from '@angular/core';
import { Observable, map, catchError, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Category, ApiResponse } from '../models';

@Injectable({
    providedIn: 'root'
})
export class CategoryService {
    private http = inject(HttpClient);
    private readonly apiUrl = environment.apiUrl;

    /**
     * Obtenir toutes les catégories
     */
    getAllCategories(): Observable<Category[]> {
        return this.http.get<ApiResponse<Category[]>>(`${this.apiUrl}/categories`).pipe(
            map(response => response.data || []),
            catchError(this.handleError)
        );
    }

    /**
     * Obtenir une catégorie par ID
     */
    getCategoryById(id: number): Observable<Category> {
        return this.http.get<ApiResponse<Category>>(`${this.apiUrl}/categories/${id}`).pipe(
            map(response => response.data!),
            catchError(this.handleError)
        );
    }

    /**
     * Créer une nouvelle catégorie (admin)
     */
    createCategory(categoryData: Partial<Category>): Observable<Category> {
        return this.http.post<ApiResponse<Category>>(`${this.apiUrl}/categories`, categoryData).pipe(
            map(response => response.data!),
            catchError(this.handleError)
        );
    }

    /**
     * Mettre à jour une catégorie (admin)
     */
    updateCategory(id: number, categoryData: Partial<Category>): Observable<Category> {
        return this.http.put<ApiResponse<Category>>(`${this.apiUrl}/categories/${id}`, categoryData).pipe(
            map(response => response.data!),
            catchError(this.handleError)
        );
    }

    /**
     * Supprimer une catégorie (admin)
     */
    deleteCategory(id: number): Observable<boolean> {
        return this.http.delete(`${this.apiUrl}/categories/${id}`).pipe(
            map(() => true),
            catchError(this.handleError)
        );
    }

    private handleError = (error: HttpErrorResponse): Observable<never> => {
        console.error('❌ Erreur CategoryService:', error);
        return throwError(() => new Error(error.error?.message || 'Erreur lors de l\'opération'));
    };
}