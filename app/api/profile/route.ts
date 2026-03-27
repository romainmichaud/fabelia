import { NextRequest, NextResponse } from 'next/server'
import { createServerClient }        from '@/lib/supabase/server'
import { authService }               from '@/services/authService'
import { logger }                    from '@/lib/logger'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const log = logger.child({ route: 'GET /api/profile' })

  try {
    const supabase = createServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await authService.getProfile(session.user.id)

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: profile })
  } catch (err) {
    log.error('profile fetch failed', {}, err as Error)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const log = logger.child({ route: 'PATCH /api/profile' })

  try {
    const supabase = createServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json() as { full_name?: string; locale?: string }

    await authService.updateProfile(session.user.id, {
      full_name: body.full_name,
      locale:    body.locale,
    })

    log.info('profile updated', { userId: session.user.id })

    return NextResponse.json({ success: true })
  } catch (err) {
    log.error('profile update failed', {}, err as Error)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
