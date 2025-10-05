'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import type { UserCreateInput } from '@shared/types/types'

interface NameModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly onSubmit: (userData: UserCreateInput) => Promise<void>
}

export function NameModal({ isOpen, onClose, onSubmit }: NameModalProps) {
  const [displayName, setDisplayName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!displayName.trim()) {
      setError('Please enter what you\'d like to be called')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await onSubmit({
        name: displayName.trim()
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save user information')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop - cannot be dismissed since entry is required */}
      <div
        className="absolute inset-0 bg-black/50"
        aria-label="Modal backdrop"
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-lg bg-card border border-border p-6 shadow-lg">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-foreground">Welcome to DBD</h2>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-6">
          What would you like to be called in the app?
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Display Name Input */}
          <div>
            <label htmlFor="displayName" className="text-sm font-medium text-foreground block mb-2">
              What should we call you? *
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your name or preferred alias"
              className={cn(
                "w-full px-3 py-2 rounded-md border border-border bg-background",
                "text-foreground placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
              disabled={isLoading}
              required
              autoFocus
            />
            <p className="text-xs text-muted-foreground mt-2">
              This can be your real name, a nickname, or whatever you prefer!
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !displayName.trim()}
            className={cn(
              "w-full py-2 px-4 rounded-md font-medium text-sm",
              "bg-primary text-primary-foreground",
              "hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "transition-colors"
            )}
          >
            {isLoading ? 'Saving...' : 'Get Started'}
          </button>
        </form>
      </div>
    </div>
  )
}
