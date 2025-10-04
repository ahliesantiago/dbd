'use client'

import { createContext, useContext, useEffect, useState, useMemo } from 'react'

type Theme = 'dark' | 'light' | 'system'

type ThemeProviderProps = {
  readonly children: React.ReactNode
  readonly defaultTheme?: Theme
  readonly storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'dark' | 'light'
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
  resolvedTheme: 'light',
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

function getSystemTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolveTheme(theme: Theme): 'dark' | 'light' {
  return theme === 'system' ? getSystemTheme() : theme
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'dbd-ui-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  const [mounted, setMounted] = useState(false)

  // Get the resolved theme, ensuring consistent SSR/client rendering
  const resolvedTheme = useMemo(() => {
    if (!mounted) {
      // During SSR, always return light to match the CSS default
      return 'light'
    }
    return resolveTheme(theme)
  }, [theme, mounted])

  // Initialize after mounting to avoid hydration issues
  useEffect(() => {
    setMounted(true)

    // Get theme from localStorage
    try {
      const stored = localStorage.getItem(storageKey) as Theme
      if (stored) {
        setTheme(stored)
      }
    } catch {
      // Handle localStorage errors gracefully
    }
  }, [storageKey])

  // Apply theme classes after mounting (CSS @media handles initial system preference)
  useEffect(() => {
    if (!mounted) return

    const html = document.documentElement
    const actualTheme = resolveTheme(theme)

    // Only add explicit theme classes when user has made a choice
    // This allows CSS @media to handle system preference naturally
    if (theme === 'system') {
      // Remove explicit theme classes to let CSS @media take over
      html.classList.remove('light', 'dark')
    } else {
      // Apply explicit user choice
      html.classList.remove('light', 'dark')
      html.classList.add(actualTheme)
    }

    html.style.colorScheme = actualTheme
  }, [theme, mounted])

  // Listen for system theme changes when using system theme
  useEffect(() => {
    if (!mounted || theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      // When on system theme, let CSS handle the colors but update colorScheme
      const html = document.documentElement
      const newTheme = mediaQuery.matches ? 'dark' : 'light'
      html.style.colorScheme = newTheme
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme, mounted])

  const updateTheme = useMemo(() => (newTheme: Theme) => {
    try {
      localStorage.setItem(storageKey, newTheme)
    } catch {
      // Handle localStorage errors gracefully
    }
    setTheme(newTheme)
  }, [storageKey])

  const value = useMemo(() => ({
    theme,
    resolvedTheme,
    setTheme: updateTheme,
  }), [theme, resolvedTheme, updateTheme])

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')

  return context
}
