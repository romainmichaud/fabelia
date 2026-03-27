'use client'

import { useEffect, useState, useCallback } from 'react'
import { ScrollText, ChevronLeft, ChevronRight } from 'lucide-react'

type AdminLog = {
  id:          string
  action:      string
  resource:    string
  resource_id: string | null
  after_state: Record<string, unknown> | null
  ip_address:  string | null
  created_at:  string
  profiles:    { email: string; full_name: string } | null
}

const ACTION_COLORS: Record<string, string> = {
  update_order_status:        'bg-blue-500/10 text-blue-400',
  activate_prompt_version:    'bg-amber-500/10 text-amber-400',
  create_prompt_version:      'bg-purple-500/10 text-purple-400',
  retry_generation:           'bg-yellow-500/10 text-yellow-400',
  regenerate_illustration:    'bg-indigo-500/10 text-indigo-400',
  regenerate_cover:           'bg-indigo-500/10 text-indigo-400',
  resolve_ticket:             'bg-green-500/10 text-green-400',
  content_review_approve:     'bg-green-500/10 text-green-400',
  content_review_reject:      'bg-red-500/10 text-red-400',
}

export default function AdminLogsPage() {
  const [logs, setLogs]       = useState<AdminLog[]>([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [resource, setResource] = useState('')
  const [loading, setLoading]   = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), perPage: '50' })
    if (resource) params.set('resource', resource)

    const res  = await fetch(`/api/admin/logs?${params}`)
    const data = await res.json()

    if (data.success) {
      setLogs(data.data.data)
      setTotal(data.data.total)
    }
    setLoading(false)
  }, [page, resource])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const totalPages = Math.ceil(total / 50)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Logs d&apos;audit</h1>
        <p className="text-sm text-slate-400 mt-1">{total} actions enregistrées</p>
      </div>

      <div className="flex gap-3">
        <select
          value={resource}
          onChange={e => { setResource(e.target.value); setPage(1) }}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
        >
          <option value="">Toutes ressources</option>
          <option value="orders">Commandes</option>
          <option value="book_projects">Projets</option>
          <option value="prompt_versions">Prompts</option>
          <option value="book_pages">Pages</option>
          <option value="support_tickets">Support</option>
          <option value="prompt_scores">Contenu</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-8 text-center">
          <ScrollText size={32} className="text-slate-600 mx-auto mb-2" />
          <p className="text-slate-400">Aucun log trouvé</p>
        </div>
      ) : (
        <div className="space-y-1">
          {logs.map(log => (
            <div key={log.id}
              className="bg-slate-900 rounded-lg border border-slate-800 px-4 py-3 cursor-pointer hover:border-slate-700"
              onClick={() => setExpanded(expanded === log.id ? null : log.id)}
            >
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`px-2 py-0.5 rounded text-xs font-mono font-medium ${ACTION_COLORS[log.action] ?? 'bg-slate-700 text-slate-300'}`}>
                  {log.action}
                </span>
                <span className="text-slate-400 text-xs">{log.resource}</span>
                {log.resource_id && (
                  <span className="text-slate-600 text-xs font-mono">{log.resource_id.slice(0, 8)}…</span>
                )}
                <span className="ml-auto text-slate-500 text-xs">
                  {log.profiles?.full_name ?? log.profiles?.email ?? 'Système'}
                </span>
                <span className="text-slate-600 text-xs">
                  {new Date(log.created_at).toLocaleString('fr-FR', {
                    day: 'numeric', month: 'short',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              </div>

              {expanded === log.id && log.after_state && (
                <pre className="mt-3 text-xs text-slate-400 bg-slate-800 rounded p-3 overflow-x-auto">
                  {JSON.stringify(log.after_state, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}

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
