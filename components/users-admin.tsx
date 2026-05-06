'use client'

import { useEffect, useState } from 'react'

interface Partner { id: string; name: string }
interface DashboardUser {
  id: string
  display_name: string
  role: 'admin' | 'supplier'
  partner_id: string | null
  created_at: string
  partners?: { name: string } | null
}

interface Props { partners: Partner[] }

const EMPTY_FORM = { email: '', password: '', display_name: '', role: 'supplier' as 'admin' | 'supplier', partner_id: '' }

export function UsersAdmin({ partners }: Props) {
  const [users, setUsers] = useState<DashboardUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editUser, setEditUser] = useState<DashboardUser | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  async function fetchUsers() {
    setLoading(true)
    const res = await fetch('/api/admin/users')
    const json = await res.json()
    if (json.error) setError(json.error)
    else setUsers(json.data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchUsers() }, [])

  function openCreate() {
    setEditUser(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  function openEdit(u: DashboardUser) {
    setEditUser(u)
    setForm({ email: '', password: '', display_name: u.display_name, role: u.role, partner_id: u.partner_id ?? '' })
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const url = editUser ? `/api/admin/users/${editUser.id}` : '/api/admin/users'
    const method = editUser ? 'PATCH' : 'POST'
    const body = editUser
      ? { display_name: form.display_name, role: form.role, partner_id: form.partner_id || null, ...(form.password ? { password: form.password } : {}) }
      : { email: form.email, password: form.password, display_name: form.display_name, role: form.role, partner_id: form.partner_id || null }

    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const json = await res.json()

    if (json.error) setError(json.error)
    else { setShowForm(false); fetchUsers() }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este usuario? Esta acción no se puede deshacer.')) return
    setDeleteId(id)
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    const json = await res.json()
    if (json.error) setError(json.error)
    else fetchUsers()
    setDeleteId(null)
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Cerrar</button>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={openCreate}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm px-4 py-2 rounded-lg transition-colors"
        >
          + Nuevo usuario
        </button>
      </div>

      {/* Modal form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h2 className="text-lg font-semibold">{editUser ? 'Editar usuario' : 'Nuevo usuario'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editUser && (
                <Field label="Email">
                  <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inputCls} />
                </Field>
              )}
              <Field label={editUser ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña'}>
                <input type="password" required={!editUser ? true : false} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className={inputCls} />
              </Field>
              <Field label="Nombre">
                <input type="text" required value={form.display_name} onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))} className={inputCls} />
              </Field>
              <Field label="Rol">
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as 'admin' | 'supplier' }))} className={inputCls}>
                  <option value="admin">Admin</option>
                  <option value="supplier">Supplier</option>
                </select>
              </Field>
              {form.role === 'supplier' && (
                <Field label="Supplier">
                  <select value={form.partner_id} onChange={e => setForm(f => ({ ...f, partner_id: e.target.value }))} className={inputCls}>
                    <option value="">— Seleccionar —</option>
                    {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </Field>
              )}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm py-2 rounded-lg transition-colors">
                  {saving ? 'Guardando…' : 'Guardar'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm py-2 rounded-lg transition-colors">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-400 text-left">
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Rol</th>
              <th className="px-4 py-3 font-medium">Supplier</th>
              <th className="px-4 py-3 font-medium">Creado</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-zinc-500">Cargando…</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-zinc-500">Sin usuarios</td></tr>
            ) : users.map(u => (
              <tr key={u.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                <td className="px-4 py-3 font-medium text-zinc-100">{u.display_name}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-400">{u.partners?.name ?? '—'}</td>
                <td className="px-4 py-3 text-zinc-500">{new Date(u.created_at).toLocaleDateString('es-AR')}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => openEdit(u)} className="text-zinc-400 hover:text-white text-xs px-2 py-1 rounded border border-zinc-700 hover:border-zinc-500 transition-colors">
                      Editar
                    </button>
                    <button onClick={() => handleDelete(u.id)} disabled={deleteId === u.id} className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded border border-red-900 hover:border-red-700 disabled:opacity-50 transition-colors">
                      {deleteId === u.id ? '…' : 'Eliminar'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-zinc-400">{label}</label>
      {children}
    </div>
  )
}

const inputCls = 'block w-full rounded-md bg-zinc-950 border border-zinc-800 py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500'
