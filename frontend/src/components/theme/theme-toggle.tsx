'use client'

import React from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from './theme-provider'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  readonly className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()

  const themes = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
  ] as const

  return (
    <div className={cn('flex items-center gap-1 rounded-lg border border-border p-1', className)}>
      {themes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={cn(
            'flex items-center justify-center rounded px-2 py-1 text-xs transition-colors',
            'hover:bg-accent hover:text-accent-foreground',
            theme === value
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground'
          )}
          title={`Switch to ${label} theme`}
        >
          <Icon className="h-3 w-3" />
          <span className="ml-1 hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  )
}
