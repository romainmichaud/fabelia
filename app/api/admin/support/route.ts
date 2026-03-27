import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin }              from '@/lib/admin/requireAdmin'
import { adminService }              from '@/services/adminService'
import { logger }                    from '@/lib/logger'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const log     = logger.child({ route: 'GET /api/admin/support' })
  const session = await requireAdmin(req)

  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const sp     = req.nextUrl.searchParams
    const result = await adminService.getSupportTickets({
      status:   sp.get('status')   ?? undefined,
      priority: sp.get('priority') ?? undefined,
      page:     sp.get('page')     ? Number(sp.get('page'))    : undefined,
      perPage:  sp.get('perPage')  ? Number(sp.get('perPage')) : undefined,
    })

    log.info('support tickets listed', { adminId: session.user.id, total: result.total })
    return NextResponse.json({ success: true, data: result })
  } catch (err) {
    log.error('support tickets list failed', {}, err as Error)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const log     = logger.child({ route: 'PATCH /api/admin/support' })
  const session = await requireAdmin(req)

  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const body = await req.json() as {
      ticketId: string
      action:   'resolve'
      note?:    string
    }

    if (body.action === 'resolve') {
      await adminService.resolveTicket(body.ticketId, session.user.id, body.note)
      log.info('support ticket resolved', { ticketId: body.ticketId, adminId: session.user.id })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err) {
    log.error('support ticket update failed', {}, err as Error)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
