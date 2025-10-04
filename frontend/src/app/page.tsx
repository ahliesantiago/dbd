import { AppLayout } from '@/components/layout'

export default function Home() {
  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="border-b border-border bg-card px-6 py-4">
          <h1 className="text-2xl font-bold text-foreground">Daily Overview</h1>
        </div>

        <div className='border-border rounded-lg bg-card mx-6 my-4 border p-6'>
          <h3 className="font-semibold text-card-foreground">Welcome back!</h3>
          <p className="text-muted-foreground">Here&apos;s a quick glance at your day.</p>
        </div>
      </div>
    </AppLayout>
  )
}
