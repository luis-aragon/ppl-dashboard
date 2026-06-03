import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { DashboardClient } from '@/components/dashboard-client'
import { LogoutButton } from '@/components/logout-button'
import Image from 'next/image'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.rpc('fn_my_profile')
  const p = profile as any

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Image src="/rp-logo.png" alt="RP Solutions" width={28} height={28} className="h-7 w-auto" />
            <span className="text-sm font-semibold text-zinc-900 tracking-tight">PPL Dashboard</span>
          </div>
          <nav className="flex items-center gap-4">
            <span className="text-sm text-zinc-500">
              {p?.display_name ?? user.email}
              {p?.role === 'admin' && (
                <span className="ml-2 inline-flex items-center rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-600">
                  Admin
                </span>
              )}
            </span>
            {p?.role === 'admin' && (
              <a href="/admin" className="text-sm text-zinc-500 transition-colors hover:text-zinc-900">
                Users
              </a>
            )}
            <LogoutButton />
          </nav>
        </div>
      </header>
      {/* Main */}
      <main className="mx-auto max-w-screen-2xl px-4 py-6">
        <Suspense>
          <DashboardClient />
        </Suspense>
      </main>
    </div>
  )
}
