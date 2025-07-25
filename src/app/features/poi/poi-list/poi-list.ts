// ===== src/app/features/poi/poi-list/poi-list.ts - VERSION FINALE API RÉELLE =====
import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, switchMap, combineLatest, forkJoin } from 'rxjs';

import { Poi, Category, Quartier, PoiSearchFilters } from '../../../core/models';
import { PoiService } from '../../../core/services/poi.service';
import { CategoryService } from '../../../core/services/category.service';
import { QuartierService } from '../../../core/services/quartier.service';
import { FavoriteService } from '../../../core/services/favorite.service';
import { NotificationService } from '../../../core/services/notification';
import { AuthService } from '../../../core/services/auth';
import { PoiCardComponent } from '../poi-card/poi-card';
import { MapDisplayComponent } from '../../../shared/components/map-display/map-display';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';

type ViewMode = 'grid' | 'list' | 'map';
type SortBy = 'name' | 'rating' | 'distance' | 'created_at';
type SortOrder = 'asc' | 'desc';

@Component({
  selector: 'app-poi-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PoiCardComponent,
    MapDisplayComponent,
    LoadingSpinner
  ],
  templateUrl: './poi-list.html',
  styleUrls: ['./poi-list.scss']
})
export class PoiListComponent implements OnInit, OnDestroy {
  private poiService = inject(PoiService);
  private categoryService = inject(CategoryService);
  private quartierService = inject(QuartierService);
  private favoriteService = inject(FavoriteService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();

  // État des données
  public pois = signal<Poi[]>([]);
  public allPois = signal<Poi[]>([]);
  public categories = signal<Category[]>([]);
  public quartiers = signal<Quartier[]>([]);
  public userFavorites = signal<Set<number>>(new Set());
  public isLoading = signal(false);
  public hasError = signal(false);
  public errorMessage = signal('');

  // État de la vue
  public viewMode = signal<ViewMode>('grid');
  public searchTerm = signal('');
  public selectedCategories = signal<number[]>([]);
  public selectedQuartiers = signal<number[]>([]);
  public sortBy = signal<SortBy>('name');
  public sortOrder = signal<SortOrder>('asc');
  public showOnlyFavorites = signal(false);

  // Pagination
  public currentPage = signal(1);
  public itemsPerPage = signal(12);
  public totalItems = computed(() => this.filteredPois().length);
  public totalPages = computed(() => Math.ceil(this.totalItems() / this.itemsPerPage()));

  // Géolocalisation
  public userLocation = signal<{ lat: number, lng: number } | null>(null);
  public showDistance = signal(true);

  // Filtres
  public filters = signal<PoiSearchFilters>({});
  public showFilters = signal(false);

  // POI calculés et filtrés (côté client pour la réactivité)
  public filteredPois = computed(() => {
    let result = [...this.allPois()];

    // Filtrage par terme de recherche
    const search = this.searchTerm().toLowerCase().trim();
    if (search) {
      result = result.filter(poi =>
        poi.name.toLowerCase().includes(search) ||
        poi.description.toLowerCase().includes(search) ||
        poi.Category?.name.toLowerCase().includes(search) ||
        poi.Quartier?.name.toLowerCase().includes(search)
      );
    }

    // Filtrage par catégories
    const selectedCats = this.selectedCategories();
    if (selectedCats.length > 0) {
      result = result.filter(poi =>
        poi.category_id && selectedCats.includes(poi.category_id)
      );
    }

    // Filtrage par quartiers
    const selectedQuarts = this.selectedQuartiers();
    if (selectedQuarts.length > 0) {
      result = result.filter(poi =>
        poi.quartier_id && selectedQuarts.includes(poi.quartier_id)
      );
    }

    // Filtrage par favoris
    if (this.showOnlyFavorites() && this.authService.isAuthenticated()) {
      const favorites = this.userFavorites();
      result = result.filter(poi => favorites.has(poi.id));
    }

    // Tri
    result.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (this.sortBy()) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'rating':
          aValue = a.rating || 0;
          bValue = b.rating || 0;
          break;
        case 'distance':
          if (this.userLocation()) {
            aValue = this.calculateDistance(a);
            bValue = this.calculateDistance(b);
          } else {
            return 0;
          }
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return this.sortOrder() === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortOrder() === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  });

  // POI paginés
  public paginatedPois = computed(() => {
    const filtered = this.filteredPois();
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return filtered.slice(start, end);
  });

  // Statistiques
  public stats = computed(() => ({
    total: this.allPois().length,
    filtered: this.filteredPois().length,
    categories: new Set(this.allPois().map(p => p.category_id)).size,
    quartiers: new Set(this.allPois().map(p => p.quartier_id)).size,
    averageRating: this.allPois().length > 0
      ? this.allPois().reduce((sum, p) => sum + (p.rating || 0), 0) / this.allPois().length
      : 0
  }));

  ngOnInit(): void {
    this.loadUserPreferences();
    this.loadInitialData();
    this.setupUserLocation();
    this.setupUrlParams();
    this.loadUserFavorites();

    // Event listeners
    window.addEventListener('resize', () => this.onWindowResize());
    this.onWindowResize();
  }

  ngOnDestroy(): void {
    this.saveUserPreferences();
    this.destroy$.next();
    this.destroy$.complete();
    window.removeEventListener('resize', () => this.onWindowResize());
  }

  /**
   * Charger toutes les données initiales depuis l'API
   */
  private loadInitialData(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    // Charger en parallèle POI, catégories et quartiers
    forkJoin({
      pois: this.poiService.getApprovedPois(),
      categories: this.categoryService.getAllCategories(),
      quartiers: this.quartierService.getAllQuartiers()
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        // POI avec enrichissement des favoris
        const poisWithFavorites = this.enrichPoisWithFavorites(data.pois);
        this.allPois.set(poisWithFavorites);
        this.pois.set(poisWithFavorites);

        // Métadonnées
        this.categories.set(data.categories);
        this.quartiers.set(data.quartiers);

        this.isLoading.set(false);
        console.log('✅ Données chargées depuis l\'API:', {
          pois: data.pois.length,
          categories: data.categories.length,
          quartiers: data.quartiers.length
        });
      },
      error: (error) => {
        console.error('❌ Erreur chargement données:', error);
        this.hasError.set(true);
        this.errorMessage.set(error.message || 'Erreur de connexion au serveur');
        this.isLoading.set(false);
        this.notificationService.showError(
          'Impossible de charger les données depuis le serveur',
          'Erreur de connexion'
        );
      }
    });
  }

