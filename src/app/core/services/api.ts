import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

/**
 * Service centralisé pour toutes les communications API.
 * Il s'appuie sur un intercepteur (jwt.interceptor.ts) pour ajouter
 * automatiquement le token d'authentification à chaque requête.
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Envoie une requête GET.
   * @param endpoint Le segment d'URL de l'API (ex: '/poi').
   */
  get<T>(endpoint: string): Observable<ApiResponse<T>> {
    return this.http.get<ApiResponse<T>>(`${this.baseUrl}${endpoint}`);
  }

  /**
   * Envoie une requête POST.
   * @param endpoint Le segment d'URL de l'API.
   * @param data Le corps de la requête.
   */
  post<T>(endpoint: string, data: any): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, data);
  }

  /**
   * Envoie une requête PUT.
   * @param endpoint Le segment d'URL de l'API.
   * @param data Le corps de la requête.
   */
  put<T>(endpoint: string, data: any): Observable<ApiResponse<T>> {
    return this.http.put<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, data);
  }

  /**
   * Envoie une requête DELETE.
   * @param endpoint Le segment d'URL de l'API.
   */
  delete<T>(endpoint: string): Observable<ApiResponse<T>> {
    return this.http.delete<ApiResponse<T>>(`${this.baseUrl}${endpoint}`);
  }

  /**
   * Gère l'upload de fichiers.
   * @param endpoint Le segment d'URL de l'API.
   * @param formData L'objet FormData contenant le(s) fichier(s).
   */
  upload<T>(endpoint: string, formData: FormData): Observable<ApiResponse<T>> {
    // Note : L'intercepteur ajoutera aussi le token ici si nécessaire.
    // HttpClient gère correctement le 'Content-Type' pour FormData.
    return this.http.post<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, formData);
  }
}
