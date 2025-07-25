// ===== src/app/app.routes.ts - MISE À JOUR =====
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { moderatorGuard, collecteurGuard } from './core/guards/role.guard';

export const routes: Routes = [
    // Redirection par défaut vers la liste des POI
    { path: '', redirectTo: '/map-display', pathMatch: 'full' },

    // Routes d'authentification
    {
        path: 'auth',
        children: [
            {
                path: 'login',
                loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent)
            },
            {
                path: 'register',
                loadComponent: () => import('./features/auth/register/register').then(m => m.RegisterComponent)
            },
            {
                path: 'profile',
                loadComponent: () => import('./features/auth/profile/profile').then(m => m.ProfileComponent),
                canActivate: [authGuard]
            }
        ]
    },

    // Route pour map-display standalone
    {
        path: 'map-display',
        loadComponent: () => import('./shared/components/map-display/map-display').then(m => m.MapDisplayComponent)
    },

    // Routes POI (maintenant actives)
    {
        path: 'poi',
        children: [
            {
                path: '',
                loadComponent: () => import('./features/poi/poi-list/poi-list').then(m => m.PoiListComponent)
            },
            {
                path: 'map',
                loadComponent: () => import('./features/poi/poi-map-view/poi-map-view').then(m => m.PoiMapView)
            },
            {
                path: 'create',
                loadComponent: () => import('./features/poi/poi-create/poi-create').then(m => m.PoiCreate),
                canActivate: [collecteurGuard]
            },
            {
                path: ':id',
                loadComponent: () => import('./features/poi/poi-detail/poi-detail').then(m => m.PoiDetail)
            }
        ]
    },

    // Route 404
    { path: '**', redirectTo: '/map-display' }
];