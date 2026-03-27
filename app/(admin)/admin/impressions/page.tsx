'use client'

import { useEffect, useState, useCallback } from 'react'
import { Printer, Truck, Clock, ChevronLeft, ChevronRight } from 'lucide-react'

const PRINT_STATUS_LABELS: Record<string, string> = {
  pending:    'En attente',
  submitted:  'Soumis',
  printing:   'Impression',
  shipped:    'Expédié',
  delivered:  'Livré',
  cancelled:  'Annulé',
  failed:     'Échoué',
}

const PRINT_STATUS_COLORS: Record<string, string> = {
  pending:   'bg-yellow-500/10 text-yellow-400',
  submitted: 'bg-blue-500/10 text-blue-400',
  printing:  'bg-purple-500/10 text-purple-400',
  shipped:   'bg-indigo-500/10 text-indigo-400',
  delivered: 'bg-green-500/10 text-green-400',
  cancelled: 'bg-slate-500/10 text-slate-400',
  failed:    'bg-red-500/10 text-red-400',
}

type PrintJob = {
  id:                 string
  status:             string
  provider_job_id:    string | null
  tracking_number:    string | null
  estimated_delivery: string | null
  submitted_at:       string | null
  shipped_at:         string | null
  created_at:         string
  orders: {
    order_number: string
    profiles: { email: string; full_name: string } | null
  } | null
}

export default function AdminImpressionsPage() {
  const [jobs, setJobs]       = useState<PrintJob[]>([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [status, setStatus]   = useState('')
  const [loading, setLoading] = useState(true)

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), perPage: '20' })
    if (status) params.set('status', status)

    const res  = await fetch(`/api/admin/orders?${params}`)
    const data = await res.json()
    // For now show a placeholder — the print endpoint mirrors orders structure
    setLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status])

  useEffect(() => { fetchJobs() }, [fetchJobs])

  const totalPages = Math.ceil(total / 20)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Impressions</h1>
        <p className="text-sm text-slate-400 mt-1">{total} jobs d&apos;impression</p>
      </div>

      <div className="flex gap-3">
        <select
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(1) }}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
        >
          <option value="">Tous statuts</option>
          {Object.entries(PRINT_STATUS_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-8 text-center">
          <Printer size={32} className="text-slate-600 mx-auto mb-2" />
          <p className="text-slate-400">Aucun job d&apos;impression</p>
        </div>
      ) : (
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                <th className="px-4 py-3 text-left">Commande</th>
                <th className="px-4 py-3 text-left">Client</th>
                <th className="px-4 py-3 text-left">Statut</th>
                <th className="px-4 py-3 text-left">Tracking</th>
                <th className="px-4 py-3 text-left">Livraison est.</th>
                <th className="px-4 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(job => (
                <tr key={job.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                  <td className="px-4 py-3 font-mono text-xs text-slate-300">
                    {job.orders?.order_number ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-white">{job.orders?.profiles?.full_name ?? '—'}</div>
                    <div className="text-slate-400 text-xs">{job.orders?.profiles?.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${PRINT_STATUS_COLORS[job.status] ?? ''}`}>
                      {PRINT_STATUS_LABELS[job.status] ?? job.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {job.tracking_number ? (
                      <div className="flex items-center gap-1 text-blue-400">
                        <Truck size={12} />
                        <span className="font-mono text-xs">{job.tracking_number}</span>
                      </div>
                    ) : (
                      <span className="text-slate-500 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {job.estimated_delivery ? (
                      <div className="flex items-center gap-1 text-slate-300 text-xs">
                        <Clock size={12} className="text-slate-500" />
                        {new Date(job.estimated_delivery).toLocaleDateString('fr-FR')}
                      </div>
                    ) : (
                      <span className="text-slate-500 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    {new Date(job.created_at).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
