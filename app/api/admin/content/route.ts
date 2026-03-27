import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin }              from '@/lib/admin/requireAdmin'
import { adminService }              from '@/services/adminService'
import { logger }                    from '@/lib/logger'

export const runtime = 'nodejs'

// Flagged content review
export async function GET(req: NextRequest) {
  const log     = logger.child({ route: 'GET /api/admin/content' })
  const session = await requireAdmin(req)

  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const sp     = req.nextUrl.searchParams
    const result = await adminService.getFlaggedContent(
      sp.get('page')    ? Number(sp.get('page'))    : 1,
      sp.get('perPage') ? Number(sp.get('perPage')) : 20,
    )

    log.info('flagged content listed', { adminId: session.user.id, total: result.total })
    return NextResponse.json({ success: true, data: result })
  } catch (err) {
    log.error('flagged content list failed', {}, err as Error)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const log     = logger.child({ route: 'PATCH /api/admin/content' })
  const session = await requireAdmin(req)

  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const body = await req.json() as {
      scoreId:  string
      decision: 'approve' | 'reject'
    }

    await adminService.reviewContent(body.scoreId, body.decision, session.user.id)

    log.info('content reviewed', {
      scoreId:  body.scoreId,
      decision: body.decision,
      adminId:  session.user.id,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    log.error('content review failed', {}, err as Error)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
