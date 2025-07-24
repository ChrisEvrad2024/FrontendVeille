import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './shared/layout/header/header';
import { Footer } from './shared/layout/footer/footer';
import { MapDisplayComponent } from './shared/components/map-display/map-display';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    Header,
    Footer,
    MapDisplayComponent
  ],
  templateUrl: './app.html', // Corrigé
  styleUrls: ['./app.scss']  // Corrigé
})
export class AppComponent {}