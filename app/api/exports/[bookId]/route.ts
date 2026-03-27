import { NextRequest, NextResponse } from 'next/server'
import { createServerClient }        from '@/lib/supabase/server'
import { createAdminClient }         from '@/lib/supabase/server'
import { exportService }             from '@/services/exportService'
import { logger }                    from '@/lib/logger'

export const runtime = 'nodejs'

export async function GET(
  req:     NextRequest,
  { params }: { params: { bookId: string } },
) {
  const log = logger.child({ route: 'GET /api/exports/[bookId]' })

  try {
    const supabase = createServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = req.nextUrl.searchParams
    const format       = (searchParams.get('format') ?? 'pdf') as 'pdf' | 'print_ready_pdf'

    const adminClient = createAdminClient()

    // Verify ownership through order
    const { data: order } = await adminClient
      .from('orders')
      .select('id, status, book_project_id')
      .eq('book_project_id', params.bookId)
      .eq('user_id', session.user.id)
      .in('status', ['paid', 'processing', 'completed'])
      .single()

    if (!order) {
      return NextResponse.json({ error: 'No valid order found for this book' }, { status: 403 })
    }

    const exportRecord = await exportService.ensureExport(params.bookId, format)

    // Generate signed URL (15 min)
    const { data: signed, error: signErr } = await adminClient.storage
      .from('exports')
      .createSignedUrl(exportRecord.storage_path, 900)

    if (signErr || !signed) {
      return NextResponse.json({ error: 'Failed to generate download URL' }, { status: 500 })
    }

    log.info('export download served', {
      bookId:  params.bookId,
      orderId: order.id,
      format,
    })

    return NextResponse.json({
      success: true,
      data: {
        url:      signed.signedUrl,
        filename: exportRecord.filename,
      },
    })
  } catch (err) {
    log.error('export failed', {}, err as Error)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
