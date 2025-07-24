// ===== 2. src/app/core/guards/auth.guard.ts =====
import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated()) {
        return true;
    }

    // Rediriger vers la page de connexion avec l'URL de retour
    router.navigate(['/auth/login'], {
        queryParams: { returnUrl: state.url }
    });
    return false;
};
