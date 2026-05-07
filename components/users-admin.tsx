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

const EMPTY_FORM = {
  email: '', password: '', display_name: '',
  role: 'supplier' as 'admin' | 'supplier', partner_id: '',
}

const inputCls =
  'block w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 transition-colors'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-zinc-400">{label}</label>
      {children}
    </div>
  )
}

export function UsersAdmin({ partners }: Props) {
  const [users,    setUsers]    = useState<DashboardUser[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editUser, setEditUser] = useState<DashboardUser | null>(null)
  const [form,     setForm]     = useState(EMPTY_FORM)
  const [saving,   setSaving]   = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  async function fetchUsers() {
    setLoading(true)
    const res  = await fetch('/api/admin/users')
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

    const url    = editUser ? `/api/admin/users/${editUser.id}` : '/api/admin/users'
    const method = editUser ? 'PATCH' : 'POST'
    const body   = editUser
      ? { display_name: form.display_name, role: form.role, partner_id: form.partner_id || null, ...(form.password ? { password: form.password } : {}) }
      : { email: form.email, password: form.password, display_name: form.display_name, role: form.role, partner_id: form.partner_id || null }

    const res  = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const json = await res.json()

    if (json.error) setError(json.error)
    else { setShowForm(false); fetchUsers() }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este usuario? Esta acción no se puede deshacer.')) return
    setDeleteId(id)
    const res  = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    const json = await res.json()
    if (json.error) setError(json.error)
    else fetchUsers()
    setDeleteId(null)
  }

  return (
    <div className="space-y-5">
      {error && (
        <div className="flex items-center justify-between rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-4 text-red-400/60 hover:text-red-400 transition-colors">✕</button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-zinc-400">
            {loading ? 'Cargando…' : `${users.length} usuario${users.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
        >
          + Nuevo usuario
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">
                {editUser ? 'Editar usuario' : 'Nuevo usuario'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="rounded-md p-1 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!editUser && (
                <Field label="Email">
                  <input type="email" required value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className={inputCls} placeholder="usuario@empresa.com" />
                </Field>
              )}
              <Field label={editUser ? 'Nueva contraseña (vacío = sin cambios)' : 'Contraseña'}>
                <input type="password" required={!editUser} value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className={inputCls} />
              </Field>
              <Field label="Nombre">
                <input type="text" required value={form.display_name}
                  onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
                  className={inputCls} placeholder="Nombre Apellido" />
              </Field>
              <Field label="Rol">
                <select value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as 'admin' | 'supplier' }))}
                  className={inputCls}>
                  <option value="admin">Admin</option>
                  <option value="supplier">Supplier</option>
                </select>
              </Field>
              {form.role === 'supplier' && (
                <Field label="Supplier vinculado">
                  <select value={form.partner_id}
                    onChange={(e) => setForm((f) => ({ ...f, partner_id: e.target.value }))}
                    className={inputCls}>
                    <option value="">— Seleccionar —</option>
                    {partners.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </Field>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-lg bg-emerald-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
                >
                  {saving ? 'Guardando…' : 'Guardar'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 py-2.5 text-sm text-zinc-200 transition-colors hover:bg-zinc-700"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">Rol</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">Supplier</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">Creado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-zinc-600">Cargando…</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-zinc-600">Sin usuarios</td></tr>
            ) : users.map((u) => (
              <tr key={u.id} className="border-b border-zinc-800/50 transition-colors hover:bg-zinc-800/30">
                <td className="px-4 py-3 font-medium text-zinc-100">{u.display_name}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    u.role === 'admin'
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-blue-500/15 text-blue-400'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-400">{u.partners?.name ?? '—'}</td>
                <td className="px-4 py-3 text-zinc-500">
                  {new Date(u.created_at).toLocaleDateString('es-AR')}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEdit(u)}
                      className="rounded-md border border-zinc-700 px-2.5 py-1 text-xs text-zinc-400 transition-colors hover:border-zinc-500 hover:text-white"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      disabled={deleteId === u.id}
                      className="rounded-md border border-red-900/60 px-2.5 py-1 text-xs text-red-400 transition-colors hover:border-red-700 hover:text-red-300 disabled:opacity-50"
                    >
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
