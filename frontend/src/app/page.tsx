'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Calendar,
  BookOpen,
  Settings,
  Blocks,
  NotebookPen,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { AppWrapper } from '@/components/app-wrapper'
import { useUser } from '@/contexts/user-context'
import { cn } from '@/lib/utils'

// Navigation items for the dashboard grid (excluding Dashboard itself)
const dashboardNavigationItems = [
  {
    name: 'Today',
    href: '/today',
    icon: Calendar,
    description: "Today's schedule and tasks",
    color: 'from-blue-500 to-blue-600'
  },
  {
    name: 'Planning',
    href: '/planning',
    icon: NotebookPen,
    description: 'Plan your days and weeks',
    color: 'from-green-500 to-green-600'
  },
  {
    name: 'Blocks',
    href: '/blocks',
    icon: Blocks,
    description: 'Manage tasks and events',
    color: 'from-purple-500 to-purple-600'
  },
  {
    name: 'Calendar',
    href: '/calendar',
    icon: Calendar,
    description: 'Calendar view of all events',
    color: 'from-orange-500 to-orange-600'
  },
  {
    name: 'Journal',
    href: '/journal',
    icon: BookOpen,
    description: 'Daily thoughts and reflections',
    color: 'from-pink-500 to-pink-600'
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'Customize your experience',
    color: 'from-gray-500 to-gray-600'
  },
]

const dashboardStats = [
  {
    name: "Today's Focus",
    value: 0,
    description: 'tasks pending',
    color: 'text-primary'
  },
  {
    name: 'This Week',
    value: 0,
    description: 'events planned',
    color: 'text-primary'
  },
  {
    name: "Progress Made",
    value: 0,
    description: 'tasks completed',
    color: 'text-secondary'
  },
]

export default function HomePage() {
  const { user } = useUser()
  const [currentStatIndex, setCurrentStatIndex] = useState(0)

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours()
    let timeGreeting = ''

    if (hour < 12) {
      timeGreeting = 'Good morning'
    } else if (hour < 17) {
      timeGreeting = 'Good afternoon'
    } else {
      timeGreeting = 'Good evening'
    }

    if (!user) {
      return `${timeGreeting}!`
    }

    const displayName = user.name
    return `${timeGreeting}, ${displayName}!`
  }

  const getWelcomeMessage = () => {
    const hour = new Date().getHours()

    if (hour < 12) {
      return "Ready to start your day? Here's everything at your fingertips."
    } else if (hour < 17) {
      return "How's your day going? Access all your tools from here."
    } else {
      return "Wrapping up the day? Review and plan from your dashboard."
    }
  }

  const nextStat = () => {
    setCurrentStatIndex((prev) => (prev + 1) % dashboardStats.length)
  }

  const prevStat = () => {
    setCurrentStatIndex((prev) => (prev - 1 + dashboardStats.length) % dashboardStats.length)
  }

  const handleTouchDrag = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    const startX = touch.clientX
    const handleTouchMove = (e: TouchEvent) => {
      const currentX = e.touches[0].clientX
      const diff = startX - currentX
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          nextStat()
        } else {
          prevStat()
        }
        document.removeEventListener('touchmove', handleTouchMove)
        document.removeEventListener('touchend', handleTouchEnd)
      }
    }
    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleTouchEnd)
  }

  return (
    <AppWrapper>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="border-b border-border bg-card px-6 py-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {getTimeBasedGreeting()}
          </h1>
          <p className="text-muted-foreground">
            {getWelcomeMessage()}
          </p>
        </div>

        <div className="flex-1 p-6 space-y-6">
          {/* Quick Stats/Overview */}
          <div className="relative">
            {/* Desktop and tablet grid (sm and up) */}
            <div className="hidden sm:grid grid-cols-3 gap-4">
              {dashboardStats.map((stat) => (
                <div key={stat.name} className="rounded-lg border border-border bg-card p-4">
                  <h3 className="font-semibold text-card-foreground mb-1">{stat.name}</h3>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </div>
              ))}
            </div>

            {/* Mobile carousel (below sm) */}
            <div className="sm:hidden">
              <div className="relative overflow-hidden">
                <div
                  className="flex transition-transform duration-300 ease-in-out touch-pan-x"
                  style={{ transform: `translateX(-${currentStatIndex * 100}%)` }}
                  onTouchStart={handleTouchDrag}
                >
                  {dashboardStats.map((stat, index) => (
                    <div
                      key={stat.name}
                      className="w-full flex-shrink-0 px-2"
                    >
                      <div className="rounded-lg border border-border bg-card p-4">
                        <h3 className="font-semibold text-card-foreground mb-1">{stat.name}</h3>
                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Navigation arrows */}
                <button
                  onClick={prevStat}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 p-2 rounded-full bg-background border border-border shadow-lg hover:bg-accent transition-colors"
                  aria-label="Previous stat"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={nextStat}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 p-2 rounded-full bg-background border border-border shadow-lg hover:bg-accent transition-colors"
                  aria-label="Next stat"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                {/* Dots indicator */}
                <div className="flex justify-center mt-4 space-x-2">
                  {dashboardStats.map((stat, index) => (
                    <button
                      key={`dot-${stat.name}`}
                      onClick={() => setCurrentStatIndex(index)}
                      className={cn(
                        "w-2 h-2 rounded-full transition-colors",
                        index === currentStatIndex ? "bg-primary" : "bg-muted-foreground/30"
                      )}
                      aria-label={`Go to stat ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Grid */}
          <div>
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-6 gap-4">
              {dashboardNavigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "group relative overflow-hidden rounded-lg border border-border bg-card p-6",
                      "transition-all duration-200 hover:shadow-lg hover:scale-105",
                      "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    )}
                  >
                    {/* Background Gradient */}
                    <div className={cn(
                      "absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity",
                      item.color
                    )} />

                    {/* Content */}
                    <div className="relative">
                      <div className="flex items-center justify-between mb-3 lg:hidden">
                        <div className={cn(
                          "flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br",
                          item.color,
                          "text-white shadow-lg"
                        )}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all lg:hidden" />
                      </div>

                      <div className={cn(
                        "hidden lg:flex items-center justify-center mb-3 w-12 h-12 rounded-lg bg-gradient-to-br mx-auto",
                        item.color,
                        "text-white shadow-lg"
                      )}>
                        <Icon className="h-6 w-6" />
                      </div>

                      <h3 className="font-semibold text-card-foreground mb-2 group-hover:text-foreground transition-colors lg:text-center">
                        {item.name}
                      </h3>
                      <p className="text-sm text-muted-foreground lg:hidden">
                        {item.description}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </AppWrapper>
  )
}
