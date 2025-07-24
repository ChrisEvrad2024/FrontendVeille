import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/layout/header/header';
import { Footer} from './shared/layout/footer/footer';
import { MapDisplayComponent } from './shared/components/map-display/map-display';
import { NotificationComponent } from './shared/components/notification/notification';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    Footer,
    MapDisplayComponent,
    NotificationComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent {}
