import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin }              from '@/lib/admin/requireAdmin'
import { adminService }              from '@/services/adminService'
import { logger }                    from '@/lib/logger'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const log     = logger.child({ route: 'GET /api/admin/dashboard' })
  const session = await requireAdmin(req)

  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const stats = await adminService.getDashboardStats()
    log.info('dashboard stats fetched', { adminId: session.user.id })
    return NextResponse.json({ success: true, data: stats })
  } catch (err) {
    log.error('dashboard stats failed', {}, err as Error)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
