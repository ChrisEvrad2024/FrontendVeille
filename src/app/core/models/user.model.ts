// ===== src/app/core/models/user.model.ts =====
export interface User {
    id: number;
    name: string;
    email: string;
    role: 'membre' | 'collecteur' | 'moderateur' | 'admin' | 'superadmin';
    is_email_verified: boolean;
    created_at: string;
    updated_at: string;
}

export interface AuthResponse {
    message: string;
    user: User;
    token: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    role?: string;
}

export interface VerifyEmailRequest {
    token: string;
}

export interface ResendVerificationRequest {
    email: string;
}
