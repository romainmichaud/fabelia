import { logger } from '../logger'
import { retry } from '../retry'

// ============================================================
// PAYPAL REST API CLIENT (no SDK — lighter bundle)
// ============================================================

const BASE_URL =
  process.env.PAYPAL_ENV === 'production'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'

let _accessToken:    string | null = null
let _tokenExpiresAt: number        = 0

// ============================================================
// AUTH
// ============================================================
async function getAccessToken(): Promise<string> {
  if (_accessToken && Date.now() < _tokenExpiresAt - 60_000) {
    return _accessToken
  }

  const clientId     = process.env.PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured')
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const res = await fetch(`${BASE_URL}/v1/oauth2/token`, {
    method:  'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type':  'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`PayPal auth failed: ${res.status} ${body}`)
  }

  const data = await res.json() as { access_token: string; expires_in: number }
  _accessToken    = data.access_token
  _tokenExpiresAt = Date.now() + (data.expires_in * 1000)

  logger.debug('paypal — token refreshed', { expiresIn: data.expires_in })

  return _accessToken
}

// ============================================================
// REQUEST HELPER
// ============================================================
async function paypalRequest<T>(
  method:  string,
  path:    string,
  body?:   unknown,
  ctx?:    Record<string, unknown>,
): Promise<T> {
  const token = await getAccessToken()

  const res = await retry(
    async () => {
      const response = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: {
          'Authorization':   `Bearer ${token}`,
          'Content-Type':    'application/json',
          'PayPal-Request-Id': crypto.randomUUID(),
          'Prefer':          'return=representation',
        },
        body: body ? JSON.stringify(body) : undefined,
      })

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}))
        const err = new Error(
          `PayPal API error ${response.status}: ${JSON.stringify(errorBody)}`
        )
        // 429 / 503 → retryable
        if (response.status === 429 || response.status === 503) throw err
        throw Object.assign(err, { nonRetryable: true })
      }

      return response.json() as Promise<T>
    },
    {
      maxAttempts: 3,
      baseDelayMs: 1000,
      retryOn: (err) => !('nonRetryable' in err),
    },
    ctx,
  )

  return res
}

// ============================================================
// ORDER MANAGEMENT
// ============================================================
export interface PayPalOrderPayload {
  amount:      number   // in cents
  currency:    string
  description: string
  returnUrl:   string
  cancelUrl:   string
  orderId:     string   // our internal order ID (for reference_id)
}

export interface PayPalOrder {
  id:     string
  status: string
  links:  Array<{ href: string; rel: string; method: string }>
}

export async function createPayPalOrder(
  payload: PayPalOrderPayload,
): Promise<PayPalOrder> {
  logger.info('paypal — create order', { orderId: payload.orderId })

  return paypalRequest<PayPalOrder>('POST', '/v2/checkout/orders', {
    intent: 'CAPTURE',
    purchase_units: [{
      reference_id:  payload.orderId,
      description:   payload.description,
      amount: {
        currency_code: payload.currency,
        value:         (payload.amount / 100).toFixed(2),
      },
    }],
    application_context: {
      brand_name:          'MonHistoire',
      locale:              'fr-FR',
      landing_page:        'NO_PREFERENCE',
      shipping_preference: 'NO_SHIPPING',
      user_action:         'PAY_NOW',
      return_url:          payload.returnUrl,
      cancel_url:          payload.cancelUrl,
    },
  }, { orderId: payload.orderId })
}

export interface PayPalCapture {
  id:     string
  status: 'COMPLETED' | 'DECLINED' | 'FAILED' | string
  purchase_units: Array<{
    reference_id: string
    payments: {
      captures: Array<{
        id:     string
        status: string
        amount: { value: string; currency_code: string }
      }>
    }
  }>
}

export async function capturePayPalOrder(
  paypalOrderId: string,
  ctx?:          Record<string, unknown>,
): Promise<PayPalCapture> {
  logger.info('paypal — capture order', { paypalOrderId, ...ctx })

  return paypalRequest<PayPalCapture>(
    'POST',
    `/v2/checkout/orders/${paypalOrderId}/capture`,
    {},
    ctx,
  )
}

// ============================================================
// WEBHOOK VERIFICATION
// ============================================================
export async function verifyPayPalWebhook(
  headers:    Record<string, string>,
  rawBody:    string,
  webhookId:  string,
): Promise<boolean> {
  try {
    const result = await paypalRequest<{ verification_status: string }>(
      'POST',
      '/v1/notifications/verify-webhook-signature',
      {
        auth_algo:         headers['paypal-auth-algo'],
        cert_url:          headers['paypal-cert-url'],
        transmission_id:   headers['paypal-transmission-id'],
        transmission_sig:  headers['paypal-transmission-sig'],
        transmission_time: headers['paypal-transmission-time'],
        webhook_id:        webhookId,
        webhook_event:     JSON.parse(rawBody),
      },
    )
    return result.verification_status === 'SUCCESS'
  } catch (err) {
    logger.error('paypal — webhook verification failed', {}, err as Error)
    return false
  }
}
