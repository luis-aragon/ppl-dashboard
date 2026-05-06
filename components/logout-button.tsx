'use client'

import { logout } from '@/app/login/actions'

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="text-sm text-zinc-400 hover:text-white transition-colors"
      >
        Cerrar sesión
      </button>
    </form>
  )
}