  /**
   * Enrichir les POI avec les informations de favoris
   */
  private enrichPoisWithFavorites(pois: Poi[]): Poi[] {
    const favorites = this.userFavorites();
    return pois.map(poi => ({
      ...poi,
      is_favorite: favorites.has(poi.id)
    }));
  }

  /**
   * Charger les favoris de l'utilisateur
   */
  private loadUserFavorites(): void {
    if (!this.authService.isAuthenticated()) {
      return;
    }

    this.favoriteService.getUserFavorites()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (favorites) => {
          const favoriteIds = new Set(favorites.map(poi => poi.id));
          this.userFavorites.set(favoriteIds);
          console.log('❤️ Favoris chargés:', favoriteIds.size);
        },
        error: (error) => {
          console.warn('⚠️ Erreur chargement favoris:', error);
        }
      });
  }

  /**
   * Configurer la géolocalisation
   */
  private setupUserLocation(): void {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userLocation.set({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          console.log('📍 Position utilisateur obtenue');
        },
        (error) => {
          console.warn('⚠️ Géolocalisation échouée:', error.message);
          this.showDistance.set(false);
        }
      );
    }
  }

  /**
   * Configurer les paramètres URL
   */
  private setupUrlParams(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['search']) this.searchTerm.set(params['search']);
        if (params['category']) this.selectedCategories.set([+params['category']]);
        if (params['view']) this.viewMode.set(params['view'] as ViewMode);
        if (params['sort']) this.sortBy.set(params['sort'] as SortBy);
        if (params['order']) this.sortOrder.set(params['order'] as SortOrder);
      });
  }

  /**
   * Calculer la distance d'un POI depuis la position utilisateur
   */
  private calculateDistance(poi: Poi): number {
    if (!this.userLocation()) return 0;

    const userLoc = this.userLocation()!;
    return this.poiService.calculateDistance(
      userLoc.lat, userLoc.lng,
      poi.latitude, poi.longitude
    );
  }

  /**
   * Changer le mode de vue
   */
  changeViewMode(mode: ViewMode): void {
    this.viewMode.set(mode);
    this.updateUrlParams();
  }

  /**
   * Changer le tri
   */
  changeSorting(sortBy: SortBy): void {
    if (this.sortBy() === sortBy) {
      this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(sortBy);
      this.sortOrder.set('asc');
    }
    this.currentPage.set(1);
    this.updateUrlParams();
  }

  /**
   * Rechercher
   */
  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.currentPage.set(1);
    this.updateUrlParams();
  }

  /**
   * Filtrer par catégorie
   */
  toggleCategory(categoryId: number): void {
    const current = this.selectedCategories();
    if (current.includes(categoryId)) {
      this.selectedCategories.set(current.filter(id => id !== categoryId));
    } else {
      this.selectedCategories.set([...current, categoryId]);
    }
    this.currentPage.set(1);
    this.updateUrlParams();
  }

  /**
   * Filtrer par quartier
   */
  toggleQuartier(quartierId: number): void {
    const current = this.selectedQuartiers();
    if (current.includes(quartierId)) {
      this.selectedQuartiers.set(current.filter(id => id !== quartierId));
    } else {
      this.selectedQuartiers.set([...current, quartierId]);
    }
    this.currentPage.set(1);
    this.updateUrlParams();
  }

  /**
   * Réinitialiser les filtres
   */
  resetFilters(): void {
    this.searchTerm.set('');
    this.selectedCategories.set([]);
    this.selectedQuartiers.set([]);
    this.showOnlyFavorites.set(false);
    this.currentPage.set(1);
    this.updateUrlParams();
  }

  /**
   * Changer de page
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.updateUrlParams();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * Mettre à jour les paramètres URL
   */
  private updateUrlParams(): void {
    const params: any = {};

    if (this.searchTerm()) params.search = this.searchTerm();
    if (this.selectedCategories().length) params.category = this.selectedCategories()[0];
    if (this.viewMode() !== 'grid') params.view = this.viewMode();
    if (this.sortBy() !== 'name') params.sort = this.sortBy();
    if (this.sortOrder() !== 'asc') params.order = this.sortOrder();

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  /**
   * Gérer le clic sur un POI
   */
  onPoiClick(poi: Poi): void {
    this.router.navigate(['/poi', poi.id]);
  }

  /**
   * Gérer le clic sur une carte (depuis la vue map)
   */
  onMapPoiSelected(poi: Poi): void {
    this.onPoiClick(poi);
  }

  /**
   * Basculer les favoris avec API réelle
   */
  onFavoriteToggle(poi: Poi): void {
    if (!this.authService.isAuthenticated()) {
      this.notificationService.showInfo(
        'Connectez-vous pour ajouter des favoris',
        'Connexion requise'
      );
      this.router.navigate(['/auth/login']);
      return;
    }

    this.favoriteService.toggleFavorite(poi.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          // Mettre à jour l'état local
          const favorites = new Set(this.userFavorites());
          if (result.is_favorite) {
            favorites.add(poi.id);
            this.notificationService.showSuccess(
              `${poi.name} ajouté aux favoris`,
              'Favori ajouté'
            );
          } else {
            favorites.delete(poi.id);
            this.notificationService.showSuccess(
              `${poi.name} retiré des favoris`,
              'Favori retiré'
            );
          }
          this.userFavorites.set(favorites);

          // Mettre à jour le POI dans la liste
          this.updatePoiFavoriteStatus(poi.id, result.is_favorite);
        },
        error: (error) => {
          console.error('❌ Erreur toggle favori:', error);
          this.notificationService.showError(
            'Erreur lors de la mise à jour des favoris',
            'Erreur favoris'
          );
        }
      });
  }

  /**
   * Mettre à jour le statut favori d'un POI dans la liste
   */
  private updatePoiFavoriteStatus(poiId: number, isFavorite: boolean): void {
    const updatedPois = this.allPois().map(poi =>
      poi.id === poiId ? { ...poi, is_favorite: isFavorite } : poi
    );
    this.allPois.set(updatedPois);
  }

  /**
   * Partager un POI
   */
  onPoiShare(poi: Poi): void {
    if (navigator.share) {
      navigator.share({
        title: poi.name,
        text: poi.description,
        url: `${window.location.origin}/poi/${poi.id}`
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/poi/${poi.id}`);
      this.notificationService.showSuccess('Lien copié !', 'Partage');
    }
  }

  /**
   * Recharger les données avec vérification API
   */
  refresh(): void {
    this.poiService.healthCheck()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('✅ API accessible, rechargement...');
          this.loadInitialData();
          if (this.authService.isAuthenticated()) {
            this.loadUserFavorites();
          }
        },
        error: (error) => {
          console.error('❌ API non accessible:', error);
          this.hasError.set(true);
          this.errorMessage.set('Serveur indisponible');
          this.notificationService.showError(
            'Le serveur n\'est pas accessible',
            'Serveur indisponible'
          );
        }
      });
  }

  /**
   * Adapter la pagination selon la taille d'écran
   */
  onWindowResize(): void {
    const screenWidth = window.innerWidth;

    if (screenWidth < 640) {
      this.itemsPerPage.set(6);
    } else if (screenWidth < 1024) {
      this.itemsPerPage.set(9);
    } else {
      this.itemsPerPage.set(12);
    }
  }

  /**
   * Sauvegarder les préférences utilisateur
   */
  private saveUserPreferences(): void {
    const preferences = {
      viewMode: this.viewMode(),
      itemsPerPage: this.itemsPerPage(),
      sortBy: this.sortBy(),
      sortOrder: this.sortOrder(),
      showDistance: this.showDistance()
    };

    try {
      localStorage.setItem('poi-list-preferences', JSON.stringify(preferences));
    } catch (error) {
      console.warn('Impossible de sauvegarder les préférences:', error);
    }
  }

  /**
   * Charger les préférences utilisateur
   */
  private loadUserPreferences(): void {
    try {
      const saved = localStorage.getItem('poi-list-preferences');
      if (saved) {
        const preferences = JSON.parse(saved);

        if (preferences.viewMode) this.viewMode.set(preferences.viewMode);
        if (preferences.itemsPerPage) this.itemsPerPage.set(preferences.itemsPerPage);
        if (preferences.sortBy) this.sortBy.set(preferences.sortBy);
        if (preferences.sortOrder) this.sortOrder.set(preferences.sortOrder);
        if (preferences.showDistance !== undefined) this.showDistance.set(preferences.showDistance);
      }
    } catch (error) {
      console.warn('Impossible de charger les préférences:', error);
    }
  }

  // Getters pour les templates
  get sortText(): string {
    const sortTexts = {
      'name': 'Nom',
      'rating': 'Note',
      'distance': 'Distance',
      'created_at': 'Date'
    };
    const order = this.sortOrder() === 'asc' ? '↑' : '↓';
    return `${sortTexts[this.sortBy()]} ${order}`;
  }

  get paginationPages(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const delta = 2;

    const range: number[] = [];
    for (let i = Math.max(2, current - delta);
      i <= Math.min(total - 1, current + delta);
      i++) {
      range.push(i);
    }

    if (current - delta > 2) {
      range.unshift(-1);
    }
    if (current + delta < total - 1) {
      range.push(-1);
    }

    range.unshift(1);
    if (total > 1) {
      range.push(total);
    }

    return range.filter((v, i, a) => a.indexOf(v) === i);
  }

  get hasActiveFilters(): boolean {
    return this.searchTerm() !== '' ||
      this.selectedCategories().length > 0 ||
      this.selectedQuartiers().length > 0 ||
      this.showOnlyFavorites();
  }

  get activeFiltersText(): string[] {
    const filters: string[] = [];

    if (this.searchTerm()) {
      filters.push(`Recherche: "${this.searchTerm()}"`);
    }

    if (this.selectedCategories().length > 0) {
      const categoryNames = this.selectedCategories()
        .map(id => this.categories().find(c => c.id === id)?.name)
        .filter(Boolean);
      filters.push(`Catégories: ${categoryNames.join(', ')}`);
    }

    if (this.selectedQuartiers().length > 0) {
      const quartierNames = this.selectedQuartiers()
        .map(id => this.quartiers().find(q => q.id === id)?.name)
        .filter(Boolean);
      filters.push(`Quartiers: ${quartierNames.join(', ')}`);
    }

    if (this.showOnlyFavorites()) {
      filters.push('Favoris uniquement');
    }

    return filters;
  }
}