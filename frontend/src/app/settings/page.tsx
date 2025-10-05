'use client'

import React, { useState, useEffect } from 'react'
import { AlertCircle, Palette, Save, User } from 'lucide-react'
import { useUser } from '@/contexts/user-context'
import { ThemeSettings } from '@/components/theme/theme-settings'
import { AppWrapper } from '@/components/app-wrapper'
import { cn } from '@/lib/utils'

export default function SettingsPage() {
  const { user, updateUser, isLoading } = useUser()
  const [displayName, setDisplayName] = useState(user?.name || '')
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Update displayName when user data changes
  useEffect(() => {
    setDisplayName(user?.name || '')
  }, [user?.name])

  const handleSave = async () => {
    if (!displayName.trim()) {
      setError('Name cannot be empty')
      return
    }

    try {
      setIsSaving(true)
      setError(null)
      setSuccessMessage(null)

      // Update the name field with the new display name
      await updateUser({ name: displayName.trim() })

      setIsEditing(false)
      setSuccessMessage('Name updated successfully!')

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update name')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setDisplayName(user?.name || '')
    setIsEditing(false)
    setError(null)
  }

  const handleEdit = () => {
    setIsEditing(true)
    setError(null)
    setSuccessMessage(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <AppWrapper>
      <div className="container mx-auto max-w-2xl p-6 space-y-8">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">
            Manage your personal preferences and account settings.
          </p>
        </div>

        {/* User Profile Section */}
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Profile</h2>
                <p className="text-sm text-muted-foreground">
                  Update your display name and personal information.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="displayName"
                  className="text-sm font-medium text-foreground"
                >
                  Display Name
                </label>
                <div className="flex gap-2">
                  <input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    disabled={!isEditing || isSaving}
                    className={cn(
                      "flex-1 px-3 py-2 text-sm rounded-md border border-border bg-background",
                      "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      "placeholder:text-muted-foreground"
                    )}
                    placeholder="Enter your preferred name"
                  />

                  {!isEditing ? (
                    <button
                      onClick={handleEdit}
                      className={cn(
                        "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                        "bg-primary text-primary-foreground hover:bg-primary/90",
                        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      )}
                    >
                      Edit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className={cn(
                          "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                          "bg-primary text-primary-foreground hover:bg-primary/90",
                          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                          "disabled:opacity-50 disabled:cursor-not-allowed",
                          "flex items-center gap-2"
                        )}
                      >
                        {isSaving ? (
                          <div className="animate-spin h-4 w-4 border-b-2 border-primary-foreground" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={isSaving}
                        className={cn(
                          "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                          "border border-border bg-background hover:bg-accent hover:text-accent-foreground",
                          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                          "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {successMessage && (
                <div className="flex items-center gap-2 p-3 rounded-md bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800">
                  <div className="h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-white"></div>
                  </div>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">{successMessage}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Theme Settings Section */}
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent text-accent-foreground">
              <div className="h-5 w-5 rounded-full bg-gradient-to-br from-primary via-secondary to-accent"></div>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Appearance</h2>
              <p className="text-sm text-muted-foreground">
                Customize how the app looks and feels.
              </p>
            </div>
          </div>

          <div className='flex justify-around gap-4 mb-3'>
            <div className='col-span-1'>
              <ThemeSettings />
            </div>

            <div className='col-span-1'>
              <div className="border border-border rounded-lg px-3 py-2">
                <Palette className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppWrapper>
  )
}
