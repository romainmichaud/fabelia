import { NextRequest, NextResponse } from 'next/server'
import Stripe                        from 'stripe'
import { getStripe }                 from '@/lib/stripe/client'
import { paymentService }            from '@/services/paymentService'
import { logger }                    from '@/lib/logger'

export const runtime = 'nodejs'

// IMPORTANT: Stripe webhooks require the raw body, not parsed JSON
// Next.js 14 App Router reads body as stream — use req.text() / req.arrayBuffer()
export async function POST(req: NextRequest) {
  const log  = logger.child({ route: 'POST /api/payments/webhook' })
  const sig  = req.headers.get('stripe-signature')

  if (!sig) {
    log.warn('webhook received without signature')
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 })
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    log.error('STRIPE_WEBHOOK_SECRET not configured')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  let event: Stripe.Event

  try {
    const rawBody = await req.arrayBuffer()
    const stripe  = getStripe()

    event = stripe.webhooks.constructEvent(
      Buffer.from(rawBody),
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    )
  } catch (err) {
    log.warn('webhook signature verification failed', {}, err as Error)
    return NextResponse.json({ error: 'Webhook verification failed' }, { status: 400 })
  }

  log.info('stripe webhook verified', { type: event.type, id: event.id })

  try {
    await paymentService.handleStripeWebhook(event)
    return NextResponse.json({ received: true })
  } catch (err) {
    // Return 200 to prevent Stripe from retrying — log and investigate separately
    log.error('stripe webhook handler failed', { eventId: event.id, type: event.type }, err as Error)
    return NextResponse.json({ received: true, error: (err as Error).message })
  }
}
