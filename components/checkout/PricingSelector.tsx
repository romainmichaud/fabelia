'use client'

import { CheckCircleIcon, ZapIcon, PackageIcon, LayersIcon } from 'lucide-react'
import type { ProductType, BookFormat } from '@/types'

interface PricingSelectorProps {
  selectedType:    ProductType | null
  selectedFormat:  BookFormat  | null
  onTypeChange:    (type:   ProductType) => void
  onFormatChange:  (format: BookFormat)  => void
}

const PLANS = [
  {
    id:          'digital' as ProductType,
    name:        'Numérique',
    icon:        <ZapIcon className="h-5 w-5" />,
    price:       19,
    oldPrice:    null,
    badge:       null,
    highlighted: false,
    desc:        'Accès immédiat · PDF téléchargeable',
    features: [
      'Histoire complète (30 pages)',
      'Lecture feuilletable en ligne',
      'PDF haute qualité',
      'Accès illimité à vie',
      'Disponible en 2 minutes',
    ],
    unavailable: [],
  },
  {
    id:          'bundle' as ProductType,
    name:        'Premium',
    icon:        <LayersIcon className="h-5 w-5" />,
    price:       44,
    oldPrice:    54,
    badge:       '⭐ Le plus populaire',
    highlighted: true,
    desc:        'Livre imprimé + version numérique',
    features: [
      'Tout le numérique inclus',
      'Livre couverture rigide',
      'Papier recyclé 170g',
      'Impression en France',
      'Livraison offerte',
      'Emballage cadeau',
    ],
    unavailable: [],
  },
  {
    id:          'print' as ProductType,
    name:        'Livre seul',
    icon:        <PackageIcon className="h-5 w-5" />,
    price:       34,
    oldPrice:    null,
    badge:       null,
    highlighted: false,
    desc:        'Uniquement le livre imprimé',
    features: [
      'Livre couverture rigide',
      'Papier recyclé 170g',
      'Impression en France',
      'Livraison en France',
    ],
    unavailable: ['Numérique non inclus'],
  },
]

const FORMATS: { id: BookFormat; label: string; desc: string; surcharge: number }[] = [
  { id: 'softcover', label: 'Couverture souple', desc: 'Légère et pratique',     surcharge: 0  },
  { id: 'hardcover', label: 'Couverture rigide', desc: 'Solide et premium +5€',  surcharge: 5  },
]

