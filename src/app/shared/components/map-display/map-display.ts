// ===== src/app/shared/components/map-display/map-display.ts - VERSION CORRIGÉE =====
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { 
  latLng, 
  tileLayer, 
  MapOptions, 
  Map as LeafletMap, 
  marker, 
  Marker,
  LatLng,
  Layer,
  LayerGroup,
  FeatureGroup,
  circle
} from 'leaflet';
import { Poi } from '../../../core/models';
import { IconService } from '../../../core/services/icon.service';

@Component({
  selector: 'app-map-display',
  standalone: true,
  imports: [CommonModule, LeafletModule],
  templateUrl: './map-display.html',
  styleUrls: ['./map-display.scss']
})
export class MapDisplayComponent implements OnInit, OnDestroy, OnChanges {
  private iconService = inject(IconService);

  // Inputs
  @Input() pois: Poi[] = [];
  @Input() center: LatLng = latLng(3.8480, 11.5021); // Yaoundé par défaut
  @Input() zoom: number = 13;
  @Input() height: string = '500px';
  @Input() showUserLocation: boolean = true;
  @Input() allowPoiCreation: boolean = false;
  @Input() selectedPoiId: number | null = null;
  @Input() showRadius: boolean = false;
  @Input() radiusKm: number = 5;

  // Outputs
  @Output() poiSelected = new EventEmitter<Poi>();
  @Output() mapClicked = new EventEmitter<{lat: number, lng: number}>();
  @Output() userLocationFound = new EventEmitter<{lat: number, lng: number}>();

  // Propriétés de la carte
  public map!: LeafletMap;
  public mapOptions: MapOptions;
  public layers: Layer[] = [];
  
  // Couches pour organiser les marqueurs
  private poiMarkersLayer = new LayerGroup();
  private userLocationMarker?: Marker;
  private radiusCircle?: Layer;
  private poiMarkers = new Map<number, Marker>();

  // État
  public isLoading = false;
  public userLocation: LatLng | null = null;

