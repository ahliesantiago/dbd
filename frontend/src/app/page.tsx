'use client'

import { AppWrapper } from '@/components/app-wrapper'
import { useUser } from '@/contexts/user-context'

export default function HomePage() {
  const { user } = useUser()

  const getGreeting = () => {
    if (!user) return 'Welcome!'
    const displayName = user.alias || user.name
    return `Welcome back, ${displayName}!`
  }

  return (
    <AppWrapper>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="border-b border-border bg-card px-6 py-4">
          <h1 className="text-2xl font-bold text-foreground">
            {getGreeting()}
          </h1>
        </div>

        <div className='border-border rounded-lg bg-card mx-6 my-4 border p-6'>
          <h3 className="font-semibold text-card-foreground">Daily Overview</h3>
          <p className="text-muted-foreground">Here&apos;s a quick glance at your day.</p>
        </div>
      </div>
    </AppWrapper>
  )
}
