
// ===== 3. src/app/core/guards/role.guard.ts =====
import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
    return (route, state) => {
        const authService = inject(AuthService);
        const router = inject(Router);

        if (!authService.isAuthenticated()) {
            router.navigate(['/auth/login']);
            return false;
        }

        if (authService.hasRole(allowedRoles)) {
            return true;
        }

        // Rediriger vers une page d'accès refusé ou accueil
        router.navigate(['/']);
        return false;
    };
};

// Guards prédéfinis
export const moderatorGuard: CanActivateFn = roleGuard(['moderateur', 'admin', 'superadmin']);
export const collecteurGuard: CanActivateFn = roleGuard(['collecteur', 'moderateur', 'admin', 'superadmin']);
export const adminGuard: CanActivateFn = roleGuard(['admin', 'superadmin']);