'use client'

import { useEffect, useState, useCallback } from 'react'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import type { OrderStatus } from '@/types'

const STATUS_LABELS: Record<string, string> = {
  pending:    'En attente',
  paid:       'Payé',
  processing: 'En cours',
  completed:  'Terminé',
  cancelled:  'Annulé',
  refunded:   'Remboursé',
}

const STATUS_COLORS: Record<string, string> = {
  pending:    'bg-yellow-500/10 text-yellow-400',
  paid:       'bg-blue-500/10 text-blue-400',
  processing: 'bg-purple-500/10 text-purple-400',
  completed:  'bg-green-500/10 text-green-400',
  cancelled:  'bg-slate-500/10 text-slate-400',
  refunded:   'bg-red-500/10 text-red-400',
}

type Order = {
  id:           string
  order_number: string
  status:       OrderStatus
  product_type: string
  total_amount: number
  currency:     string
  created_at:   string
  profiles:     { email: string; full_name: string } | null
  book_projects: { title: string; generation_status: string } | null
}

export default function AdminCommandesPage() {
  const [orders, setOrders]   = useState<Order[]>([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [search, setSearch]   = useState('')
  const [status, setStatus]   = useState('')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), perPage: '20' })
    if (search) params.set('search', search)
    if (status) params.set('status', status)

    const res  = await fetch(`/api/admin/orders?${params}`)
    const data = await res.json()

    if (data.success) {
      setOrders(data.data.data)
      setTotal(data.data.total)
    }
    setLoading(false)
  }, [page, search, status])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  async function updateStatus(orderId: string, newStatus: OrderStatus) {
    setUpdating(orderId)
    await fetch('/api/admin/orders', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ orderId, status: newStatus }),
    })
    await fetchOrders()
    setUpdating(null)
  }

  const totalPages = Math.ceil(total / 20)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Commandes</h1>
        <p className="text-sm text-slate-400 mt-1">{total} commandes au total</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Numéro de commande..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        <select
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(1) }}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
        >
          <option value="">Tous statuts</option>
          {Object.entries(STATUS_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                <th className="px-4 py-3 text-left">Commande</th>
                <th className="px-4 py-3 text-left">Client</th>
                <th className="px-4 py-3 text-left">Produit</th>
                <th className="px-4 py-3 text-left">Montant</th>
                <th className="px-4 py-3 text-left">Statut</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    Chargement...
                  </td>
                </tr>
              ) : orders.map(order => (
                <tr key={order.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                  <td className="px-4 py-3 font-mono text-xs text-slate-300">{order.order_number}</td>
                  <td className="px-4 py-3">
                    <div className="text-white">{order.profiles?.full_name ?? '—'}</div>
                    <div className="text-slate-400 text-xs">{order.profiles?.email}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{order.product_type}</td>
                  <td className="px-4 py-3 text-white font-medium">
                    {(order.total_amount / 100).toFixed(2)} {order.currency?.toUpperCase()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] ?? ''}`}>
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    {new Date(order.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      onChange={e => updateStatus(order.id, e.target.value as OrderStatus)}
                      disabled={updating === order.id}
                      className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none"
                    >
                      {Object.entries(STATUS_LABELS).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">
            Page {page} / {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg bg-slate-800 text-slate-400 disabled:opacity-40 hover:text-white"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg bg-slate-800 text-slate-400 disabled:opacity-40 hover:text-white"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
