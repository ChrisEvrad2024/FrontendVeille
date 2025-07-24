// src/app/features/auth/login/login.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { NotificationService } from '../../../core/services/notification';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinner, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  public isLoading = signal(false);
  public showPassword = signal(false);
  public serverStatus = signal<'checking' | 'online' | 'offline'>('checking');

  public loginForm: FormGroup = this.fb.group({

  });

  constructor() {
    // this.checkServerStatus();
  }

  /**
   * Vérifier si le serveur backend est accessible
   */
  // private checkServerStatus(): void {
  //   this.serverStatus.set('checking');
    
  //   // Test de connectivité au serveur - CORRECTION de l'URL
  //   fetch(`${environment.apiUrl}/health`) // Maintenant ça pointe vers /api/health
  //     .then(response => {
  //       if (response.ok) {
  //         this.serverStatus.set('online');
  //         console.log('✅ Serveur backend connecté');
  //       } else {
  //         this.serverStatus.set('offline');
  //         console.log('❌ Serveur backend inaccessible (status:', response.status, ')');
  //       }
  //     })
  //     .catch((error) => {
  //       this.serverStatus.set('offline');
  //       console.log('❌ Erreur connexion serveur:', error);
  //       this.notificationService.showWarning(
  //         `Le serveur backend n'est pas accessible sur ${environment.apiUrl}. Assurez-vous qu'il fonctionne sur le port 9999`,
  //         'Serveur inaccessible'
  //       );
  //     });
  // }

  /**
   * Relancer le test de connectivité
   */
  // recheckServer(): void {
  //   this.checkServerStatus();
  // }

  /**
   * Soumettre le formulaire de connexion
   */
  onSubmit(): void {
    if (this.loginForm.valid && this.serverStatus() === 'online') {
      this.isLoading.set(true);

      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.notificationService.showSuccess(
            `Bienvenue ${response.user.name} !`, 
            'Connexion réussie'
          );
          
          // Rediriger vers l'URL de retour ou la page d'accueil
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
          this.router.navigate([returnUrl]);
        },
        error: (error) => {
          this.isLoading.set(false);
          console.error('Erreur de connexion:', error);
          this.notificationService.showError(
            error.message || 'Erreur de connexion',
            'Connexion échouée'
          );
        }
      });
    } else if (this.serverStatus() === 'offline') {
      this.notificationService.showError(
        'Le serveur backend n\'est pas accessible',
        'Connexion impossible'
      );
    } else {
      this.markFormGroupTouched();
    }
  }

  /**
   * Tester la connexion avec les identifiants pré-remplis
   */
  testLogin(): void {
    this.loginForm.patchValue({
      email: 'test.postman@example.com',
      password: 'TestPassword123!'
    });
    this.onSubmit();
  }

  /**
   * Marquer tous les champs comme touchés pour afficher les erreurs
   */
  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }

  /**
   * Vérifier si un champ a une erreur
   */
  hasError(fieldName: string, errorType?: string): boolean {
    const field = this.loginForm.get(fieldName);
    if (!field) return false;
    
    if (errorType) {
      return field.hasError(errorType) && (field.dirty || field.touched);
    }
    return field.invalid && (field.dirty || field.touched);
  }

  /**
   * Obtenir le message d'erreur pour un champ
   */
  getErrorMessage(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.hasError('required')) {
      return `${fieldName === 'email' ? 'Email' : 'Mot de passe'} requis`;
    }
    if (field.hasError('email')) {
      return 'Email invalide';
    }
    if (field.hasError('minlength')) {
      return 'Le mot de passe doit contenir au moins 8 caractères';
    }
    return '';
  }

  /**
   * Basculer la visibilité du mot de passe
   */
  togglePasswordVisibility(): void {
    this.showPassword.update(visible => !visible);
  }
}