import Link from 'next/link'
import { AppLayout } from '@/components/layout'

export default function NotFound() {
  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">404</h1>
          <p className="text-muted-foreground mb-6">Page not found</p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </AppLayout>
  )
}
