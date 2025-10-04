import type { User } from '@shared/types/types';
export type { User, UserCreateInput, AuthResponse, ApiResponse } from '@shared/types/types';

// Backend-specific AuthResponse
export interface BackendAuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

// Extend session data
declare module 'express-session' {
  interface SessionData {
    userId?: number;
    authenticated?: boolean;
  }
}
