import { NextRequest, NextResponse } from 'next/server'
import { createServerClient }        from '@/lib/supabase/server'
import { paymentService }            from '@/services/paymentService'
import { logger }                    from '@/lib/logger'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const log = logger.child({ route: 'POST /api/payments/paypal/capture' })

  try {
    const supabase = createServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json() as {
      orderId:       string
      paypalOrderId: string
    }

    if (!body.orderId || !body.paypalOrderId) {
      return NextResponse.json(
        { error: 'orderId and paypalOrderId are required' },
        { status: 400 },
      )
    }

    await paymentService.capturePayPal(body.orderId, body.paypalOrderId)

    log.info('PayPal order captured', { orderId: body.orderId, paypalOrderId: body.paypalOrderId })

    return NextResponse.json({
      success: true,
      data: { orderId: body.orderId },
    })
  } catch (err) {
    log.error('paypal capture failed', {}, err as Error)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
