import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin }              from '@/lib/admin/requireAdmin'
import { adminService }              from '@/services/adminService'
import { logger }                    from '@/lib/logger'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const log     = logger.child({ route: 'GET /api/admin/projects' })
  const session = await requireAdmin(req)

  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const sp     = req.nextUrl.searchParams
    const result = await adminService.getProjects({
      status:  sp.get('status')  ?? undefined,
      search:  sp.get('search')  ?? undefined,
      page:    sp.get('page')    ? Number(sp.get('page'))    : undefined,
      perPage: sp.get('perPage') ? Number(sp.get('perPage')) : undefined,
    })

    log.info('admin projects listed', { adminId: session.user.id, total: result.total })
    return NextResponse.json({ success: true, data: result })
  } catch (err) {
    log.error('admin projects list failed', {}, err as Error)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
