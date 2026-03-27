'use client'

import { useEffect, useState } from 'react'
import { Plus, CheckCircle, Zap } from 'lucide-react'

type PromptVersion = {
  id:          string
  name:        string
  version:     number
  use_case:    string
  model:       string
  temperature: number
  max_tokens:  number
  is_active:   boolean
  created_at:  string
  profiles:    { full_name: string } | null
}

export default function AdminPromptsPage() {
  const [versions, setVersions] = useState<PromptVersion[]>([])
  const [loading, setLoading]   = useState(true)
  const [activating, setActivating] = useState<string | null>(null)

  async function fetchVersions() {
    setLoading(true)
    const res  = await fetch('/api/admin/prompts')
    const data = await res.json()
    if (data.success) setVersions(data.data)
    setLoading(false)
  }

  useEffect(() => { fetchVersions() }, [])

  async function activate(versionId: string) {
    setActivating(versionId)
    await fetch('/api/admin/prompts', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ versionId, action: 'activate' }),
    })
    await fetchVersions()
    setActivating(null)
  }

  // Group by use_case
  const grouped = versions.reduce<Record<string, PromptVersion[]>>((acc, v) => {
    acc[v.use_case] = acc[v.use_case] ?? []
    acc[v.use_case].push(v)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Versions de Prompts</h1>
          <p className="text-sm text-slate-400 mt-1">{versions.length} versions au total</p>
        </div>
        <button className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
          <Plus size={16} />
          Nouvelle version
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        Object.entries(grouped).map(([useCase, items]) => (
          <section key={useCase}>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <Zap size={12} />
              {useCase}
            </h2>
            <div className="space-y-2">
              {items.map(version => (
                <div
                  key={version.id}
                  className={`bg-slate-900 rounded-xl border p-4 flex items-center justify-between gap-4 ${
                    version.is_active ? 'border-amber-500/40' : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {version.is_active ? (
                      <CheckCircle size={18} className="text-green-400 shrink-0" />
                    ) : (
                      <div className="w-4.5 h-4.5 rounded-full border border-slate-600 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{version.name}</span>
                        <span className="text-xs text-slate-500">v{version.version}</span>
                        {version.is_active && (
                          <span className="px-1.5 py-0.5 rounded text-xs bg-green-500/10 text-green-400">Actif</span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {version.model} · T={version.temperature} · {version.max_tokens} tokens
                        {version.profiles && ` · par ${version.profiles.full_name}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">
                      {new Date(version.created_at).toLocaleDateString('fr-FR')}
                    </span>
                    {!version.is_active && (
                      <button
                        onClick={() => activate(version.id)}
                        disabled={activating === version.id}
                        className="text-xs text-amber-400 hover:text-amber-300 font-medium disabled:opacity-40"
                      >
                        {activating === version.id ? 'Activation...' : 'Activer'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  )
}