export function PricingSelector({
  selectedType,
  selectedFormat,
  onTypeChange,
  onFormatChange,
}: PricingSelectorProps) {
  const needsFormat = selectedType === 'print' || selectedType === 'bundle'
  const formatSurcharge = needsFormat && selectedFormat === 'hardcover' ? 5 : 0
  const basePrice = PLANS.find(p => p.id === selectedType)?.price ?? 0
  const totalPrice = basePrice + formatSurcharge

  return (
    <div className="space-y-8">

      {/* Plan selection */}
      <div>
        <h3 className="font-serif text-lg font-bold text-navy-800 mb-4">
          Choisissez votre formule
        </h3>

        <div className="grid md:grid-cols-3 gap-4">
          {PLANS.map(({ id, name, icon, price, oldPrice, badge, highlighted, desc, features, unavailable }) => {
            const isSelected = selectedType === id

            return (
              <button
                key={id}
                type="button"
                onClick={() => onTypeChange(id)}
                className={[
                  'relative rounded-3xl p-5 text-left flex flex-col gap-4 border-2',
                  'transition-all duration-200 cursor-pointer',
                  isSelected
                    ? highlighted
                      ? 'bg-navy-800 border-amber-400 text-white scale-[1.02] shadow-book'
                      : 'bg-white border-amber-400 scale-[1.02] shadow-warm'
                    : highlighted
                      ? 'bg-navy-800/80 border-navy-700 text-white hover:border-amber-300'
                      : 'bg-white border-cream-200 hover:border-amber-200 hover:shadow-soft',
                ].join(' ')}
              >
                {/* Badge */}
                {badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-amber text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-warm">
                    {badge}
                  </span>
                )}

                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className={`inline-flex items-center justify-center h-9 w-9 rounded-xl
                    ${isSelected && highlighted ? 'bg-amber-400/20' :
                      highlighted ? 'bg-white/10' : 'bg-cream-100'}`}>
                    <span className={highlighted ? 'text-amber-400' : 'text-amber-500'}>
                      {icon}
                    </span>
                  </div>

                  {/* Selected check */}
                  {isSelected && (
                    <div className="h-5 w-5 rounded-full bg-amber-400 flex items-center justify-center shrink-0">
                      <span className="text-white text-[10px] font-bold">✓</span>
                    </div>
                  )}
                </div>

                {/* Name */}
                <div>
                  <p className={`font-serif font-bold text-lg leading-tight
                    ${highlighted ? 'text-white' : 'text-navy-800'}`}>
                    {name}
                  </p>
                  <p className={`text-xs mt-0.5 ${highlighted ? 'text-cream-300' : 'text-navy-500'}`}>
                    {desc}
                  </p>
                </div>

                {/* Price */}
                <div className="flex items-end gap-1.5">
                  <span className={`font-serif text-3xl font-bold
                    ${highlighted ? 'text-white' : 'text-navy-800'}`}>
                    {price}€
                  </span>
                  {oldPrice && (
                    <span className={`text-sm line-through mb-1
                      ${highlighted ? 'text-cream-400' : 'text-navy-400'}`}>
                      {oldPrice}€
                    </span>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-1.5 flex-1">
                  {features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-xs">
                      <CheckCircleIcon
                        className={`h-3.5 w-3.5 shrink-0 mt-0.5
                          ${highlighted ? 'text-amber-400' : 'text-forest-400'}`}
                      />
                      <span className={highlighted ? 'text-cream-200' : 'text-navy-700'}>{f}</span>
                    </li>
                  ))}
                  {unavailable.map(f => (
                    <li key={f} className="flex items-start gap-2 text-xs opacity-40">
                      <span className="h-3.5 w-3.5 shrink-0 mt-0.5 text-center">×</span>
                      <span className={highlighted ? 'text-cream-300' : 'text-navy-500'}>{f}</span>
                    </li>
                  ))}
                </ul>
              </button>
            )
          })}
        </div>
      </div>

      {/* Format selection (only for print/bundle) */}
      {needsFormat && (
        <div className="animate-fade-up">
          <h3 className="font-serif text-lg font-bold text-navy-800 mb-4">
            Format du livre
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {FORMATS.map(({ id, label, desc }) => {
              const isSelected = selectedFormat === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onFormatChange(id)}
                  className={[
                    'rounded-2xl p-4 text-left border-2 transition-all duration-200',
                    isSelected
                      ? 'border-amber-400 bg-amber-50 scale-[1.02]'
                      : 'border-cream-200 bg-white hover:border-amber-200',
                  ].join(' ')}
                >
                  <p className={`font-semibold text-sm mb-0.5 ${isSelected ? 'text-amber-600' : 'text-navy-800'}`}>
                    {label}
                  </p>
                  <p className="text-navy-500 text-xs">{desc}</p>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Price summary */}
      {selectedType && (
        <div className="animate-fade-up bg-gradient-warm rounded-3xl border border-cream-200 p-5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-navy-600">
              {PLANS.find(p => p.id === selectedType)?.name}
            </span>
            <span className="font-semibold text-navy-800">{basePrice}€</span>
          </div>
          {formatSurcharge > 0 && (
            <div className="flex items-center justify-between mb-1 text-sm text-navy-500">
              <span>Supplément couverture rigide</span>
              <span>+{formatSurcharge}€</span>
            </div>
          )}
          <div className="border-t border-cream-300 mt-3 pt-3 flex items-center justify-between">
            <span className="font-serif font-bold text-navy-800">Total</span>
            <span className="font-serif text-2xl font-bold text-navy-800">{totalPrice}€</span>
          </div>
          <p className="text-xs text-navy-400 mt-1 text-right">TVA incluse</p>
        </div>
      )}
    </div>
  )
}
