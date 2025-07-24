// ===== src/app/core/models/notification.model.ts =====
export interface NotificationData {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title?: string;
    message: string;
    duration?: number;
    action?: {
        label: string;
        handler: () => void;
    };
    timestamp?: Date;
}