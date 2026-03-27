import { NextRequest }    from 'next/server'
import { createServerClient, createAdminClient } from '@/lib/supabase/server'
import type { Session }   from '@supabase/supabase-js'

export async function requireAdmin(req: NextRequest): Promise<Session | null> {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (profile?.role !== 'admin') return null
  return session
}
