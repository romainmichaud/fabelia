'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { PricingSelector } from '@/components/checkout/PricingSelector'
import {
  LockIcon, ShieldCheckIcon, MapPinIcon,
  ArrowRightIcon, ChevronLeftIcon, AlertCircleIcon,
} from 'lucide-react'
import type { ProductType, BookFormat, ShippingAddress } from '@/types'

type CheckoutStep = 'plan' | 'address' | 'payment'

// ============================================================
// ADDRESS FORM
// ============================================================
function AddressForm({
  value:    address,
  onChange: setAddress,
  errors,
}: {
  value:    Partial<ShippingAddress>
  onChange: (a: Partial<ShippingAddress>) => void
  errors:   Partial<Record<keyof ShippingAddress, string>>
}) {
  const field = (
    key:         keyof ShippingAddress,
    label:       string,
    placeholder: string,
    half?:       boolean
  ) => (
    <div className={half ? 'col-span-1' : 'col-span-2'}>
      <label className="block text-sm font-semibold text-navy-700 mb-1.5">
        {label}
      </label>
      <input
        type="text"
        value={(address[key] ?? '') as string}
        onChange={e => setAddress({ ...address, [key]: e.target.value })}
        placeholder={placeholder}
        className={`form-input ${errors[key] ? 'border-terra-400' : ''}`}
      />
      {errors[key] && (
        <p className="mt-1 text-terra-500 text-xs">{errors[key]}</p>
      )}
    </div>
  )

  return (
    <div className="grid grid-cols-2 gap-4">
      {field('first_name', 'Prénom',       'Emma',            true)}
      {field('last_name',  'Nom',           'Dupont',          true)}
      {field('line1',      'Adresse',       '12 rue des Lilas')}
      {field('line2',      'Complément',    'Apt. 3B')}
      {field('postal_code','Code postal',  '75001',           true)}
      {field('city',       'Ville',         'Paris',           true)}

      {/* Country locked to FR */}
      <div className="col-span-2">
        <label className="block text-sm font-semibold text-navy-700 mb-1.5">
          Pays
        </label>
        <div className="form-input bg-cream-50 text-navy-500 flex items-center gap-2 cursor-not-allowed">
          <MapPinIcon className="h-4 w-4 text-navy-400" />
          🇫🇷 France (livraison France uniquement)
        </div>
      </div>
    </div>
  )
}

