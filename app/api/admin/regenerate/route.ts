import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin }              from '@/lib/admin/requireAdmin'
import { adminService }              from '@/services/adminService'
import { logger }                    from '@/lib/logger'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const log     = logger.child({ route: 'POST /api/admin/regenerate' })
  const session = await requireAdmin(req)

  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const body = await req.json() as {
      action:    'retry_generation' | 'regenerate_illustration' | 'regenerate_cover'
      projectId: string
      pageId?:   string
      styleId?:  string
    }

    let result: unknown = null

    switch (body.action) {
      case 'retry_generation':
        await adminService.retryGeneration(body.projectId, session.user.id)
        break

      case 'regenerate_illustration':
        if (!body.pageId) {
          return NextResponse.json({ error: 'pageId required for regenerate_illustration' }, { status: 400 })
        }
        result = await adminService.regenerateIllustration(body.projectId, body.pageId, session.user.id)
        break

      case 'regenerate_cover':
        if (!body.styleId) {
          return NextResponse.json({ error: 'styleId required for regenerate_cover' }, { status: 400 })
        }
        result = await adminService.regenerateCover(body.projectId, body.styleId, session.user.id)
        break

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }

    log.info('admin regeneration action', {
      action:    body.action,
      projectId: body.projectId,
      adminId:   session.user.id,
    })

    return NextResponse.json({ success: true, data: result })
  } catch (err) {
    log.error('admin regeneration failed', {}, err as Error)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
