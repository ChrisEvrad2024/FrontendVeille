// ===== 6. src/app/core/services/notification.ts =====
import { Injectable, signal } from '@angular/core';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    handler: () => void;
  };
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  public notifications = signal<Notification[]>([]);

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Afficher une notification de succès
   */
  showSuccess(message: string, title?: string, duration = 5000): void {
    this.addNotification({
      type: 'success',
      title,
      message,
      duration
    });
  }

  /**
   * Afficher une notification d'erreur
   */
  showError(message: string, title?: string, duration = 7000): void {
    this.addNotification({
      type: 'error',
      title,
      message,
      duration
    });
  }

  /**
   * Afficher une notification d'avertissement
   */
  showWarning(message: string, title?: string, duration = 6000): void {
    this.addNotification({
      type: 'warning',
      title,
      message,
      duration
    });
  }

  /**
   * Afficher une notification d'information
   */
  showInfo(message: string, title?: string, duration = 5000): void {
    this.addNotification({
      type: 'info',
      title,
      message,
      duration
    });
  }

  /**
   * Ajouter une notification personnalisée
   */
  addNotification(notification: Omit<Notification, 'id'>): void {
    const newNotification: Notification = {
      ...notification,
      id: this.generateId()
    };

    this.notifications.update(notifications => [...notifications, newNotification]);

    // Auto-supprimer après la durée spécifiée
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        this.removeNotification(newNotification.id);
      }, newNotification.duration);
    }
  }

  /**
   * Supprimer une notification
   */
  removeNotification(id: string): void {
    this.notifications.update(notifications =>
      notifications.filter(n => n.id !== id)
    );
  }

  /**
   * Supprimer toutes les notifications
   */
  clearAll(): void {
    this.notifications.set([]);
  }
}