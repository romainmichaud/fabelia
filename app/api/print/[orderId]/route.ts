import { NextRequest, NextResponse } from 'next/server'
import { createServerClient }        from '@/lib/supabase/server'
import { createAdminClient }         from '@/lib/supabase/server'
import { printService }              from '@/services/printService'
import { logger }                    from '@/lib/logger'
import type { ShippingAddress }      from '@/types'

export const runtime = 'nodejs'

// Create print job
export async function POST(
  req:     NextRequest,
  { params }: { params: { orderId: string } },
) {
  const log = logger.child({ route: 'POST /api/print/[orderId]' })

  try {
    const supabase = createServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = createAdminClient()

    const { data: order } = await adminClient
      .from('orders')
      .select('id, status, book_project_id, shipping_address, user_id')
      .eq('id', params.orderId)
      .eq('user_id', session.user.id)
      .single()

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (!['paid', 'processing'].includes(order.status ?? '')) {
      return NextResponse.json({ error: 'Order not in valid state for print' }, { status: 422 })
    }

    if (!order.shipping_address) {
      return NextResponse.json({ error: 'Shipping address required' }, { status: 422 })
    }

    const printResult = await printService.createAndSubmit(
      params.orderId,
      order.shipping_address as unknown as ShippingAddress,
    )

    log.info('print job created', { orderId: params.orderId, printJobId: printResult.printJobId })

    return NextResponse.json({
      success: true,
      data: {
        printJobId:        printResult.printJobId,
        estimatedDelivery: printResult.estimatedDelivery,
      },
    })
  } catch (err) {
    log.error('print job creation failed', {}, err as Error)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

// Get print job status
export async function GET(
  req:     NextRequest,
  { params }: { params: { orderId: string } },
) {
  const log = logger.child({ route: 'GET /api/print/[orderId]' })

  try {
    const supabase = createServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = createAdminClient()

    const { data: printJob } = await adminClient
      .from('print_jobs')
      .select('id, status, provider_job_id, tracking_number, estimated_delivery, submitted_at, shipped_at')
      .eq('order_id', params.orderId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!printJob) {
      return NextResponse.json({ error: 'Print job not found' }, { status: 404 })
    }

    log.info('print status fetched', { orderId: params.orderId })

    return NextResponse.json({
      success: true,
      data: printJob,
    })
  } catch (err) {
    log.error('print status fetch failed', {}, err as Error)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
