import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from '@/components/logout-button'
import { UsersAdmin } from '@/components/users-admin'

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
    <main className="mx-auto max-w-screen-xl px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="/" className="text-zinc-400 hover:text-white transition-colors text-sm">← Dashboard</a>
          <h1 className="text-2xl font-semibold tracking-tight">Gestión de Usuarios</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-500">{p?.display_name}</span>
          <LogoutButton />
        </div>
      </div>
      <UsersAdmin partners={partners ?? []} />
    </main>
  )
}
