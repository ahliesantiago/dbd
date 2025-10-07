import type { User, UserCreateInput, AuthResponse, Block, BlockCreateInput, ApiResponse } from '@shared/types/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: Response
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Include cookies for session management
    ...options,
  }

  try {
    const response = await fetch(url, config)

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`

      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch {
        // If response isn't JSON, use status text
        errorMessage = response.statusText || errorMessage
      }

      throw new ApiError(errorMessage, response.status, response)
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      return {} as T
    }

    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    // Network or other errors
    const errorMessage = error instanceof Error ? error.message : 'Network error'

    // Provide helpful error context for development
    if (errorMessage.includes('Failed to fetch')) {
      console.warn('🔧 Backend connection failed. Make sure the backend is running on', API_BASE_URL)
      throw new ApiError(
        'Backend server not available. Please check if the backend is running.',
        0
      )
    }

    throw new ApiError(errorMessage, 0)
  }
}

export const userApi = {
  // Check if any user exists (for first-time setup detection)
  async checkUserExists(): Promise<{ exists: boolean; user?: Omit<User, 'id' | 'createdAt' | 'updatedAt'> }> {
    return apiRequest('/api/auth/user/exists')
  },

  // Create a new user (first-time setup)
  async createUser(userData: UserCreateInput): Promise<AuthResponse> {
    return apiRequest('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  },

  // Get current user information
  async getCurrentUser(): Promise<{ user?: Omit<User, 'id' | 'createdAt' | 'updatedAt'> }> {
    return apiRequest('/api/auth/me')
  },

  // Update user information
  async updateUser(updates: Partial<UserCreateInput>): Promise<AuthResponse> {
    return apiRequest('/api/auth/update', {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  },

  // Authenticate user (if authentication is enabled)
  async authenticate(email: string, password: string): Promise<AuthResponse> {
    return apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },

  // Logout user
  async logout(): Promise<void> {
    return apiRequest('/api/auth/logout', {
      method: 'POST',
    })
  },
}

export const blocksApi = {
  // Get all blocks for the current user
  async getBlocks(limit = 50, offset = 0): Promise<ApiResponse<Block[]>> {
    return apiRequest(`/api/blocks?limit=${limit}&offset=${offset}`)
  },

  // Get blocks by date range
  async getBlocksByDateRange(startDate: Date, endDate: Date): Promise<ApiResponse<Block[]>> {
    const start = startDate.toISOString().split('T')[0]
    const end = endDate.toISOString().split('T')[0]
    return apiRequest(`/api/blocks/date-range?startDate=${start}&endDate=${end}`)
  },

  // Get a specific block by ID
  async getBlock(id: number): Promise<ApiResponse<Block>> {
    return apiRequest(`/api/blocks/${id}`)
  },

  // Create a new block
  async createBlock(blockData: BlockCreateInput): Promise<ApiResponse<Block>> {
    return apiRequest('/api/blocks', {
      method: 'POST',
      body: JSON.stringify(blockData),
    })
  },

  // Update a block
  async updateBlock(id: number, updates: Partial<BlockCreateInput & { status: any }>): Promise<ApiResponse<Block>> {
    return apiRequest(`/api/blocks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  },

  // Delete a block
  async deleteBlock(id: number): Promise<ApiResponse<void>> {
    return apiRequest(`/api/blocks/${id}`, {
      method: 'DELETE',
    })
  },
}
