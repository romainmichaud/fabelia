'use client'

import { useEffect, useState }  from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link                      from 'next/link'
import { createBrowserClient }   from '@supabase/ssr'
import {
  LayoutDashboard, ShoppingCart, BookOpen, Wand2,
  Users, Printer, HeadphonesIcon, ScrollText,
  LogOut, ChevronRight, AlertTriangle, Menu, X,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/admin',              label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/admin/commandes',    label: 'Commandes',     icon: ShoppingCart },
  { href: '/admin/projets',      label: 'Projets',       icon: BookOpen },
  { href: '/admin/prompts',      label: 'Prompts',       icon: Wand2 },
  { href: '/admin/utilisateurs', label: 'Utilisateurs',  icon: Users },
  { href: '/admin/impressions',  label: 'Impressions',   icon: Printer },
  { href: '/admin/support',      label: 'Support',       icon: HeadphonesIcon },
  { href: '/admin/contenu',      label: 'Contenu',       icon: AlertTriangle },
  { href: '/admin/logs',         label: 'Logs',          icon: ScrollText },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.push('/connexion')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (profile?.role !== 'admin') {
        router.push('/ma-bibliotheque')
        return
      }

      setLoading(false)
    })
  }, [router])

  async function handleSignOut() {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    await supabase.auth.signOut()
    router.push('/connexion')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-slate-800 fixed inset-y-0 left-0">
        <div className="px-6 py-5 border-b border-slate-800">
          <span className="text-lg font-bold text-white">Mon Livre Admin</span>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const Icon    = item.icon
            const active  = pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                  active
                    ? 'bg-amber-500/10 text-amber-400 border-r-2 border-amber-400'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                }`}
              >
                <Icon size={16} />
                {item.label}
                {active && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            )
          })}
        </nav>

        <div className="px-6 py-4 border-t border-slate-800">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-400 transition-colors"
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-slate-900 flex flex-col">
            <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
              <span className="text-lg font-bold text-white">Admin</span>
              <button onClick={() => setIsOpen(false)}>
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <nav className="flex-1 py-4">
              {NAV_ITEMS.map(item => {
                const Icon   = item.icon
                const active = pathname === item.href ||
                  (item.href !== '/admin' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-6 py-3 text-sm ${
                      active ? 'text-amber-400' : 'text-slate-400'
                    }`}
                  >
                    <Icon size={16} />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="lg:ml-64 flex-1 flex flex-col min-h-screen">
        <header className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setIsOpen(true)}>
            <Menu size={20} className="text-slate-400" />
          </button>
          <span className="font-semibold text-white">Admin</span>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
