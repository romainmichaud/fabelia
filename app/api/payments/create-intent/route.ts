import { NextRequest, NextResponse } from 'next/server'
import { createServerClient }        from '@/lib/supabase/server'
import { paymentService }            from '@/services/paymentService'
import { logger }                    from '@/lib/logger'
import type { ProductType, BookFormat } from '@/types'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const log = logger.child({ route: 'POST /api/payments/create-intent' })

  try {
    // ——— Auth ———
    const supabase = createServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // ——— Parse body ———
    const body = await req.json() as {
      projectId:   string
      productType: ProductType
      bookFormat?: BookFormat
      couponCode?: string
    }

    if (!body.projectId || !body.productType) {
      return NextResponse.json(
        { error: 'projectId and productType are required' },
        { status: 400 },
      )
    }

    // Verify project exists (may be a guest project with null user_id)
    const adminClient = (await import('@/lib/supabase/server')).createAdminClient()
    const { data: project } = await adminClient
      .from('book_projects')
      .select('id, is_preview_ready, user_id')
      .eq('id', body.projectId)
      .single()

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Claim guest project: associate with authenticated user
    if (!project.user_id) {
      await adminClient
        .from('book_projects')
        .update({ user_id: userId } as never)
        .eq('id', body.projectId)
    } else if (project.user_id !== userId) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    if (!project.is_preview_ready) {
      return NextResponse.json({ error: 'Preview must be generated before checkout' }, { status: 422 })
    }

    log.info('creating order', { projectId: body.projectId, productType: body.productType })

    // ——— Create order ———
    const { orderId, orderNumber, amount } = await paymentService.createOrder({
      userId,
      projectId:   body.projectId,
      productType: body.productType,
      bookFormat:  body.bookFormat ?? null,
      couponCode:  body.couponCode,
    })

    // ——— Create Stripe payment intent ———
    const intentResult = await paymentService.createStripeIntent(
      orderId,
      body.projectId,
      userId,
    )

    log.info('payment intent created', { orderId, amount })

    return NextResponse.json({
      success: true,
      data: {
        orderId,
        orderNumber,
        clientSecret: intentResult.clientSecret,
        amount,
        currency: 'EUR',
      },
    })
  } catch (err) {
    const error = err as Error
    log.error('create-intent failed', {}, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
