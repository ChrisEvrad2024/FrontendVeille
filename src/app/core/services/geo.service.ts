import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class GeoService {

    /**
     * Demande la géolocalisation de l'utilisateur via l'API du navigateur.
     * @returns Un Observable qui émet la position ou une erreur.
     */
    getUserLocation(): Observable<{ lat: number; lon: number }> {
        return new Observable(observer => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        observer.next({
                            lat: position.coords.latitude,
                            lon: position.coords.longitude
                        });
                        observer.complete();
                    },
                    (error) => {
                        console.error('Erreur de géolocalisation:', error);
                        observer.error(error);
                    }
                );
            } else {
                observer.error('La géolocalisation n\'est pas supportée par ce navigateur.');
            }
        });
    }

    /**
     * Calcule la distance entre deux points GPS en utilisant la formule de Haversine.
     * @returns La distance en kilomètres.
     */
    calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // Rayon de la Terre en km
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance en km
    }

    private deg2rad(deg: number): number {
        return deg * (Math.PI / 180);
    }
}
