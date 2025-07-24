// src/app/core/interceptors/error.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth';
import { ErrorHandlerService } from '../services/error-handler.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);
    const authService = inject(AuthService);
    const errorHandler = inject(ErrorHandlerService);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            // Gestion spéciale pour les erreurs d'authentification
            if (error.status === 401 && req.url.includes('/auth/')) {
                // C'est une erreur de connexion/inscription, laisser le composant gérer
                return throwError(() => error);
            }

            if (error.status === 401) {
                // Token expiré, déconnecter l'utilisateur
                authService.logout();
                return throwError(() => error);
            }

            if (error.status === 403) {
                // Accès refusé, rediriger vers l'accueil
                router.navigate(['/']);
            }

            // Gérer toutes les autres erreurs
            errorHandler.handleError(error);
            return throwError(() => error);
        })
    );
};
