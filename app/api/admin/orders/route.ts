import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin }              from '@/lib/admin/requireAdmin'
import { adminService }              from '@/services/adminService'
import { logger }                    from '@/lib/logger'
import type { OrderStatus }          from '@/types'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const log     = logger.child({ route: 'GET /api/admin/orders' })
  const session = await requireAdmin(req)

  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const sp = req.nextUrl.searchParams
    const result = await adminService.getOrders({
      status:      (sp.get('status')      ?? undefined) as OrderStatus | undefined,
      productType: sp.get('productType')  ?? undefined,
      dateFrom:    sp.get('dateFrom')     ?? undefined,
      dateTo:      sp.get('dateTo')       ?? undefined,
      search:      sp.get('search')       ?? undefined,
      page:        sp.get('page')     ? Number(sp.get('page'))    : undefined,
      perPage:     sp.get('perPage')  ? Number(sp.get('perPage')) : undefined,
    })

    log.info('admin orders listed', { adminId: session.user.id, total: result.total })
    return NextResponse.json({ success: true, data: result })
  } catch (err) {
    log.error('admin orders list failed', {}, err as Error)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const log     = logger.child({ route: 'PATCH /api/admin/orders' })
  const session = await requireAdmin(req)

  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const body = await req.json() as {
      orderId: string
      status:  OrderStatus
      note?:   string
    }

    await adminService.updateOrderStatus(body.orderId, body.status, session.user.id, body.note)

    log.info('admin order status updated', { orderId: body.orderId, status: body.status })
    return NextResponse.json({ success: true })
  } catch (err) {
    log.error('admin order update failed', {}, err as Error)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
