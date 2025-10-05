export interface AuthResponse {
  success: boolean;
  user?: Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
  token?: string;
  message?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// User types
export interface User {
  id: number;
  name: string;
  email?: string;
  hasAuthentication: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCreateInput {
  name: string;
  email?: string;
  password?: string;
}

export type BlockType = 'Tasks' | 'Habits' | 'Events' | 'Appointments';

export type Priority = 'High' | 'Medium' | 'Low' | 'None';

export type RecurrenceType = 'one-time' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'occasional' | 'frequent';

export type BlockStatus = 'completed' | 'skipped' | 'postponed' | 'cancelled' | null;

export interface CompletionBasis {
  unit: 'simple' | 'count' | 'duration' | 'distance' | 'percent';
  goal?: number;
  goalUnit?: string; // e.g., 'minutes', 'km', '%'
}

export interface BlockCreateInput {
  title: string;
  type: BlockType;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  startTime?: string;
  endTime?: string;
  tags?: string[];
  categories?: string[];
  priority: Priority;
  recurrence?: RecurrenceType;
  completionBasis?: CompletionBasis;
}

export interface Block extends BlockCreateInput {
  id: number;
  status: BlockStatus;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tag {
  id: number;
  name: string;
  userId: number;
}

export interface Category {
  id: number;
  name: string;
  userId: number;
}
