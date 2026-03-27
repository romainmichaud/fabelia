import { NextRequest, NextResponse } from 'next/server'
import { createServerClient }        from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code     = searchParams.get('code')
  const next     = searchParams.get('next') ?? '/ma-bibliotheque'
  const error    = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(`${origin}/connexion?error=${encodeURIComponent(error)}`)
  }

  if (code) {
    const supabase = createServerClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (!exchangeError) {
      const redirectUrl = next.startsWith('/') ? `${origin}${next}` : next
      return NextResponse.redirect(redirectUrl)
    }
  }

  return NextResponse.redirect(`${origin}/connexion?error=auth_callback_failed`)
}
