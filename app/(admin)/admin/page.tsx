'use client'

import { useEffect, useState } from 'react'
import {
  ShoppingCart, BookOpen, Printer, HeadphonesIcon,
  TrendingUp, AlertTriangle, CheckCircle, Clock,
} from 'lucide-react'
import type { DashboardStats } from '@/services/adminService'

function StatCard({
  label, value, sub, icon: Icon, color,
}: {
  label: string
  value: string | number
  sub?:  string
  icon:  React.ElementType
  color: string
}) {
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
        </div>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const [stats, setStats]     = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(r => r.json())
      .then(d => { if (d.success) setStats(d.data) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!stats) return <p className="text-red-400">Erreur de chargement.</p>

  const revenue      = (stats.orders.revenue / 100).toFixed(2)
  const revenueToday = (stats.orders.revenueToday / 100).toFixed(2)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">Vue globale de la plateforme</p>
      </div>

      {/* Orders */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Commandes</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total commandes"   value={stats.orders.total}  icon={ShoppingCart}  color="bg-blue-500/10 text-blue-400" />
          <StatCard label="Aujourd'hui"        value={stats.orders.today}  icon={TrendingUp}    color="bg-green-500/10 text-green-400" />
          <StatCard label="Revenus total"      value={`${revenue} €`}      icon={TrendingUp}    color="bg-amber-500/10 text-amber-400" />
          <StatCard label="Revenus aujourd'hui" value={`${revenueToday} €`} icon={TrendingUp}   color="bg-amber-500/10 text-amber-400" sub={`${stats.orders.today} commandes`} />
        </div>
      </section>

      {/* Generation */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Génération</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total projets"  value={stats.generation.total}     icon={BookOpen}       color="bg-purple-500/10 text-purple-400" />
          <StatCard label="Complétés"      value={stats.generation.completed} icon={CheckCircle}    color="bg-green-500/10 text-green-400" />
          <StatCard label="En cours"       value={stats.generation.queued}    icon={Clock}          color="bg-yellow-500/10 text-yellow-400" />
          <StatCard label="Échoués"        value={stats.generation.failed}    icon={AlertTriangle}  color="bg-red-500/10 text-red-400" />
        </div>
      </section>

      {/* Print */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Impressions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard label="Total jobs"  value={stats.print.total}     icon={Printer}  color="bg-indigo-500/10 text-indigo-400" />
          <StatCard label="Soumis"      value={stats.print.submitted} icon={Clock}    color="bg-yellow-500/10 text-yellow-400" />
          <StatCard label="Expédiés"    value={stats.print.shipped}   icon={CheckCircle} color="bg-green-500/10 text-green-400" />
        </div>
      </section>

      {/* Support & Prompts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-slate-900 rounded-xl border border-slate-800 p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <HeadphonesIcon size={16} className="text-slate-400" />
            Support
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Tickets ouverts</span>
              <span className="text-white font-medium">{stats.support.open}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Urgents</span>
              <span className={stats.support.urgent > 0 ? 'text-red-400 font-medium' : 'text-white font-medium'}>
                {stats.support.urgent}
              </span>
            </div>
          </div>
        </section>

        <section className="bg-slate-900 rounded-xl border border-slate-800 p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-slate-400" />
            Qualité des prompts
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Score moyen</span>
              <span className="text-white font-medium">{stats.prompts.avgScore}/10</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Contenus signalés</span>
              <span className={stats.prompts.flagged > 0 ? 'text-orange-400 font-medium' : 'text-white font-medium'}>
                {stats.prompts.flagged}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
