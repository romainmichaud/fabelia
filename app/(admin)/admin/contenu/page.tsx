'use client'

import { useEffect, useState, useCallback } from 'react'
import { CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react'

type FlaggedScore = {
  id:             string
  score:          number
  dimensions:     Record<string, number>
  status:         string
  flagged_reason: string | null
  created_at:     string
  prompt_sessions: {
    id:               string
    resolved_prompt:  string
    response:         string | null
    project_id:       string
  } | null
}

export default function AdminContenuPage() {
  const [items, setItems]     = useState<FlaggedScore[]>([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [loading, setLoading] = useState(true)
  const [reviewing, setReviewing] = useState<string | null>(null)
  const [expanded, setExpanded]   = useState<string | null>(null)

  const fetchContent = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), perPage: '20' })
    const res    = await fetch(`/api/admin/content?${params}`)
    const data   = await res.json()

    if (data.success) {
      setItems(data.data.data)
      setTotal(data.data.total)
    }
    setLoading(false)
  }, [page])

  useEffect(() => { fetchContent() }, [fetchContent])

  async function review(scoreId: string, decision: 'approve' | 'reject') {
    setReviewing(scoreId)
    await fetch('/api/admin/content', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ scoreId, decision }),
    })
    await fetchContent()
    setReviewing(null)
  }

  const totalPages = Math.ceil(total / 20)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Contenu signalé</h1>
        <p className="text-sm text-slate-400 mt-1">{total} éléments à examiner</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-8 text-center">
          <CheckCircle size={32} className="text-green-400 mx-auto mb-2" />
          <p className="text-slate-300 font-medium">Aucun contenu signalé</p>
          <p className="text-slate-500 text-sm mt-1">Tout est propre !</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="bg-slate-900 rounded-xl border border-red-500/20 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-white font-medium">Score: {item.score}/10</span>
                    {item.flagged_reason && (
                      <span className="text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
                        {item.flagged_reason}
                      </span>
                    )}
                    <span className="text-xs text-slate-500">
                      {new Date(item.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>

                  {/* Score dimensions */}
                  {item.dimensions && (
                    <div className="flex gap-3 mt-2 flex-wrap">
                      {Object.entries(item.dimensions).map(([dim, score]) => (
                        <span key={dim} className={`text-xs px-2 py-0.5 rounded ${
                          (score as number) < 5 ? 'bg-red-500/10 text-red-400' : 'bg-slate-700 text-slate-300'
                        }`}>
                          {dim}: {score}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Expandable prompt */}
                  {item.prompt_sessions && (
                    <button
                      onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                      className="text-xs text-amber-400 hover:text-amber-300 mt-2"
                    >
                      {expanded === item.id ? 'Masquer' : 'Voir le contenu'}
                    </button>
                  )}

                  {expanded === item.id && item.prompt_sessions && (
                    <div className="mt-3 space-y-2">
                      <div className="bg-slate-800 rounded-lg p-3 text-xs text-slate-300 max-h-32 overflow-auto">
                        <span className="text-slate-500 block mb-1">Prompt :</span>
                        {item.prompt_sessions.resolved_prompt}
                      </div>
                      {item.prompt_sessions.response && (
                        <div className="bg-slate-800 rounded-lg p-3 text-xs text-slate-300 max-h-48 overflow-auto">
                          <span className="text-slate-500 block mb-1">Réponse :</span>
                          {item.prompt_sessions.response}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => review(item.id, 'approve')}
                    disabled={reviewing === item.id}
                    className="flex items-center gap-1.5 text-sm text-green-400 hover:text-green-300 font-medium disabled:opacity-40 whitespace-nowrap"
                  >
                    <CheckCircle size={14} />
                    Approuver
                  </button>
                  <button
                    onClick={() => review(item.id, 'reject')}
                    disabled={reviewing === item.id}
                    className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 font-medium disabled:opacity-40 whitespace-nowrap"
                  >
                    <XCircle size={14} />
                    Rejeter
                  </button>
                </div>
              </div>
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
