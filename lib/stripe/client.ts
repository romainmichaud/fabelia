import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set')
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-04-10',
      typescript:  true,
      appInfo: {
        name:    'MonHistoire',
        version: '1.0.0',
        url:     'https://monhistoire.fr',
      },
    })
  }
  return _stripe
}

// ============================================================
// PRICING TABLE
// ============================================================
export const STRIPE_PRICES = {
  digital:          { amount: 1900, label: 'Numérique',      priceId: process.env.STRIPE_PRICE_DIGITAL          ?? '' },
  print_softcover:  { amount: 3400, label: 'Livre souple',   priceId: process.env.STRIPE_PRICE_PRINT_SOFTCOVER  ?? '' },
  print_hardcover:  { amount: 3900, label: 'Livre rigide',   priceId: process.env.STRIPE_PRICE_PRINT_HARDCOVER  ?? '' },
  bundle_softcover: { amount: 4400, label: 'Bundle souple',  priceId: process.env.STRIPE_PRICE_BUNDLE_SOFTCOVER ?? '' },
  bundle_hardcover: { amount: 4900, label: 'Bundle rigide',  priceId: process.env.STRIPE_PRICE_BUNDLE_HARDCOVER ?? '' },
}

export type StripePriceKey = keyof typeof STRIPE_PRICES

export function getPriceKey(
  productType: string,
  bookFormat:  string | null,
): StripePriceKey {
  if (productType === 'digital')  return 'digital'
  if (productType === 'print')    return bookFormat === 'hardcover' ? 'print_hardcover'  : 'print_softcover'
  if (productType === 'bundle')   return bookFormat === 'hardcover' ? 'bundle_hardcover' : 'bundle_softcover'
  return 'digital'
}