// ============================================================
// PAYMENT FORM — Stripe card element
// ============================================================
function StripePaymentForm({
  clientSecret,
  onReady,
}: {
  clientSecret: string | null
  onReady:      (ready: boolean) => void
}) {
  const cardRef    = useRef<HTMLDivElement>(null)
  const stripeRef  = useRef<unknown>(null)
  const elementRef = useRef<unknown>(null)
  const [cardError, setCardError] = useState<string | null>(null)

  useEffect(() => {
    if (!clientSecret || !cardRef.current) return

    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    if (!publishableKey) {
      setCardError('Stripe non configuré (clé publique manquante)')
      return
    }

    // Dynamically load Stripe to avoid SSR issues
    import('@stripe/stripe-js').then(({ loadStripe }) => {
      loadStripe(publishableKey).then(stripe => {
        if (!stripe || !cardRef.current) return

        stripeRef.current = stripe

        const elements = (stripe as { elements: (opts?: unknown) => { create: (type: string, opts?: unknown) => unknown } }).elements()
        type CardElement = {
          mount: (el: HTMLDivElement) => void
          on: (event: string, fn: (e: { error?: { message: string } }) => void) => void
          unmount: () => void
        }
        const cardElement = elements.create('card', {
          style: {
            base: {
              fontSize:       '16px',
              color:          '#1A2E4A',
              fontFamily:     'inherit',
              '::placeholder': { color: '#A0AEC0' },
            },
            invalid: { color: '#E53E3E' },
          },
          hidePostalCode: true,
        })

        const card = cardElement as unknown as CardElement
        card.mount(cardRef.current)
        elementRef.current = card

        card.on('change', (e) => {
          setCardError(e.error?.message ?? null)
          onReady(!e.error)
        })
      })
    })

    return () => {
      if (elementRef.current) {
        (elementRef.current as { unmount: () => void }).unmount()
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientSecret])

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-navy-700 mb-2">
          Numéro de carte
        </label>
        <div
          ref={cardRef}
          className="form-input min-h-[46px] flex items-center"
        />
        {cardError && (
          <p className="mt-1 text-terra-500 text-xs flex items-center gap-1">
            <AlertCircleIcon className="h-3 w-3" />
            {cardError}
          </p>
        )}
        <p className="text-xs text-navy-400 mt-1">
          Paiement sécurisé par Stripe — vos données ne sont jamais stockées
        </p>
      </div>

      {/* PayPal alternative */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-cream-200" />
        <span className="text-xs text-navy-400">ou payer avec</span>
        <div className="flex-1 h-px bg-cream-200" />
      </div>

      <button
        type="button"
        className="w-full h-12 rounded-2xl bg-[#0070BA] text-white font-bold text-sm hover:bg-[#003087] transition-colors flex items-center justify-center gap-2"
      >
        <span className="text-white font-black italic text-lg">Pay</span>
        <span className="text-[#009cde] font-black italic text-lg">Pal</span>
      </button>
    </div>
  )
}

// ============================================================
// TRUST BADGES
// ============================================================
function TrustBadges() {
  return (
    <div className="flex flex-wrap gap-4 justify-center mt-6 pt-6 border-t border-cream-100">
      {[
        { icon: <LockIcon className="h-4 w-4" />,        label: 'Paiement chiffré SSL' },
        { icon: <ShieldCheckIcon className="h-4 w-4" />, label: 'Stripe certifié PCI' },
        { icon: <MapPinIcon className="h-4 w-4" />,      label: 'Données en France' },
      ].map(({ icon, label }) => (
        <div key={label} className="flex items-center gap-1.5 text-xs text-navy-400">
          <span className="text-forest-400">{icon}</span>
          {label}
        </div>
      ))}
    </div>
  )
}

// ============================================================
// PAGE
// ============================================================
export default function CheckoutPage() {
  const params    = useParams()
  const router    = useRouter()
  const projectId = params.projectId as string

  const [step,           setStep]           = useState<CheckoutStep>('plan')
  const [productType,    setProductType]    = useState<ProductType | null>(null)
  const [bookFormat,     setBookFormat]     = useState<BookFormat | null>('softcover')
  const [address,        setAddress]        = useState<Partial<ShippingAddress>>({ country: 'FR' })
  const [addressErrors,  setAddressErrors]  = useState<Partial<Record<keyof ShippingAddress, string>>>({})
  const [isSubmitting,   setIsSubmitting]   = useState(false)
  const [submitError,    setSubmitError]    = useState<string | null>(null)
  const [clientSecret,   setClientSecret]   = useState<string | null>(null)
  const [orderId,        setOrderId]        = useState<string | null>(null)
  const [cardReady,      setCardReady]      = useState(false)

  const needsAddress = productType === 'print' || productType === 'bundle'

  const STEPS: CheckoutStep[] = needsAddress
    ? ['plan', 'address', 'payment']
    : ['plan', 'payment']

  const stepIndex  = STEPS.indexOf(step)
  const isLastStep = stepIndex === STEPS.length - 1

  function validateAddress(): boolean {
    const errs: typeof addressErrors = {}
    if (!address.first_name?.trim()) errs.first_name  = 'Requis'
    if (!address.last_name?.trim())  errs.last_name   = 'Requis'
    if (!address.line1?.trim())      errs.line1       = 'Requis'
    if (!address.postal_code?.trim()) errs.postal_code = 'Requis'
    if (!address.city?.trim())       errs.city        = 'Requis'
    setAddressErrors(errs)
    return Object.keys(errs).length === 0
  }

  // When reaching the payment step, create order + get clientSecret
  useEffect(() => {
    if (step !== 'payment' || clientSecret) return

    setIsSubmitting(true)
    setSubmitError(null)

    fetch('/api/payments/create-intent', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ projectId, productType, bookFormat, address }),
    })
      .then(res => res.json().then(json => ({ ok: res.ok, json })))
      .then(({ ok, json }) => {
        if (!ok) throw new Error(json.error ?? 'Erreur lors de la création de la commande')
        setClientSecret(json.data.clientSecret)
        setOrderId(json.data.orderId)
      })
      .catch(err => setSubmitError((err as Error).message))
      .finally(() => setIsSubmitting(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  async function confirmPayment() {
    if (!clientSecret || !orderId) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const { loadStripe } = await import('@stripe/stripe-js')
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

      if (!stripe) throw new Error('Stripe non disponible')

      // Confirm payment with card element already mounted in StripePaymentForm
      // We use confirmCardPayment without payment_method since Elements handles it
      const result = await (stripe as {
        confirmCardPayment: (secret: string) => Promise<{ error?: { message: string } }>
      }).confirmCardPayment(clientSecret)

      if (result.error) throw new Error(result.error.message)

      router.push(`/commande/${projectId}/confirmation`)
    } catch (err) {
      setSubmitError((err as Error).message)
      setIsSubmitting(false)
    }
  }

  async function goNext() {
    if (step === 'plan' && !productType) return
    if (step === 'address' && !validateAddress()) return

    setSubmitError(null)

    if (isLastStep) {
      await confirmPayment()
      return
    }

    setStep(STEPS[stepIndex + 1])
  }

  function goBack() {
    if (stepIndex === 0) {
      router.push(`/preview/${projectId}`)
    } else {
      setStep(STEPS[stepIndex - 1])
    }
  }

  return (
    <div className="min-h-screen bg-gradient-hero pb-10">
      <div className="section-container max-w-lg mx-auto py-10">

        {/* Back */}
        <button
          type="button"
          onClick={goBack}
          className="flex items-center gap-1.5 text-sm font-medium text-navy-600 hover:text-amber-500 transition-colors mb-8"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          {stepIndex === 0 ? 'Retour à l\'aperçu' : 'Retour'}
        </button>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={[
                'h-2 rounded-full transition-all duration-300',
                i <= stepIndex ? 'bg-amber-400' : 'bg-cream-200',
                i === stepIndex ? 'w-8' : 'w-4',
              ].join(' ')} />
            </div>
          ))}
          <span className="text-xs text-navy-400 ml-2">
            Étape {stepIndex + 1} / {STEPS.length}
          </span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-cream-200 shadow-soft p-6 md:p-8">

          {step === 'plan' && (
            <div>
              <h1 className="font-serif text-2xl font-bold text-navy-800 mb-2">
                Choisissez votre formule
              </h1>
              <p className="text-navy-500 text-sm mb-8">
                Numérique disponible immédiatement · Livre imprimé sous 5 jours
              </p>
              <PricingSelector
                selectedType={productType}
                selectedFormat={bookFormat}
                onTypeChange={setProductType}
                onFormatChange={setBookFormat}
              />
            </div>
          )}

          {step === 'address' && (
            <div>
              <h1 className="font-serif text-2xl font-bold text-navy-800 mb-2">
                Adresse de livraison
              </h1>
              <p className="text-navy-500 text-sm mb-8">
                Livraison France métropolitaine uniquement · Délai 5 à 7 jours
              </p>
              <AddressForm
                value={address}
                onChange={setAddress}
                errors={addressErrors}
              />
            </div>
          )}

          {step === 'payment' && (
            <div>
              <h1 className="font-serif text-2xl font-bold text-navy-800 mb-2">
                Paiement sécurisé
              </h1>
              <p className="text-navy-500 text-sm mb-8">
                Vos données bancaires ne sont jamais stockées
              </p>

              {isSubmitting && !clientSecret ? (
                <div className="flex items-center justify-center h-32">
                  <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : submitError && !clientSecret ? (
                <div className="bg-terra-50 border border-terra-200 rounded-2xl p-4 flex items-start gap-3">
                  <AlertCircleIcon className="h-5 w-5 text-terra-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-terra-700 font-semibold text-sm">Erreur</p>
                    <p className="text-terra-600 text-sm mt-0.5">{submitError}</p>
                  </div>
                </div>
              ) : (
                <StripePaymentForm
                  clientSecret={clientSecret}
                  onReady={setCardReady}
                />
              )}
            </div>
          )}

          {/* Error banner */}
          {submitError && (step !== 'payment' || clientSecret) && (
            <div className="mt-4 bg-terra-50 border border-terra-200 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircleIcon className="h-5 w-5 text-terra-500 shrink-0 mt-0.5" />
              <p className="text-terra-600 text-sm">{submitError}</p>
            </div>
          )}

          {/* CTA */}
          <div className="mt-8">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={goNext}
              loading={isSubmitting}
              disabled={
                (step === 'plan' && !productType) ||
                (step === 'payment' && !!clientSecret && !cardReady)
              }
              rightIcon={<ArrowRightIcon className="h-4 w-4" />}
            >
              {isLastStep ? 'Confirmer et payer' : 'Continuer'}
            </Button>

            {isLastStep && (
              <p className="text-center text-xs text-navy-400 mt-3">
                En confirmant, vous acceptez nos{' '}
                <a href="/cgv" className="underline hover:text-amber-500">CGV</a>
              </p>
            )}
          </div>

          <TrustBadges />
        </div>
      </div>
    </div>
  )
}
