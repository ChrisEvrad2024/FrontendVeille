import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, map, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { 
  User, 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest,
  VerifyEmailRequest,
  ResendVerificationRequest,
  ApiResponse 
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly apiUrl = environment.apiUrl;

  // État d'authentification avec signals (Angular 17+)
  public isAuthenticated = signal<boolean>(false);
  public currentUser = signal<User | null>(null);
  public isLoading = signal<boolean>(false);
  
  // Observable pour compatibilité avec les anciens patterns
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.checkStoredAuth();
  }

  /**
   * Vérifier s'il y a un token stocké au démarrage
   */
  private checkStoredAuth(): void {
    const token = this.getToken();
    const userData = this.getStoredUser();
    
    if (token && userData) {
      // Vérifier si le token est toujours valide
      this.verifyToken().subscribe({
        next: (response) => {
          if (response.data) {
            this.setAuthState(response.data, token);
          } else {
            this.clearAuthState();
          }
        },
        error: () => {
          this.clearAuthState();
        }
      });
    }
  }

  /**
   * Vérifier la validité du token
   */
  private verifyToken(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`
      }
    });
  }

  /**
   * Connexion utilisateur
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    this.isLoading.set(true);
    
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        map(response => {
          this.isLoading.set(false);
          if (response.data) {
            this.setAuthState(response.data.user, response.data.token);
            return response.data;
          }
          throw new Error('Réponse API invalide');
        }),
        catchError((error: HttpErrorResponse) => {
          this.isLoading.set(false);
          return this.handleAuthError(error);
        })
      );
  }

  /**
   * Inscription utilisateur
   */
  register(userData: RegisterRequest): Observable<ApiResponse<{ user: User }>> {
    this.isLoading.set(true);
    
    return this.http.post<ApiResponse<{ user: User }>>(`${this.apiUrl}/auth/register`, userData)
      .pipe(
        map(response => {
          this.isLoading.set(false);
          return response;
        }),
        catchError((error: HttpErrorResponse) => {
          this.isLoading.set(false);
          return this.handleAuthError(error);
        })
      );
  }

  /**
   * Vérification d'email
   */
  verifyEmail(token: string): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/auth/verify-email?token=${token}`)
      .pipe(
        map(response => {
          if (response.data) {
            // Connecter automatiquement l'utilisateur après vérification
            const mockToken = 'temp-token-after-verification';
            this.setAuthState(response.data, mockToken);
          }
          return response;
        }),
        catchError((error: HttpErrorResponse) => {
          return this.handleAuthError(error);
        })
      );
  }

  /**
   * Renvoyer l'email de vérification
   */
  resendVerificationEmail(email: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/auth/resend-verification`, { email })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return this.handleAuthError(error);
        })
      );
  }

  /**
   * Déconnexion
   */
  logout(): void {
    // Optionnel: appeler l'API de déconnexion
    this.http.post(`${this.apiUrl}/auth/logout`, {}).subscribe({
      complete: () => {
        this.clearAuthState();
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        // Déconnecter même en cas d'erreur API
        this.clearAuthState();
        this.router.navigate(['/auth/login']);
      }
    });
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

  /**
   * Gérer les erreurs d'authentification
   */
  private handleAuthError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur est survenue';

    if (error.error && error.error.detail) {
      errorMessage = error.error.detail;
    } else if (error.error && error.error.message) {
      errorMessage = error.error.message;
    } else if (error.status === 0) {
      errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
    } else if (error.status === 401) {
      errorMessage = 'Email ou mot de passe incorrect';
    } else if (error.status === 409) {
      errorMessage = 'Un compte avec cet email existe déjà';
    } else if (error.status >= 500) {
      errorMessage = 'Erreur du serveur. Veuillez réessayer plus tard.';
    }

    return throwError(() => new Error(errorMessage));
  }
}