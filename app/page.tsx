import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { DashboardClient } from '@/components/dashboard-client'
import { LogoutButton } from '@/components/logout-button'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.rpc('fn_my_profile')
  const p = profile as any

  return (
    <main className="mx-auto max-w-screen-2xl px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">PPL Dashboard</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-500">
            {p?.display_name ?? user.email}
            {p?.role === 'admin' && (
              <span className="ml-2 text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">Admin</span>
            )}
          </span>
          {p?.role === 'admin' && (
            <a href="/admin" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Usuarios
            </a>
          )}
          <LogoutButton />
        </div>
      </div>
      <Suspense>
        <DashboardClient />
      </Suspense>
    </main>
  )
}
