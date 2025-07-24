// ===== 5. src/app/core/interceptors/error.interceptor.ts =====
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth';
import { NotificationService } from '../services/notification';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);
    const authService = inject(AuthService);
    const notificationService = inject(NotificationService);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
                // Token expiré ou invalide
                authService.logout();
                notificationService.showError('Session expirée. Veuillez vous reconnecter.');
            } else if (error.status === 403) {
                // Accès refusé
                notificationService.showError('Accès refusé. Permissions insuffisantes.');
                router.navigate(['/']);
            } else if (error.status === 0) {
                // Erreur réseau
                notificationService.showError('Erreur de connexion. Vérifiez votre connexion internet.');
            } else {
                // Autres erreurs
                const message = error.error?.detail || error.error?.message || 'Une erreur est survenue';
                notificationService.showError(message);
            }

            return throwError(() => error);
        })
    );
};