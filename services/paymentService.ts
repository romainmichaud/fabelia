import Stripe                        from 'stripe'
import { getStripe, STRIPE_PRICES, getPriceKey } from '@/lib/stripe/client'
import { createPayPalOrder, capturePayPalOrder } from '@/lib/paypal/client'
import { createAdminClient }          from '@/lib/supabase/server'
import { generationService }          from './generationService'
import { logger }                     from '@/lib/logger'
import type { ProductType, BookFormat, ShippingAddress, OrderStatus } from '@/types'

// ============================================================
// TYPES
// ============================================================
export interface CreateOrderPayload {
  userId:      string
  projectId:   string
  productType: ProductType
  bookFormat:  BookFormat | null
  couponCode?: string
}

export interface StripeIntentResult {
  orderId:        string
  clientSecret:   string
  amount:         number
  orderNumber:    string
}

export interface PayPalOrderResult {
  orderId:       string
  paypalOrderId: string
  approvalUrl:   string
  amount:        number
}

// ============================================================
// ORDER NUMBER GENERATOR
// ============================================================
function generateOrderNumber(): string {
  const year   = new Date().getFullYear()
  const random = Math.floor(Math.random() * 90000) + 10000
  return `ORD-${year}-${random}`
}

// ============================================================
// SERVICE
// ============================================================
export const paymentService = {

  // ----------------------------------------------------------
  // CREATE ORDER (shared between Stripe and PayPal)
  // ----------------------------------------------------------
  async createOrder(payload: CreateOrderPayload): Promise<{
    orderId:     string
    orderNumber: string
    amount:      number
  }> {
    const supabase = createAdminClient()
    const log      = logger.child({ service: 'payment', projectId: payload.projectId })

    const priceKey  = getPriceKey(payload.productType, payload.bookFormat)
    const unitPrice = STRIPE_PRICES[priceKey].amount

    // Apply coupon
    let discountAmount = 0
    if (payload.couponCode) {
      discountAmount = await paymentService.validateCoupon(payload.couponCode, unitPrice)
    }

    const taxRate   = 0.20   // 20% TVA France
    const subtotal  = unitPrice - discountAmount
    const taxAmount = Math.round(subtotal * taxRate / (1 + taxRate))  // Tax included in price
    const total     = subtotal

    const orderNumber = generateOrderNumber()

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        user_id:          payload.userId,
        book_project_id:  payload.projectId,
        order_number:     orderNumber,
        status:           'pending_payment',
        product_type:     payload.productType,
        book_format:      payload.bookFormat,
        unit_price:       unitPrice,
        discount_amount:  discountAmount,
        tax_amount:       taxAmount,
        total_amount:     total,
        currency:         'eur',
        coupon_code:      payload.couponCode ?? null,
      })
      .select('id')
      .single()

    if (error) {
      log.error('failed to create order', {}, error as Error)
      throw error
    }

    log.info('order created', { orderId: order.id, orderNumber, amount: total })

    return { orderId: order.id, orderNumber, amount: total }
  },

  // ----------------------------------------------------------
  // STRIPE PAYMENT INTENT
  // ----------------------------------------------------------
  async createStripeIntent(
    orderId:     string,
    projectId:   string,
    userId:      string,
  ): Promise<StripeIntentResult> {
    const supabase = createAdminClient()
    const stripe   = getStripe()
    const log      = logger.child({ service: 'payment', orderId, projectId })

    const { data: order } = await supabase
      .from('orders')
      .select('total_amount, order_number, currency')
      .eq('id', orderId)
      .single()

    if (!order) throw new Error(`Order ${orderId} not found`)

    log.info('creating Stripe payment intent', { amount: order.total_amount })

    // Get or create Stripe customer
    const customerId = await paymentService.getOrCreateStripeCustomer(userId, supabase)

    const intent = await stripe.paymentIntents.create({
      amount:               order.total_amount,
      currency:             order.currency.toLowerCase(),
      customer:             customerId ?? undefined,
      description:          `MonHistoire — Commande ${order.order_number}`,
      metadata: {
        order_id:   orderId,
        project_id: projectId,
        user_id:    userId,
      },
      payment_method_types: ['card'],   // Apple Pay auto-enabled via PaymentElement
      capture_method:       'automatic',
    })

    // Create payment record
    const { error } = await supabase.from('payments').insert({
      order_id:    orderId,
      provider:    'stripe',
      provider_id: intent.id,
      status:      'pending',
      amount:      order.total_amount,
      currency:    order.currency,
      metadata:    { customer_id: customerId },
    })

    if (error) log.warn('failed to persist payment record', {}, error as Error)

    log.info('Stripe intent created', { intentId: intent.id })

    return {
      orderId,
      clientSecret: intent.client_secret!,
      amount:       order.total_amount,
      orderNumber:  order.order_number,
    }
  },

  // ----------------------------------------------------------
  // PAYPAL ORDER
  // ----------------------------------------------------------
  async createPayPalCheckout(
    orderId:  string,
    baseUrl:  string,
  ): Promise<PayPalOrderResult> {
    const supabase = createAdminClient()
    const log      = logger.child({ service: 'payment', orderId })

    const { data: order } = await supabase
      .from('orders')
      .select('total_amount, order_number, currency')
      .eq('id', orderId)
      .single()

    if (!order) throw new Error(`Order ${orderId} not found`)

    log.info('creating PayPal order', { amount: order.total_amount })

    const projectId = await paymentService.getProjectIdFromOrder(orderId, supabase)

    const paypalOrder = await createPayPalOrder({
      amount:      order.total_amount,
      currency:    order.currency,
      description: `Livre personnalisé MonHistoire`,
      orderId,
      returnUrl: `${baseUrl}/commande/${projectId}/confirmation?paypal=success&orderId=${orderId}`,
      cancelUrl: `${baseUrl}/commande/${projectId}?paypal=cancelled`,
    })

    // Find approval URL
    const approvalUrl = paypalOrder.links.find(l => l.rel === 'approve')?.href
    if (!approvalUrl) throw new Error('PayPal approval URL not found')

    // Create payment record
    await supabase.from('payments').insert({
      order_id:    orderId,
      provider:    'paypal',
      provider_id: paypalOrder.id,
      status:      'pending',
      amount:      order.total_amount,
      currency:    order.currency,
    })

    log.info('PayPal order created', { paypalOrderId: paypalOrder.id })

    return {
      orderId,
      paypalOrderId: paypalOrder.id,
      approvalUrl,
      amount:        order.total_amount,
    }
  },

  // ----------------------------------------------------------
  // CAPTURE PAYPAL PAYMENT
  // ----------------------------------------------------------
  async capturePayPal(
    internalOrderId: string,
    paypalOrderId:   string,
  ): Promise<void> {
    const supabase = createAdminClient()
    const log      = logger.child({ service: 'payment', orderId: internalOrderId })

    log.info('capturing PayPal payment', { paypalOrderId })

    const capture = await capturePayPalOrder(paypalOrderId, { orderId: internalOrderId })

    if (capture.status !== 'COMPLETED') {
      throw new Error(`PayPal capture status: ${capture.status}`)
    }

    // Update payment record
    await supabase
      .from('payments')
      .update({ status: 'captured' })
      .eq('provider_id', paypalOrderId)

    log.info('PayPal payment captured')

    // Trigger downstream order completion
    await paymentService.confirmOrder(internalOrderId)
  },

  // ----------------------------------------------------------
  // STRIPE WEBHOOK HANDLER
  // ----------------------------------------------------------
  async handleStripeWebhook(event: Stripe.Event): Promise<void> {
    const log = logger.child({ service: 'payment', eventType: event.type })
    log.info('stripe webhook received')

    switch (event.type) {

      case 'payment_intent.succeeded': {
        const intent = event.data.object as Stripe.PaymentIntent
        const orderId = intent.metadata.order_id

        if (!orderId) {
          log.warn('payment_intent.succeeded — no order_id in metadata')
          return
        }

        await paymentService.handleStripeSuccess(intent, orderId)
        break
      }

      case 'payment_intent.payment_failed': {
        const intent  = event.data.object as Stripe.PaymentIntent
        const orderId = intent.metadata.order_id

        if (orderId) {
          await paymentService.handleStripeFailure(intent, orderId)
        }
        break
      }

      case 'charge.dispute.created': {
        const dispute = event.data.object as Stripe.Dispute
        log.warn('charge dispute created', { disputeId: dispute.id })
        // Flag order for manual review
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        log.info('charge refunded', { chargeId: charge.id })
        break
      }

      default:
        log.debug('unhandled stripe event type', { type: event.type })
    }
  },

  // ----------------------------------------------------------
  // STRIPE SUCCESS FLOW
  // ----------------------------------------------------------
  async handleStripeSuccess(
    intent:  Stripe.PaymentIntent,
    orderId: string,
  ): Promise<void> {
    const supabase = createAdminClient()
    const log      = logger.child({ service: 'payment', orderId })

    log.info('Stripe payment succeeded', { intentId: intent.id })

    await supabase
      .from('payments')
      .update({ status: 'captured' })
      .eq('provider_id', intent.id)

    await paymentService.confirmOrder(orderId)
  },

  async handleStripeFailure(
    intent:  Stripe.PaymentIntent,
    orderId: string,
  ): Promise<void> {
    const supabase = createAdminClient()
    logger.warn('Stripe payment failed', { orderId, intentId: intent.id })

    await supabase
      .from('payments')
      .update({
        status:   'failed',
        metadata: {
          error_code:    intent.last_payment_error?.code    ?? 'unknown',
          error_message: intent.last_payment_error?.message ?? 'Payment failed',
        },
      })
      .eq('provider_id', intent.id)

    await supabase
      .from('orders')
      .update({ status: 'pending_payment' })
      .eq('id', orderId)
  },

  // ----------------------------------------------------------
  // CONFIRM ORDER (post successful payment)
  // ----------------------------------------------------------
  async confirmOrder(orderId: string): Promise<void> {
    const supabase = createAdminClient()
    const log      = logger.child({ service: 'payment', orderId })

    log.info('confirming order')

    const { data: order } = await supabase
      .from('orders')
      .update({
        status:  'paid',
      })
      .eq('id', orderId)
      .select('book_project_id, product_type')
      .single()

    if (!order?.book_project_id) throw new Error(`Order ${orderId} not found or has no project`)

    // Lock the project (prevent further edits)
    await supabase
      .from('book_projects')
      .update({
        product_type: order.product_type,
        paid_at:      new Date().toISOString(),
      })
      .eq('id', order.book_project_id)

    log.info('order confirmed, triggering generation', { projectId: order.book_project_id })

    // TRIGGER FULL BOOK GENERATION
    await generationService.trigger(order.book_project_id, orderId)

    // Update order status to processing
    await supabase
      .from('orders')
      .update({ status: 'processing' })
      .eq('id', orderId)
  },

  // ----------------------------------------------------------
  // REFUND
  // ----------------------------------------------------------
  async refundOrder(orderId: string, reason: string, adminId: string): Promise<void> {
    const supabase = createAdminClient()
    const stripe   = getStripe()
    const log      = logger.child({ service: 'payment', orderId })

    log.info('processing refund', { reason, adminId })

    const { data: payment } = await supabase
      .from('payments')
      .select('provider, provider_id, amount')
      .eq('order_id', orderId)
      .eq('status', 'captured')
      .single()

    if (!payment) throw new Error('No captured payment found for this order')

    if (payment.provider === 'stripe' && payment.provider_id) {
      await stripe.refunds.create({
        payment_intent: payment.provider_id,
        reason:         'requested_by_customer',
      })
    }
    // PayPal refund: would call PayPal refund API

    await supabase
      .from('payments')
      .update({ status: 'refunded' })
      .eq('order_id', orderId)

    await supabase
      .from('orders')
      .update({ status: 'refunded' })
      .eq('id', orderId)

    // Log admin action
    await supabase.from('admin_logs').insert({
      admin_id:    adminId,
      action:      'refund_order',
      resource:    'orders',
      resource_id: orderId,
      after_state: { reason },
    })

    log.info('refund processed')
  },

  // ----------------------------------------------------------
  // HELPERS
  // ----------------------------------------------------------
  async validateCoupon(code: string, amount: number): Promise<number> {
    // TODO: implement coupon table logic
    const DEMO_COUPONS: Record<string, number> = {
      'EMMA5':   500,
      'NOEL10':  1000,
      'WELCOME': 300,
    }
    return DEMO_COUPONS[code.toUpperCase()] ?? 0
  },

  async getOrCreateStripeCustomer(
    userId:    string,
    supabase:  ReturnType<typeof createAdminClient>,
  ): Promise<string | null> {
    const stripe = getStripe()

    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', userId)
      .single()

    if (!profile) return null

    try {
      const customers = await stripe.customers.list({
        email: profile.email,
        limit: 1,
      })

      if (customers.data.length > 0) return customers.data[0].id

      const customer = await stripe.customers.create({
        email: profile.email,
        name:  profile.full_name ?? undefined,
        metadata: { supabase_user_id: userId },
      })

      return customer.id
    } catch {
      return null
    }
  },

  async getProjectIdFromOrder(
    orderId:  string,
    supabase: ReturnType<typeof createAdminClient>,
  ): Promise<string> {
    const { data } = await supabase
      .from('orders')
      .select('book_project_id')
      .eq('id', orderId)
      .single()
    return data?.book_project_id ?? ''
  },
}
