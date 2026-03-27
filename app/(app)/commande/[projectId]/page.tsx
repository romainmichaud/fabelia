'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { PricingSelector } from '@/components/checkout/PricingSelector'
import {
  LockIcon, ShieldCheckIcon, MapPinIcon, CreditCardIcon,
  ArrowRightIcon, ChevronLeftIcon,
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
      {field('first_name', 'Prénom',        'Emma',         true)}
      {field('last_name',  'Nom',            'Dupont',       true)}
      {field('line1',      'Adresse',        '12 rue des Lilas')}
      {field('line2',      'Complément',     'Apt. 3B')}
      {field('postal_code','Code postal',   '75001',        true)}
      {field('city',       'Ville',          'Paris',        true)}

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
// PAYMENT FORM (Stripe Elements placeholder)
// ============================================================
function PaymentForm() {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-navy-700 mb-2">
          Numéro de carte
        </label>
        <div className="form-input flex items-center gap-3 bg-cream-50">
          <CreditCardIcon className="h-5 w-5 text-navy-300 shrink-0" />
          <span className="text-navy-300 text-sm">•••• •••• •••• ••••</span>
          <div className="ml-auto flex gap-2">
            {['💳', '🍎'].map(e => (
              <span key={e} className="text-lg">{e}</span>
            ))}
          </div>
        </div>
        <p className="text-xs text-navy-400 mt-1">
          Stripe Elements s'affiche ici en production
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-navy-700 mb-2">
            Expiration
          </label>
          <div className="form-input bg-cream-50 text-navy-300 text-sm">
            MM / AA
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-navy-700 mb-2">
            CVV
          </label>
          <div className="form-input bg-cream-50 text-navy-300 text-sm">
            •••
          </div>
        </div>
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
        { icon: <LockIcon className="h-4 w-4" />,         label: 'Paiement chiffré SSL' },
        { icon: <ShieldCheckIcon className="h-4 w-4" />,  label: 'Stripe certifié PCI' },
        { icon: <MapPinIcon className="h-4 w-4" />,       label: 'Données en France' },
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

  const needsAddress = productType === 'print' || productType === 'bundle'

  const STEPS: CheckoutStep[] = needsAddress
    ? ['plan', 'address', 'payment']
    : ['plan', 'payment']

  const stepIndex   = STEPS.indexOf(step)
  const isLastStep  = stepIndex === STEPS.length - 1

  function validateAddress(): boolean {
    const errs: typeof addressErrors = {}
    if (!address.first_name?.trim()) errs.first_name = 'Requis'
    if (!address.last_name?.trim())  errs.last_name  = 'Requis'
    if (!address.line1?.trim())      errs.line1      = 'Requis'
    if (!address.postal_code?.trim()) errs.postal_code = 'Requis'
    if (!address.city?.trim())       errs.city       = 'Requis'
    setAddressErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function goNext() {
    if (step === 'plan' && !productType) return
    if (step === 'address' && !validateAddress()) return

    if (isLastStep) {
      setIsSubmitting(true)
      try {
        // Create order + payment intent
        const res = await fetch('/api/payments/create-intent', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ projectId, productType, bookFormat, address }),
        })
        const { data } = await res.json()
        // Normally: confirm stripe payment here, then redirect
        router.push(`/commande/${projectId}/confirmation`)
      } catch {
        setIsSubmitting(false)
      }
      return
    }

    const nextStep = STEPS[stepIndex + 1]
    setStep(nextStep)
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
              <PaymentForm />
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
              disabled={step === 'plan' && !productType}
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
