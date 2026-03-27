import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin }              from '@/lib/admin/requireAdmin'
import { adminService }              from '@/services/adminService'
import { logger }                    from '@/lib/logger'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const log     = logger.child({ route: 'GET /api/admin/users' })
  const session = await requireAdmin(req)

  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const sp     = req.nextUrl.searchParams
    const result = await adminService.getUsers({
      search:  sp.get('search')  ?? undefined,
      role:    sp.get('role')    ?? undefined,
      page:    sp.get('page')    ? Number(sp.get('page'))    : undefined,
      perPage: sp.get('perPage') ? Number(sp.get('perPage')) : undefined,
    })

    log.info('admin users listed', { adminId: session.user.id, total: result.total })
    return NextResponse.json({ success: true, data: result })
  } catch (err) {
    log.error('admin users list failed', {}, err as Error)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
