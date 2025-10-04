'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Calendar,
  BookOpen,
  Settings,
  Blocks,
  NotebookPen
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '../theme'

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/',
    icon: Home,
    description: 'Overview of your day'
  },
  {
    name: 'Today',
    href: '/today',
    icon: Calendar,
    description: 'Today\'s schedule'
  },
  {
    name: 'Planning',
    href: '/planning',
    icon: NotebookPen,
    description: 'Plan your days'
  },
  {
    name: 'Blocks',
    href: '/blocks',
    icon: Blocks,
    description: 'Manage tasks and events'
  },
  {
    name: 'Calendar',
    href: '/calendar',
    icon: Calendar,
    description: 'Calendar view'
  },
  {
    name: 'Journal',
    href: '/journal',
    icon: BookOpen,
    description: 'Journal entries'
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'App preferences'
  },
]

interface SidebarProps {
  readonly className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className={cn(
      "flex h-full w-64 flex-col border-r border-border bg-card",
      className
    )}>
      <div className="flex h-16 items-center border-b border-border px-6">
        <h1 className="text-xl font-bold text-foreground">DBD</h1>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Theme Toggle */}
      <div className="border-t border-border p-4">
        <ThemeToggle />
      </div>
    </div>
  )
}
