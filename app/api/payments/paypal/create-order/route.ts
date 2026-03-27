import { NextRequest, NextResponse } from 'next/server'
import { createServerClient }        from '@/lib/supabase/server'
import { paymentService }            from '@/services/paymentService'
import { logger }                    from '@/lib/logger'
import type { ProductType, BookFormat } from '@/types'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const log = logger.child({ route: 'POST /api/payments/paypal/create-order' })

  try {
    const supabase = createServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json() as {
      projectId:   string
      productType: ProductType
      bookFormat?: BookFormat
    }

    const { orderId } = await paymentService.createOrder({
      userId:      session.user.id,
      projectId:   body.projectId,
      productType: body.productType,
      bookFormat:  body.bookFormat ?? null,
    })

    const baseUrl = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_BASE_URL ?? ''

    const paypalResult = await paymentService.createPayPalCheckout(orderId, baseUrl)

    log.info('PayPal order created', { orderId, paypalOrderId: paypalResult.paypalOrderId })

    return NextResponse.json({
      success: true,
      data: {
        orderId:       paypalResult.orderId,
        paypalOrderId: paypalResult.paypalOrderId,
        approvalUrl:   paypalResult.approvalUrl,
        amount:        paypalResult.amount,
      },
    })
  } catch (err) {
    log.error('paypal create-order failed', {}, err as Error)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
