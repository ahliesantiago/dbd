'use client'

import React from 'react'
import { Sidebar } from './sidebar'
import { BottomNavigation } from './bottom-navigation'
import { cn } from '@/lib/utils'

interface AppLayoutProps {
  readonly children: React.ReactNode
  readonly className?: string
}

export function AppLayout({ children, className }: AppLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden pb-16 md:pb-0">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden md:flex" />

      {/* Main Content */}
      <main className={cn("flex-1 overflow-auto", className)}>
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
