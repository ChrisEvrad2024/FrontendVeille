// ===== src/app/core/services/icon.service.ts =====
import { Injectable } from '@angular/core';
import { icon, Icon, DivIcon } from 'leaflet';

export interface PoiIconConfig {
  iconClass: string;
  color: string;
  backgroundColor: string;
  size: [number, number];
}

@Injectable({
  providedIn: 'root'
})
export class IconService {
  
  private readonly iconConfigs: { [key: string]: PoiIconConfig } = {
    // Restaurants et alimentation
    'restaurant': {
      iconClass: '🍽️',
      color: '#ffffff',
      backgroundColor: '#e53e3e',
      size: [35, 35]
    },
    'cafe': {
      iconClass: '☕',
      color: '#ffffff', 
      backgroundColor: '#8b4513',
      size: [35, 35]
    },
    'bar': {
      iconClass: '🍺',
      color: '#ffffff',
      backgroundColor: '#ff6b35',
      size: [35, 35]
    },
    
    // Transport
    'transport': {
      iconClass: '🚌',
      color: '#ffffff',
      backgroundColor: '#3182ce',
      size: [35, 35]
    },
    'gare': {
      iconClass: '🚂',
      color: '#ffffff',
      backgroundColor: '#2c5aa0',
      size: [35, 35]
    },
    'aeroport': {
      iconClass: '✈️',
      color: '#ffffff',
      backgroundColor: '#1a365d',
      size: [35, 35]
    },
    
    // Sports et loisirs
    'stadium': {
      iconClass: '🏟️',
      color: '#ffffff',
      backgroundColor: '#38a169',
      size: [35, 35]
    },
    'sport': {
      iconClass: '⚽',
      color: '#ffffff',
      backgroundColor: '#2f855a',
      size: [35, 35]
    },
    'parc': {
      iconClass: '🌳',
      color: '#ffffff',
      backgroundColor: '#68d391',
      size: [35, 35]
    },
    
    // Hébergement
    'hotel': {
      iconClass: '🏨',
      color: '#ffffff',
      backgroundColor: '#805ad5',
      size: [35, 35]
    },
    'auberge': {
      iconClass: '🏠',
      color: '#ffffff',
      backgroundColor: '#6b46c1',
      size: [35, 35]
    },
    
    // Santé
    'hopital': {
      iconClass: '🏥',
      color: '#ffffff',
      backgroundColor: '#d53f8c',
      size: [35, 35]
    },
    'pharmacie': {
      iconClass: '💊',
      color: '#ffffff',
      backgroundColor: '#b83280',
      size: [35, 35]
    },
    
    // Éducation
    'ecole': {
      iconClass: '🎓',
      color: '#ffffff',
      backgroundColor: '#ed8936',
      size: [35, 35]
    },
    'universite': {
      iconClass: '🏛️',
      color: '#ffffff',
      backgroundColor: '#dd6b20',
      size: [35, 35]
    },
    
    // Commerce
    'magasin': {
      iconClass: '🏪',
      color: '#ffffff',
      backgroundColor: '#38b2ac',
      size: [35, 35]
    },
    'marche': {
      iconClass: '🛒',
      color: '#ffffff',
      backgroundColor: '#319795',
      size: [35, 35]
    },
    
    // Culture et religion
    'musee': {
      iconClass: '🎭',
      color: '#ffffff',
      backgroundColor: '#9f7aea',
      size: [35, 35]
    },
    'eglise': {
      iconClass: '⛪',
      color: '#ffffff',
      backgroundColor: '#744210',
      size: [35, 35]
    },
    'mosquee': {
      iconClass: '🕌',
      color: '#ffffff',
      backgroundColor: '#2d3748',
      size: [35, 35]
    },
    
    // Administration
    'mairie': {
      iconClass: '🏛️',
      color: '#ffffff',
      backgroundColor: '#4a5568',
      size: [35, 35]
    },
    'police': {
      iconClass: '👮',
      color: '#ffffff',
      backgroundColor: '#2d3748',
      size: [35, 35]
    },
    
    // Défaut
    'default': {
      iconClass: '📍',
      color: '#ffffff',
      backgroundColor: '#718096',
      size: [35, 35]
    }
  };

  /**
   * Créer une icône personnalisée pour un POI
   */
  createPoiIcon(categorySlug: string, status: 'approved' | 'pending' | 'rejected' = 'approved'): DivIcon {
    const config = this.iconConfigs[categorySlug.toLowerCase()] || this.iconConfigs['default'];
    
    // Ajuster la couleur selon le statut
    let backgroundColor = config.backgroundColor;
    let borderColor = '#ffffff';
    
    switch (status) {
      case 'pending':
        backgroundColor = '#ed8936'; // Orange pour en attente
        borderColor = '#fff5f5';
        break;
      case 'rejected':
        backgroundColor = '#e53e3e'; // Rouge pour rejeté
        borderColor = '#fed7d7';
        break;
      case 'approved':
      default:
        borderColor = '#ffffff';
        break;
    }

    return new DivIcon({
      html: `
        <div style="
          width: ${config.size[0]}px;
          height: ${config.size[1]}px;
          background-color: ${backgroundColor};
          border: 3px solid ${borderColor};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
          cursor: pointer;
          transition: transform 0.2s ease;
        " 
        onmouseover="this.style.transform='scale(1.1)'"
        onmouseout="this.style.transform='scale(1)'"
        >
          ${config.iconClass}
        </div>
      `,
      className: 'custom-poi-icon',
      iconSize: config.size,
      iconAnchor: [config.size[0] / 2, config.size[1] / 2],
      popupAnchor: [0, -config.size[1] / 2]
    });
  }

  /**
   * Créer une icône pour la position de l'utilisateur
   */
  createUserLocationIcon(): DivIcon {
    return new DivIcon({
      html: `
        <div style="
          width: 20px;
          height: 20px;
          background-color: #3b82f6;
          border: 4px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3);
          animation: pulse 2s infinite;
        "></div>
        <style>
          @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
            100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
          }
        </style>
      `,
      className: 'user-location-icon',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
      popupAnchor: [0, -10]
    });
  }

  /**
   * Obtenir la liste de toutes les catégories avec leurs couleurs
   */
  getAllCategoryColors(): { [key: string]: string } {
    const colors: { [key: string]: string } = {};
    Object.keys(this.iconConfigs).forEach(key => {
      colors[key] = this.iconConfigs[key].backgroundColor;
    });
    return colors;
  }

  /**
   * Obtenir la configuration d'une catégorie
   */
  getCategoryConfig(categorySlug: string): PoiIconConfig {
    return this.iconConfigs[categorySlug.toLowerCase()] || this.iconConfigs['default'];
  }
}