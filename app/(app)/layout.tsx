import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  // Redirect to login if not authenticated
  // Uncomment in production:
  // if (!session) redirect('/connexion')

  return (
    <div className="min-h-screen bg-cream-50">
      {children}
    </div>
  )
}
