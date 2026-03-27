import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin }              from '@/lib/admin/requireAdmin'
import { adminService }              from '@/services/adminService'
import { logger }                    from '@/lib/logger'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const log     = logger.child({ route: 'GET /api/admin/prompts' })
  const session = await requireAdmin(req)

  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const versions = await adminService.getPromptVersions()
    log.info('prompt versions listed', { adminId: session.user.id })
    return NextResponse.json({ success: true, data: versions })
  } catch (err) {
    log.error('prompt versions list failed', {}, err as Error)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const log     = logger.child({ route: 'POST /api/admin/prompts' })
  const session = await requireAdmin(req)

  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const body = await req.json()
    const result = await adminService.createPromptVersion({
      ...body,
      adminId: session.user.id,
    })

    log.info('prompt version created', { adminId: session.user.id, id: result.id })
    return NextResponse.json({ success: true, data: result }, { status: 201 })
  } catch (err) {
    log.error('prompt version creation failed', {}, err as Error)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const log     = logger.child({ route: 'PATCH /api/admin/prompts' })
  const session = await requireAdmin(req)

  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const body = await req.json() as { versionId: string; action: 'activate' }

    if (body.action === 'activate') {
      await adminService.activatePromptVersion(body.versionId, session.user.id)
      log.info('prompt version activated', { versionId: body.versionId })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err) {
    log.error('prompt version update failed', {}, err as Error)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
