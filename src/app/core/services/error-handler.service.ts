// src/app/core/services/error-handler.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationService } from './notification';

@Injectable({
    providedIn: 'root'
})
export class ErrorHandlerService {
    private notificationService = inject(NotificationService);

    /**
     * Gérer les erreurs HTTP de manière centralisée
     */
    handleError(error: HttpErrorResponse): void {
        let message = 'Une erreur est survenue';
        let title = 'Erreur';

        // Erreurs spécifiques selon le status code
        switch (error.status) {
            case 0:
                title = 'Connexion impossible';
                message = 'Impossible de contacter le serveur. Vérifiez votre connexion internet.';
                break;

            case 400:
                title = 'Données invalides';
                message = this.extractErrorMessage(error) || 'Les données fournies sont invalides.';
                break;

            case 401:
                title = 'Non autorisé';
                message = 'Vous devez vous connecter pour accéder à cette ressource.';
                break;

            case 403:
                title = 'Accès refusé';
                message = 'Vous n\'avez pas les permissions nécessaires.';
                break;

            case 404:
                title = 'Ressource non trouvée';
                message = 'La ressource demandée n\'a pas été trouvée.';
                break;

            case 409:
                title = 'Conflit';
                message = this.extractErrorMessage(error) || 'Cette ressource existe déjà.';
                break;

            case 422:
                title = 'Validation échouée';
                message = this.extractValidationErrors(error);
                break;

            case 429:
                title = 'Trop de requêtes';
                message = 'Vous avez effectué trop de requêtes. Veuillez patienter.';
                break;

            case 500:
                title = 'Erreur serveur';
                message = 'Une erreur est survenue sur le serveur. Veuillez réessayer plus tard.';
                break;

            default:
                message = this.extractErrorMessage(error) || `Erreur ${error.status}: ${error.statusText}`;
                break;
        }

        this.notificationService.showError(message, title);
    }

    /**
     * Extraire le message d'erreur de la réponse
     */
    private extractErrorMessage(error: HttpErrorResponse): string {
        if (error.error?.detail) {
            return error.error.detail;
        }
        if (error.error?.message) {
            return error.error.message;
        }
        if (typeof error.error === 'string') {
            return error.error;
        }
        return '';
    }

    /**
     * Extraire et formater les erreurs de validation
     */
    private extractValidationErrors(error: HttpErrorResponse): string {
        if (error.error?.errors && Array.isArray(error.error.errors)) {
            return error.error.errors
                .map((err: any) => err.message || err.detail)
                .join(', ');
        }
        return this.extractErrorMessage(error) || 'Erreur de validation';
    }
}