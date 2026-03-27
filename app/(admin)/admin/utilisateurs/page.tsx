'use client'

import { useEffect, useState, useCallback } from 'react'
import { Search, ChevronLeft, ChevronRight, Shield, User } from 'lucide-react'

type UserProfile = {
  id:         string
  email:      string
  full_name:  string | null
  role:       string
  locale:     string | null
  created_at: string
}

export default function AdminUtilisateursPage() {
  const [users, setUsers]     = useState<UserProfile[]>([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [search, setSearch]   = useState('')
  const [role, setRole]       = useState('')
  const [loading, setLoading] = useState(true)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), perPage: '20' })
    if (search) params.set('search', search)
    if (role)   params.set('role', role)

    const res  = await fetch(`/api/admin/users?${params}`)
    const data = await res.json()

    if (data.success) {
      setUsers(data.data.data)
      setTotal(data.data.total)
    }
    setLoading(false)
  }, [page, search, role])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const totalPages = Math.ceil(total / 20)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Utilisateurs</h1>
        <p className="text-sm text-slate-400 mt-1">{total} utilisateurs au total</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Nom ou email..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>
        <select
          value={role}
          onChange={e => { setRole(e.target.value); setPage(1) }}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
        >
          <option value="">Tous rôles</option>
          <option value="user">Utilisateur</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
              <th className="px-4 py-3 text-left">Utilisateur</th>
              <th className="px-4 py-3 text-left">Rôle</th>
              <th className="px-4 py-3 text-left">Langue</th>
              <th className="px-4 py-3 text-left">Inscription</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">Chargement...</td>
              </tr>
            ) : users.map(user => (
              <tr key={user.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
                      {user.role === 'admin' ? <Shield size={14} /> : <User size={14} />}
                    </div>
                    <div>
                      <div className="text-white">{user.full_name ?? '—'}</div>
                      <div className="text-slate-400 text-xs">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === 'admin'
                      ? 'bg-amber-500/10 text-amber-400'
                      : 'bg-slate-700 text-slate-300'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-300">{user.locale ?? '—'}</td>
                <td className="px-4 py-3 text-slate-400 text-xs">
                  {new Date(user.created_at).toLocaleDateString('fr-FR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">Page {page} / {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-2 rounded-lg bg-slate-800 text-slate-400 disabled:opacity-40 hover:text-white">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-2 rounded-lg bg-slate-800 text-slate-400 disabled:opacity-40 hover:text-white">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
