// ===== 1. src/app/core/services/auth.ts =====
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { User, AuthResponse, LoginRequest, RegisterRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // État d'authentification avec signals (Angular 17+)
  public isAuthenticated = signal<boolean>(false);
  public currentUser = signal<User | null>(null);
  
  // Observable pour compatibilité avec les anciens patterns
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private router: Router) {
    this.checkStoredAuth();
  }

  /**
   * Vérifier s'il y a un token stocké au démarrage
   */
  private checkStoredAuth(): void {
    const token = this.getToken();
    const userData = this.getStoredUser();
    
    if (token && userData) {
      this.setAuthState(userData, token);
    }
  }

  /**
   * Simuler une connexion (pour le moment, sans API)
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return new Observable(observer => {
      // TODO: Remplacer par un vrai appel API au Micro-Sprint 4
      setTimeout(() => {
        // Simulation d'une réponse d'API
        const mockResponse: AuthResponse = {
          message: 'Connexion réussie',
          user: {
            id: 1,
            name: 'John Doe',
            email: credentials.email,
            role: 'membre',
            is_email_verified: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          token: 'mock-jwt-token-' + Date.now()
        };

        this.setAuthState(mockResponse.user, mockResponse.token);
        observer.next(mockResponse);
        observer.complete();
      }, 1000); // Simuler une latence réseau
    });
  }

  /**
   * Simuler une inscription
   */
  register(userData: RegisterRequest): Observable<AuthResponse> {
    return new Observable(observer => {
      // TODO: Remplacer par un vrai appel API au Micro-Sprint 4
      setTimeout(() => {
        const mockResponse: AuthResponse = {
          message: 'Inscription réussie',
          user: {
            id: 2,
            name: userData.name,
            email: userData.email,
            role: userData.role as any || 'membre',
            is_email_verified: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          token: 'mock-jwt-token-' + Date.now()
        };

        this.setAuthState(mockResponse.user, mockResponse.token);
        observer.next(mockResponse);
        observer.complete();
      }, 1000);
    });
  }

  /**
   * Déconnexion
   */
  logout(): void {
    this.clearAuthState();
    this.router.navigate(['/auth/login']);
  }

  /**
   * Vérifier si l'utilisateur a un rôle spécifique
   */
  hasRole(roles: string | string[]): boolean {
    const user = this.currentUser();
    if (!user) return false;

    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  }

  /**
   * Vérifier si l'utilisateur peut modérer
   */
  canModerate(): boolean {
    return this.hasRole(['moderateur', 'admin', 'superadmin']);
  }

  /**
   * Vérifier si l'utilisateur peut créer des POI
   */
  canCreatePOI(): boolean {
    return this.hasRole(['collecteur', 'moderateur', 'admin', 'superadmin']);
  }

  /**
   * Obtenir le token stocké
   */
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  /**
   * Obtenir les données utilisateur stockées
   */
  private getStoredUser(): User | null {
    const userData = localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Définir l'état d'authentification
   */
  private setAuthState(user: User, token: string): void {
    localStorage.setItem('authToken', token);
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    this.currentUser.set(user);
    this.isAuthenticated.set(true);
    
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Effacer l'état d'authentification
   */
  private clearAuthState(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }
}