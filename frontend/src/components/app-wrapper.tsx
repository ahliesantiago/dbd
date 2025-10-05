'use client'

import React from 'react'
import { useUser } from '@/contexts/user-context'
import { NameModal } from '@/components/user/name-modal'
import { AppLayout } from '@/components/layout/app-layout'

interface AppWrapperProps {
  readonly children: React.ReactNode
}

export function AppWrapper({ children }: AppWrapperProps) {
  const { user, isLoading, isFirstTime, createUser } = useUser()

  // Show loading state while checking user status
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show modal for first-time setup (name entry is required)
  if (isFirstTime || !user) {
    return (
      <>
        {/* Backdrop for modal */}
        <div className="min-h-screen bg-background">
          <NameModal
            isOpen={true}
            onClose={() => {}} // Cannot close - name entry is required
            onSubmit={createUser}
          />
        </div>
      </>
    )
  }

  // Show main app layout for existing users
  return (
    <AppLayout>
      {children}
    </AppLayout>
  )
}
