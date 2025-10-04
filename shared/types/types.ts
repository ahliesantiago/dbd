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

export interface Block {
  id: number;
  title: string;
  type: BlockType;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  startTime?: string;
  endTime?: string;
  status: string | null;
  tags?: string[];
  categories?: string[];
  priority: Priority;
  recurrence: string;
  completionBasis?: string;
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
