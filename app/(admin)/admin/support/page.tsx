'use client'

import { useEffect, useState, useCallback } from 'react'
import { CheckCircle, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react'

const PRIORITY_COLORS: Record<string, string> = {
  low:    'bg-slate-500/10 text-slate-400',
  normal: 'bg-blue-500/10 text-blue-400',
  high:   'bg-orange-500/10 text-orange-400',
  urgent: 'bg-red-500/10 text-red-400',
}

type Ticket = {
  id:         string
  subject:    string
  status:     string
  priority:   string
  created_at: string
  profiles:   { email: string; full_name: string } | null
  orders:     { order_number: string } | null
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [status, setStatus]   = useState('open')
  const [priority, setPriority] = useState('')
  const [loading, setLoading]   = useState(true)
  const [resolving, setResolving] = useState<string | null>(null)

  const fetchTickets = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), perPage: '20' })
    if (status)   params.set('status', status)
    if (priority) params.set('priority', priority)

    const res  = await fetch(`/api/admin/support?${params}`)
    const data = await res.json()

    if (data.success) {
      setTickets(data.data.data)
      setTotal(data.data.total)
    }
    setLoading(false)
  }, [page, status, priority])

  useEffect(() => { fetchTickets() }, [fetchTickets])

  async function resolveTicket(ticketId: string) {
    setResolving(ticketId)
    await fetch('/api/admin/support', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ ticketId, action: 'resolve' }),
    })
    await fetchTickets()
    setResolving(null)
  }

  const totalPages = Math.ceil(total / 20)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Support</h1>
        <p className="text-sm text-slate-400 mt-1">{total} tickets</p>
      </div>

      <div className="flex gap-3">
        <select
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(1) }}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
        >
          <option value="">Tous</option>
          <option value="open">Ouverts</option>
          <option value="in_progress">En cours</option>
          <option value="resolved">Résolus</option>
        </select>
        <select
          value={priority}
          onChange={e => { setPriority(e.target.value); setPage(1) }}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
        >
          <option value="">Toutes priorités</option>
          <option value="low">Faible</option>
          <option value="normal">Normale</option>
          <option value="high">Haute</option>
          <option value="urgent">Urgente</option>
        </select>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tickets.map(ticket => (
          <div key={ticket.id} className="bg-slate-900 rounded-xl border border-slate-800 p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {ticket.priority === 'urgent' && (
                    <AlertTriangle size={14} className="text-red-400 shrink-0" />
                  )}
                  <span className="text-white font-medium">{ticket.subject}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[ticket.priority] ?? ''}`}>
                    {ticket.priority}
                  </span>
                </div>
                <div className="text-sm text-slate-400 mt-1">
                  {ticket.profiles?.full_name} · {ticket.profiles?.email}
                  {ticket.orders && ` · Commande ${ticket.orders.order_number}`}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {new Date(ticket.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric', month: 'long', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </div>
              </div>
              {ticket.status !== 'resolved' && (
                <button
                  onClick={() => resolveTicket(ticket.id)}
                  disabled={resolving === ticket.id}
                  className="flex items-center gap-1.5 text-sm text-green-400 hover:text-green-300 font-medium disabled:opacity-40 whitespace-nowrap"
                >
                  <CheckCircle size={14} />
                  {resolving === ticket.id ? 'Résolution...' : 'Résoudre'}
                </button>
              )}
            </div>
          </div>
        ))}
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
