// ===== src/app/shared/layout/header/header.ts =====
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class HeaderComponent {
  public authService = inject(AuthService);
  public logoError = signal(false);

  logout(): void {
    this.authService.logout();
  }

  /**
   * Gérer l'erreur de chargement du logo
   */
  onLogoError(): void {
    this.logoError.set(true);
  }
}