import { Component } from '@angular/core';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { latLng, tileLayer, MapOptions, Map, marker, icon } from 'leaflet';

@Component({
  selector: 'app-map-display',
  standalone: true,
  imports: [LeafletModule],
  templateUrl: './map-display.html',
  styleUrls: ['./map-display.scss']
})
export class MapDisplayComponent {

  // Options de base pour la carte
  mapOptions: MapOptions = {
    layers: [
      // Couche de tuiles qui affiche la carte depuis OpenStreetMap
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      })
    ],
    // Coordonnées initiales centrées sur Yaoundé et niveau de zoom
    zoom: 13,
    center: latLng(3.86, 11.51)
  };
}