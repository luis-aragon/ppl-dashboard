import { Suspense } from 'react'
import { DashboardClient } from '@/components/dashboard-client'

export default function Home() {
  return (
    <main className="mx-auto max-w-screen-2xl px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">PPL Dashboard</h1>
      </div>
      <Suspense>
        <DashboardClient />
      </Suspense>
    </main>
  )
}
