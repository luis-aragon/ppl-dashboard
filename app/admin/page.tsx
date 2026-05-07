import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from '@/components/logout-button'
import { UsersAdmin } from '@/components/users-admin'
import Image from 'next/image'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.rpc('fn_my_profile')
  const p = profile as any

  if (p?.role !== 'admin') redirect('/')

  const { data: partners } = await supabase
    .from('partners')
    .select('id, name')
    .eq('partner_type', 'supplier')
    .eq('status', 'active')
    .order('name')

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-2 text-zinc-400 transition-colors hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6"/>
              </svg>
              <span className="text-sm">Dashboard</span>
            </a>
            <span className="text-zinc-700">|</span>
            <div className="flex items-center gap-2.5">
              <Image src="/rp-logo.png" alt="RP Solutions" width={24} height={24} className="h-6 w-auto" />
              <h1 className="text-sm font-semibold tracking-tight">Gestión de Usuarios</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-500">{p?.display_name}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-screen-xl px-4 py-8">
        <UsersAdmin partners={partners ?? []} />
      </main>
    </div>
  )
}