  constructor() {
    this.initializeMapOptions();
    this.mapOptions = {
      layers: [
        tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        })
      ],
      zoom: this.zoom,
      center: this.center
    };
  }

  ngOnInit(): void {
    if (this.showUserLocation) {
      this.requestUserLocation();
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Réagir aux changements des POI
    if (changes['pois'] && this.map) {
      this.updatePoiMarkers();
    }

    // Réagir au changement de POI sélectionné
    if (changes['selectedPoiId'] && this.map) {
      this.highlightSelectedPoi();
    }

    // Réagir au changement de rayon
    if (changes['radiusKm'] && this.map && this.showRadius) {
      this.updateRadiusCircle();
    }
  }

  /**
   * Initialiser les options de la carte
   */
  private initializeMapOptions(): void {
    this.mapOptions = {
      layers: [
        tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        })
      ],
      zoom: this.zoom,
      center: this.center
    };

    // Ajouter la couche des marqueurs POI
    this.layers = [this.poiMarkersLayer];
  }

  /**
   * Événement déclenché quand la carte est prête
   */
  onMapReady(map: LeafletMap): void {
    this.map = map;

    // Configurer les événements de clic
    this.map.on('click', (e: any) => {
      const { lat, lng } = e.latlng;
      this.mapClicked.emit({ lat, lng });
      
      if (this.allowPoiCreation) {
        this.showCreatePoiDialog(lat, lng);
      }
    });

    // Ajouter les marqueurs POI existants
    this.updatePoiMarkers();

    // Afficher le rayon si nécessaire
    if (this.showRadius) {
      this.updateRadiusCircle();
    }

    console.log('🗺️ Carte initialisée avec', this.pois.length, 'POI');
  }

  /**
   * Mettre à jour les marqueurs POI sur la carte
   */
  private updatePoiMarkers(): void {
    if (!this.map) return;

    // Supprimer les anciens marqueurs
    this.poiMarkersLayer.clearLayers();
    this.poiMarkers.clear();

    // Ajouter les nouveaux marqueurs
    this.pois.forEach(poi => {
      this.addPoiMarker(poi);
    });

    // Ajuster la vue pour inclure tous les POI si nécessaire
    if (this.pois.length > 0) {
      this.fitMapToPois();
    }
  }

  /**
   * Ajouter un marqueur pour un POI
   */
  private addPoiMarker(poi: Poi): void {
    if (!this.map) return;

    const poiIcon = this.iconService.createPoiIcon(
      poi.Category?.slug || 'default',
      poi.status
    );

    const poiMarker = marker([poi.latitude, poi.longitude], {
      icon: poiIcon,
      title: poi.name
    });

    // Créer le contenu de la popup
    const popupContent = this.createPoiPopupContent(poi);
    poiMarker.bindPopup(popupContent, {
      maxWidth: 300,
      className: 'poi-popup'
    });

    // Gérer le clic sur le marqueur
    poiMarker.on('click', () => {
      this.poiSelected.emit(poi);
      console.log('🎯 POI sélectionné:', poi.name);
    });

    // Ajouter à la couche et à la map des marqueurs
    this.poiMarkersLayer.addLayer(poiMarker);
    this.poiMarkers.set(poi.id, poiMarker);
  }

  /**
   * Créer le contenu HTML de la popup POI
   */
  private createPoiPopupContent(poi: Poi): string {
    const rating = poi.rating ? poi.rating.toFixed(1) : 'N/A';
    const ratingCount = poi.rating_count || 0;
    const category = poi.Category?.name || 'Non catégorisé';
    const quartier = poi.Quartier?.name || 'Quartier non spécifié';
    
    // Services (limiter à 3 pour la popup)
    const services = poi.Services?.slice(0, 3) || [];
    const servicesHtml = services.length > 0 
      ? services.map(s => `<span class="service-tag">• ${s.name}</span>`).join('')
      : '<span class="no-services">Aucun service listé</span>';

    const moreServices = poi.Services && poi.Services.length > 3 
      ? `<span class="more-services">+${poi.Services.length - 3} autres</span>` 
      : '';

    return `
      <div class="poi-popup-content">
        <div class="poi-popup-header">
          <h3 class="poi-name">${poi.name}</h3>
          <div class="poi-rating">
            <span class="stars">⭐ ${rating}</span>
            <span class="rating-count">(${ratingCount} avis)</span>
          </div>
        </div>
        
        <div class="poi-popup-body">
          <div class="poi-category">
            <span class="category-badge">${category}</span>
          </div>
          
          <div class="poi-location">
            📍 ${quartier}
          </div>
          
          <div class="poi-description">
            ${poi.description ? poi.description.substring(0, 100) + (poi.description.length > 100 ? '...' : '') : ''}
          </div>
          
          ${services.length > 0 ? `
            <div class="poi-services">
              <strong>🔧 Services:</strong>
              <div class="services-list">
                ${servicesHtml}
                ${moreServices}
              </div>
            </div>
          ` : ''}
        </div>
        
        <div class="poi-popup-actions">
          <button class="btn-details" onclick="window.viewPoiDetails && window.viewPoiDetails(${poi.id})">
            Voir détails
          </button>
          <button class="btn-favorite" onclick="window.toggleFavorite && window.toggleFavorite(${poi.id})">
            ❤️ Favoris
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Demander la géolocalisation de l'utilisateur
   */
  private requestUserLocation(): void {
    if ('geolocation' in navigator) {
      this.isLoading = true;
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          this.userLocation = latLng(lat, lng);
          this.addUserLocationMarker(lat, lng);
          this.userLocationFound.emit({ lat, lng });
          this.isLoading = false;
          
          console.log('📍 Position utilisateur trouvée:', lat, lng);
        },
        (error) => {
          console.warn('⚠️ Géolocalisation échouée:', error.message);
          this.isLoading = false;
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    }
  }

  /**
   * Ajouter le marqueur de position utilisateur
   */
  private addUserLocationMarker(lat: number, lng: number): void {
    if (!this.map) return;

    // Supprimer l'ancien marqueur s'il existe
    if (this.userLocationMarker) {
      this.map.removeLayer(this.userLocationMarker);
    }

    // Créer le nouveau marqueur
    const userIcon = this.iconService.createUserLocationIcon();
    this.userLocationMarker = marker([lat, lng], {
      icon: userIcon,
      title: 'Votre position'
    });

    this.userLocationMarker.bindPopup('📍 Vous êtes ici', {
      className: 'user-location-popup'
    });

    this.map.addLayer(this.userLocationMarker);
  }

  /**
   * Mettre à jour le cercle de rayon
   */
  private updateRadiusCircle(): void {
    if (!this.map || !this.userLocation) return;

    // Supprimer l'ancien cercle
    if (this.radiusCircle) {
      this.map.removeLayer(this.radiusCircle);
    }

    // Créer le nouveau cercle
    this.radiusCircle = circle(this.userLocation, {
      radius: this.radiusKm * 1000, // Conversion en mètres
      fillColor: '#3b82f6',
      fillOpacity: 0.1,
      color: '#3b82f6',
      weight: 2,
      dashArray: '5, 5'
    });

    this.map.addLayer(this.radiusCircle);
  }

  /**
   * Ajuster la vue pour inclure tous les POI
   */
  private fitMapToPois(): void {
    if (!this.map || this.pois.length === 0) return;

    const group = new FeatureGroup();
    this.poiMarkers.forEach((marker: Marker) => group.addLayer(marker));
    
    // Inclure aussi la position utilisateur si disponible
    if (this.userLocationMarker) {
      group.addLayer(this.userLocationMarker);
    }

    // Vérifier que le groupe a des couches avant de fitBounds
    if (group.getLayers().length > 0) {
      this.map.fitBounds(group.getBounds(), {
        padding: [20, 20],
        maxZoom: 15
      });
    }
  }

  /**
   * Centrer la carte sur un POI spécifique
   */
  public centerOnPoi(poi: Poi): void {
    if (!this.map) return;

    this.map.setView([poi.latitude, poi.longitude], 16, {
      animate: true,
      duration: 1
    });

    // Ouvrir la popup du POI
    const poiMarker = this.poiMarkers.get(poi.id);
    if (poiMarker) {
      setTimeout(() => {
        poiMarker.openPopup();
      }, 500);
    }
  }

  /**
   * Mettre en évidence le POI sélectionné
   */
  private highlightSelectedPoi(): void {
    if (!this.selectedPoiId) return;

    const selectedPoi = this.pois.find(poi => poi.id === this.selectedPoiId);
    if (selectedPoi) {
      this.centerOnPoi(selectedPoi);
    }
  }

  /**
   * Afficher le dialog de création de POI
   */
  private showCreatePoiDialog(lat: number, lng: number): void {
    // Cette méthode sera implémentée plus tard
    console.log('🆕 Créer un POI à:', lat, lng);
  }

  /**
   * Méthodes publiques pour l'interaction externe
   */
  public getCurrentCenter(): LatLng | null {
    return this.map ? this.map.getCenter() : null;
  }

  public getCurrentZoom(): number {
    return this.map ? this.map.getZoom() : this.zoom;
  }

  public invalidateSize(): void {
    if (this.map) {
      this.map.invalidateSize();
    }
  }
}