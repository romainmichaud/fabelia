'use client'

import { useEffect, useState, useCallback } from 'react'
import { RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'

const GEN_STATUS_LABELS: Record<string, string> = {
  queued:             'En attente',
  generating_text:    'Texte...',
  generating_images:  'Images...',
  assembling:         'Assemblage...',
  completed:          'Terminé',
  failed:             'Échoué',
}

const GEN_STATUS_COLORS: Record<string, string> = {
  queued:             'bg-yellow-500/10 text-yellow-400',
  generating_text:    'bg-blue-500/10 text-blue-400',
  generating_images:  'bg-purple-500/10 text-purple-400',
  assembling:         'bg-indigo-500/10 text-indigo-400',
  completed:          'bg-green-500/10 text-green-400',
  failed:             'bg-red-500/10 text-red-400',
}

type Project = {
  id:                string
  title:             string | null
  theme:             string
  generation_status: string | null
  is_preview_ready:  boolean
  is_book_ready:     boolean
  created_at:        string
  profiles:          { email: string; full_name: string } | null
}

export default function AdminProjetsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [status, setStatus]     = useState('')
  const [loading, setLoading]   = useState(true)
  const [retrying, setRetrying] = useState<string | null>(null)

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), perPage: '20' })
    if (status) params.set('status', status)

    const res  = await fetch(`/api/admin/projects?${params}`)
    const data = await res.json()

    if (data.success) {
      setProjects(data.data.data)
      setTotal(data.data.total)
    }
    setLoading(false)
  }, [page, status])

  useEffect(() => { fetchProjects() }, [fetchProjects])

  async function retryGeneration(projectId: string) {
    setRetrying(projectId)
    await fetch('/api/admin/regenerate', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ action: 'retry_generation', projectId }),
    })
    await fetchProjects()
    setRetrying(null)
  }

  const totalPages = Math.ceil(total / 20)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Projets</h1>
        <p className="text-sm text-slate-400 mt-1">{total} projets au total</p>
      </div>

      <div className="flex gap-3">
        <select
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(1) }}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
        >
          <option value="">Tous statuts</option>
          {Object.entries(GEN_STATUS_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                <th className="px-4 py-3 text-left">Projet</th>
                <th className="px-4 py-3 text-left">Client</th>
                <th className="px-4 py-3 text-left">Thème</th>
                <th className="px-4 py-3 text-left">Génération</th>
                <th className="px-4 py-3 text-left">État</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">Chargement...</td>
                </tr>
              ) : projects.map(project => (
                <tr key={project.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                  <td className="px-4 py-3">
                    <div className="text-white">{project.title ?? 'Sans titre'}</div>
                    <div className="text-slate-500 text-xs font-mono">{project.id.slice(0, 8)}…</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-white">{project.profiles?.full_name ?? '—'}</div>
                    <div className="text-slate-400 text-xs">{project.profiles?.email}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{project.theme}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${GEN_STATUS_COLORS[project.generation_status ?? ''] ?? 'bg-slate-500/10 text-slate-400'}`}>
                      {GEN_STATUS_LABELS[project.generation_status ?? ''] ?? project.generation_status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {project.is_preview_ready && (
                        <span className="px-1.5 py-0.5 rounded text-xs bg-green-500/10 text-green-400">Preview</span>
                      )}
                      {project.is_book_ready && (
                        <span className="px-1.5 py-0.5 rounded text-xs bg-blue-500/10 text-blue-400">Livre</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    {new Date(project.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3">
                    {project.generation_status === 'failed' && (
                      <button
                        onClick={() => retryGeneration(project.id)}
                        disabled={retrying === project.id}
                        className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 disabled:opacity-40"
                      >
                        <RefreshCw size={12} className={retrying === project.id ? 'animate-spin' : ''} />
                        Relancer
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
