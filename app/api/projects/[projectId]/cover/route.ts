import { NextRequest, NextResponse } from 'next/server'
import { createServerClient }        from '@/lib/supabase/server'
import { bookProjectService }        from '@/services/bookProjectService'
import { logger }                    from '@/lib/logger'

export const runtime = 'nodejs'

export async function PATCH(
  req:     NextRequest,
  { params }: { params: { projectId: string } },
) {
  const log = logger.child({ route: 'PATCH /api/projects/[projectId]/cover' })

  try {
    const supabase = createServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { imageId } = await req.json() as { imageId: string }

    if (!imageId) {
      return NextResponse.json({ error: 'imageId is required' }, { status: 400 })
    }

    await bookProjectService.selectCover(params.projectId, session.user.id, imageId)

    log.info('cover selected', { projectId: params.projectId, imageId })

    return NextResponse.json({ success: true })
  } catch (err) {
    log.error('cover selection failed', {}, err as Error)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
