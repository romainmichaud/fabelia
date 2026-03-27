import { NextRequest, NextResponse } from 'next/server'
import { createServerClient }        from '@/lib/supabase/server'
import { createAdminClient }         from '@/lib/supabase/server'
import { logger }                    from '@/lib/logger'

export const runtime = 'nodejs'

export async function GET(
  req:     NextRequest,
  { params }: { params: { projectId: string } },
) {
  const log = logger.child({ route: 'GET /api/generation/[projectId]/status' })

  try {
    const supabase = createServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = createAdminClient()

    // Verify ownership + fetch status
    const { data: project, error } = await adminClient
      .from('book_projects')
      .select(`
        id, generation_status, is_preview_ready, is_book_ready,
        title, theme, error_message,
        book_pages(id, page_number, page_type, illustration_url)
      `)
      .eq('id', params.projectId)
      .eq('user_id', session.user.id)
      .single()

    if (error || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const pages = (project.book_pages as Array<{
      id: string
      page_number: number
      page_type: string
      illustration_url: string | null
    }>) ?? []

    const totalPages        = pages.length
    const illustratedPages  = pages.filter(p => p.illustration_url).length
    const progressPercent   = totalPages > 0
      ? Math.round((illustratedPages / totalPages) * 100)
      : 0

    log.info('generation status polled', {
      projectId: params.projectId,
      status:    project.generation_status,
    })

    return NextResponse.json({
      success: true,
      data: {
        projectId:        project.id,
        status:           project.generation_status,
        isPreviewReady:   project.is_preview_ready,
        isBookReady:      project.is_book_ready,
        title:            project.title,
        theme:            project.theme,
        errorMessage:     project.error_message ?? null,
        progress: {
          totalPages,
          illustratedPages,
          percent: progressPercent,
        },
      },
    })
  } catch (err) {
    log.error('generation status fetch failed', {}, err as Error)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
