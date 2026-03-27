import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient }         from '@/lib/supabase/server'
import { generationService }         from '@/services/generationService'
import { logger }                    from '@/lib/logger'

export const runtime = 'nodejs'

// Admin-only endpoint to manually trigger or retry book generation
export async function POST(
  req:     NextRequest,
  { params }: { params: { projectId: string } },
) {
  const log = logger.child({ route: 'POST /api/generation/[projectId]/trigger' })

  try {
    // Verify admin via service-role header or admin check
    const authHeader = req.headers.get('x-admin-secret')
    if (authHeader !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const adminClient = createAdminClient()

    const { data: project, error } = await adminClient
      .from('book_projects')
      .select('id, generation_status, user_id')
      .eq('id', params.projectId)
      .single()

    if (error || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    log.info('manual generation trigger', {
      projectId: params.projectId,
      currentStatus: project.generation_status,
    })

    // Reset status to queued and trigger
    await adminClient
      .from('book_projects')
      .update({ generation_status: 'queued', error_message: null })
      .eq('id', params.projectId)

    // Fire-and-forget
    generationService.trigger(params.projectId, 'admin-trigger').catch(err => {
      log.error('triggered generation failed', { projectId: params.projectId }, err)
    })

    return NextResponse.json({ success: true, message: 'Generation triggered' })
  } catch (err) {
    log.error('manual trigger failed', {}, err as Error)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
