'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { BookCoverOption } from '@/types'
import { CheckIcon } from 'lucide-react'

interface CoverSelectorProps {
  covers:   BookCoverOption[]
  selected: string | null
  onChange: (id: string) => void
  childName?: string
}

export function CoverSelector({
  covers,
  selected,
  onChange,
  childName = 'Votre héros',
}: CoverSelectorProps) {
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <div>
      <div className="mb-6">
        <h3 className="font-serif text-xl font-bold text-navy-800 mb-1">
          Choisissez votre couverture
        </h3>
        <p className="text-navy-500 text-sm">
          4 styles différents ont été créés pour {childName}. Laquelle vous fait craquer ?
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {covers.map((cover, index) => {
          const isSelected = selected === cover.id
          const isHovered  = hovered === cover.id

          return (
            <button
              key={cover.id}
              type="button"
              onClick={() => onChange(cover.id)}
              onMouseEnter={() => setHovered(cover.id)}
              onMouseLeave={() => setHovered(null)}
              className={[
                'relative group rounded-2xl overflow-hidden',
                'transition-all duration-300 cursor-pointer',
                'border-2',
                isSelected
                  ? 'border-amber-400 scale-[1.04] shadow-book'
                  : 'border-transparent hover:border-amber-200 hover:scale-[1.02] hover:shadow-soft-lg',
              ].join(' ')}
              aria-label={`Couverture ${index + 1} : ${cover.label}`}
              aria-pressed={isSelected}
            >
              {/* Cover image */}
              <div className="aspect-[3/4] relative bg-gradient-to-br from-cream-100 to-cream-200">
                {cover.imageUrl ? (
                  <Image
                    src={cover.imageUrl}
                    alt={cover.label}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                ) : (
                  /* Placeholder cover */
                  <CoverPlaceholder
                    palette={cover.palette}
                    childName={childName}
                    label={cover.label}
                    index={index}
                  />
                )}

                {/* Overlay on hover */}
                <div
                  className={[
                    'absolute inset-0 bg-navy-900/20 transition-opacity duration-200',
                    isHovered && !isSelected ? 'opacity-100' : 'opacity-0',
                  ].join(' ')}
                />

                {/* Selected checkmark */}
                {isSelected && (
                  <div className="absolute top-2 right-2 h-7 w-7 rounded-full bg-amber-400 shadow-warm flex items-center justify-center animate-scale-in">
                    <CheckIcon className="h-4 w-4 text-white stroke-[2.5]" />
                  </div>
                )}

                {/* Label badge */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                  <p className="text-white text-xs font-medium text-center">
                    {cover.label}
                  </p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {selected && (
        <div className="mt-4 flex items-center gap-2 text-sm text-forest-600 animate-fade-in">
          <CheckIcon className="h-4 w-4 text-forest-500" />
          <span>
            Couverture sélectionnée :{' '}
            <strong>{covers.find(c => c.id === selected)?.label}</strong>
          </span>
        </div>
      )}
    </div>
  )
}

// ============================================================
// PLACEHOLDER COVER (when no image URL)
// ============================================================
function CoverPlaceholder({
  palette,
  childName,
  label,
  index,
}: {
  palette:   BookCoverOption['palette']
  childName: string
  label:     string
  index:     number
}) {
  const EMOJIS = ['🌟', '🌙', '🌈', '⭐']

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-between p-4"
      style={{ backgroundColor: palette.primary }}
    >
      {/* Top decoration */}
      <div className="flex gap-1 self-end">
        {['✦', '✧'].map((s, i) => (
          <span key={i} style={{ color: palette.accent }} className="text-xs opacity-80">{s}</span>
        ))}
      </div>

      {/* Center illustration */}
      <div
        className="h-16 w-16 rounded-full flex items-center justify-center text-3xl"
        style={{ backgroundColor: `${palette.accent}30` }}
      >
        {EMOJIS[index]}
      </div>

      {/* Title */}
      <div className="text-center">
        <p
          className="font-serif text-xs tracking-widest uppercase mb-0.5"
          style={{ color: palette.accent }}
        >
          L'aventure de
        </p>
        <p
          className="font-serif font-bold text-sm leading-tight"
          style={{ color: palette.secondary }}
        >
          {childName}
        </p>
      </div>
    </div>
  )
}
