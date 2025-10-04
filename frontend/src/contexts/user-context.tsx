'use client'

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react'
import type { User, UserCreateInput } from '@shared/types/types'
import { userApi } from '@/lib/api'

interface UserContextType {
  user: Omit<User, 'id' | 'createdAt' | 'updatedAt'> | null
  isLoading: boolean
  error: string | null
  isFirstTime: boolean
  createUser: (userData: UserCreateInput) => Promise<void>
  updateUser: (updates: Partial<UserCreateInput>) => Promise<void>
  checkUserStatus: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

interface UserProviderProps {
  readonly children: React.ReactNode
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<Omit<User, 'id' | 'createdAt' | 'updatedAt'> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFirstTime, setIsFirstTime] = useState(false)

  const checkUserStatus = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await userApi.checkUserExists()

      if (response.exists && response.user) {
        setUser(response.user)
        setIsFirstTime(false)
      } else {
        setUser(null)
        setIsFirstTime(true)
      }
    } catch (err) {
      console.error('Failed to check user status:', err)
      setError(err instanceof Error ? err.message : 'Failed to check user status')
      setIsFirstTime(true) // Assume first time if we can't check
    } finally {
      setIsLoading(false)
    }
  }

  const createUser = async (userData: UserCreateInput) => {
    try {
      setError(null)
      const response = await userApi.createUser(userData)

      if (response.success && response.user) {
        setUser(response.user)
        setIsFirstTime(false)
      } else {
        throw new Error(response.message || 'Failed to create user')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create user'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const updateUser = async (updates: Partial<UserCreateInput>) => {
    try {
      setError(null)
      const response = await userApi.updateUser(updates)

      if (response.success && response.user) {
        setUser(response.user)
      } else {
        throw new Error(response.message || 'Failed to update user')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // Check user status on mount
  useEffect(() => {
    checkUserStatus()
  }, [])

  const value = useMemo((): UserContextType => ({
    user,
    isLoading,
    error,
    isFirstTime,
    createUser,
    updateUser,
    checkUserStatus,
  }), [user, isLoading, error, isFirstTime])

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}
