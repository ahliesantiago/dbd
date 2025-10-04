'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Calendar,
  Blocks,
  Settings,
  BookOpen
} from 'lucide-react'
import { cn } from '@/lib/utils'

const mobileNavigationItems = [
  {
    name: 'Home',
    href: '/',
    icon: Home,
  },
  {
    name: 'Blocks',
    href: '/blocks',
    icon: Blocks,
  },
  {
    name: 'Calendar',
    href: '/calendar',
    icon: Calendar,
  },
  {
    name: 'Journal',
    href: '/journal',
    icon: BookOpen,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
]

interface BottomNavigationProps {
  readonly className?: string
}

export function BottomNavigation({ className }: BottomNavigationProps) {
  const pathname = usePathname()

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card md:hidden",
      className
    )}>
      <nav className="flex h-16">
        {mobileNavigationItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 text-xs transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
