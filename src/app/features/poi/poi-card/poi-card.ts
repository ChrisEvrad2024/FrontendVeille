// ===== src/app/features/poi/poi-card/poi-card.ts =====
import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Poi } from '../../../core/models';
import { AuthService } from '../../../core/services/auth';
import { IconService } from '../../../core/services/icon.service';

@Component({
  selector: 'app-poi-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './poi-card.html',
  styleUrls: ['./poi-card.scss']
})
export class PoiCardComponent {
  private authService = inject(AuthService);
  private iconService = inject(IconService);

  @Input({ required: true }) poi!: Poi;
  @Input() showDistance: boolean = true;
  @Input() userLocation: { lat: number, lng: number } | null = null;
  @Input() compact: boolean = false;

  @Output() poiClick = new EventEmitter<Poi>();
  @Output() favoriteToggle = new EventEmitter<Poi>();
  @Output() shareClick = new EventEmitter<Poi>();

  /**
   * Calculer la distance depuis la position utilisateur
   */
  get distance(): string | null {
    if (!this.showDistance || !this.userLocation) return null;

    const R = 6371; // Rayon de la Terre en km
    const dLat = this.deg2rad(this.poi.latitude - this.userLocation.lat);
    const dLng = this.deg2rad(this.poi.longitude - this.userLocation.lng);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(this.userLocation.lat)) * 
      Math.cos(this.deg2rad(this.poi.latitude)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;

    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    } else {
      return `${distance.toFixed(1)}km`;
    }
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  /**
   * Obtenir la couleur de la catégorie
   */
  get categoryColor(): string {
    if (!this.poi.Category?.slug) return '#718096';
    return this.iconService.getCategoryConfig(this.poi.Category.slug).backgroundColor;
  }

  /**
   * Obtenir l'icône de la catégorie
   */
  get categoryIcon(): string {
    if (!this.poi.Category?.slug) return '📍';
    return this.iconService.getCategoryConfig(this.poi.Category.slug).iconClass;
  }

  /**
   * Formater la note
   */
  get formattedRating(): string {
    return this.poi.rating ? this.poi.rating.toFixed(1) : '0.0';
  }

  /**
   * Obtenir les étoiles pour l'affichage
   */
  get ratingStars(): string {
    const rating = this.poi.rating || 0;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return '★'.repeat(fullStars) + 
           (hasHalfStar ? '☆' : '') + 
           '☆'.repeat(emptyStars);
  }

  /**
   * Obtenir les premiers services à afficher
   */
  get visibleServices(): any[] {
    return this.poi.Services?.slice(0, 3) || [];
  }

  /**
   * Nombre de services supplémentaires
   */
  get additionalServicesCount(): number {
    const totalServices = this.poi.Services?.length || 0;
    return Math.max(0, totalServices - 3);
  }

  /**
   * Vérifier si le POI est en favoris
   */
  get isFavorite(): boolean {
    return this.poi.is_favorite || false;
  }

  /**
   * Vérifier si l'utilisateur peut voir les favoris
   */
  get canToggleFavorite(): boolean {
    return this.authService.isAuthenticated();
  }

  /**
   * Obtenir l'URL de l'image principale
   */
  get imageUrl(): string {
    if (this.poi.imageUrls?.thumbnails?.medium) {
      return this.poi.imageUrls.thumbnails.medium;
    }
    if (this.poi.image) {
      return this.poi.image;
    }
    return '/assets/images/poi-placeholder.jpg';
  }

  /**
   * Gérer l'erreur de chargement d'image
   */
  onImageError(event: any): void {
    event.target.src = '/assets/images/poi-placeholder.jpg';
  }

  /**
   * Émettre l'événement de clic sur la carte
   */
  onCardClick(): void {
    this.poiClick.emit(this.poi);
  }

  /**
   * Basculer le favori
   */
  onFavoriteClick(event: Event): void {
    event.stopPropagation();
    if (this.canToggleFavorite) {
      this.favoriteToggle.emit(this.poi);
    }
  }

  /**
   * Partager le POI
   */
  onShareClick(event: Event): void {
    event.stopPropagation();
    this.shareClick.emit(this.poi);
  }

  /**
   * Obtenir le badge de statut
   */
  get statusBadge(): { text: string, class: string } | null {
    switch (this.poi.status) {
      case 'pending':
        return { text: 'En attente', class: 'status-pending' };
      case 'rejected':
        return { text: 'Rejeté', class: 'status-rejected' };
      case 'approved':
      default:
        return null; // Pas de badge pour approuvé
    }
  }

  /**
   * Badges spéciaux du POI
   */
  get specialBadges(): string[] {
    const badges: string[] = [];
    
    if (this.poi.is_verify) badges.push('Vérifié');
    if (this.poi.is_recommand) badges.push('Recommandé');
    if (this.poi.etoile && this.poi.etoile >= 4) badges.push('Top noté');
    
    return badges;
  }
}