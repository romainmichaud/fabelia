'use client'

import type { ProjectFormData, BookTheme } from '@/types'

interface StepProps {
  formData: ProjectFormData
  onChange: (data: Partial<ProjectFormData>) => void
  errors:   Partial<Record<keyof ProjectFormData, string>>
}

const THEMES: {
  id:      BookTheme
  emoji:   string
  label:   string
  tagline: string
  desc:    string
  bg:      string
  border:  string
  text:    string
  badge:   string
}[] = [
  {
    id:      'space',
    emoji:   '🚀',
    label:   'Espace',
    tagline: 'Aux confins de l\'univers',
    desc:    'Comètes, galaxies et planètes inconnues attendent votre héros.',
    bg:      'bg-navy-800',
    border:  'border-navy-700',
    text:    'text-white',
    badge:   'bg-blue-500',
  },
  {
    id:      'ocean',
    emoji:   '🐋',
    label:   'Océan',
    tagline: 'Au fond des mers mystérieuses',
    desc:    'Dauphins, trésors engloutis et créatures des profondeurs.',
    bg:      'bg-blue-700',
    border:  'border-blue-600',
    text:    'text-white',
    badge:   'bg-cyan-400',
  },
  {
    id:      'forest',
    emoji:   '🦊',
    label:   'Forêt enchantée',
    tagline: 'Là où les arbres parlent',
    desc:    'Fées, créatures magiques et secrets millénaires vous y attendent.',
    bg:      'bg-forest-500',
    border:  'border-forest-400',
    text:    'text-white',
    badge:   'bg-amber-400',
  },
  {
    id:      'castle',
    emoji:   '🐉',
    label:   'Château',
    tagline: 'Un royaume à sauver',
    desc:    'Dragons, chevaliers et princesses dans un monde de magie.',
    bg:      'bg-purple-700',
    border:  'border-purple-600',
    text:    'text-white',
    badge:   'bg-gold-400',
  },
  {
    id:      'jungle',
    emoji:   '🦜',
    label:   'Jungle',
    tagline: 'L\'appel de la nature sauvage',
    desc:    'Animaux exotiques, lianes et mystères dans la jungle profonde.',
    bg:      'bg-amber-600',
    border:  'border-amber-500',
    text:    'text-white',
    badge:   'bg-green-400',
  },
  {
    id:      'desert',
    emoji:   '🦅',
    label:   'Désert',
    tagline: 'Dunes et cités perdues',
    desc:    'Caravanes, trésors cachés et esprits du sable dans un désert magique.',
    bg:      'bg-terra-500',
    border:  'border-terra-400',
    text:    'text-white',
    badge:   'bg-yellow-300',
  },
]

export function ThemeStep({ formData, onChange, errors }: StepProps) {
  const selected = formData.theme

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-10">
        <p className="text-amber-500 font-medium text-sm tracking-widest uppercase mb-3">
          Étape 1 · L'aventure commence ici
        </p>
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy-800 mb-3">
          Quel univers pour l'aventure ?
        </h2>
        <p className="text-navy-600 max-w-md mx-auto">
          Choisissez l'univers qui fera briller les yeux de votre enfant.
          Le thème guide toute l'histoire.
        </p>
      </div>

      {/* Error */}
      {errors.theme && (
        <div className="mb-6 p-4 rounded-2xl bg-terra-300/20 border border-terra-300 text-terra-600 text-sm text-center">
          {errors.theme}
        </div>
      )}

      {/* Theme grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {THEMES.map(({ id, emoji, label, tagline, desc, bg, border, text }) => {
          const isSelected = selected === id

          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange({ theme: id })}
              className={[
                'relative rounded-3xl overflow-hidden text-left transition-all duration-300',
                'border-2',
                isSelected
                  ? `${bg} ${border} scale-[1.03] shadow-book ring-2 ring-amber-400 ring-offset-2`
                  : `${bg} ${border} opacity-80 hover:opacity-100 hover:-translate-y-1 hover:shadow-soft-lg`,
              ].join(' ')}
            >
              <div className="p-5 flex flex-col gap-3 min-h-[160px]">
                {/* Emoji */}
                <span
                  className={`text-4xl transition-transform duration-300 ${isSelected ? 'scale-125' : ''}`}
                >
                  {emoji}
                </span>

                {/* Label */}
                <div>
                  <p className={`font-serif font-bold text-base ${text}`}>
                    {label}
                  </p>
                  <p className={`text-xs opacity-70 mt-0.5 ${text}`}>
                    {tagline}
                  </p>
                </div>

                {/* Description (shown on hover/selected on desktop) */}
                <p className={`text-xs leading-relaxed opacity-0 group-hover:opacity-100 md:hidden ${text}`}>
                  {desc}
                </p>

                {/* Checkmark */}
                {isSelected && (
                  <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-amber-400 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Selected info */}
      {selected && (
        <div className="mt-6 p-4 rounded-2xl bg-forest-100 border border-forest-200 flex items-center gap-3 animate-scale-in">
          <span className="text-2xl">
            {THEMES.find(t => t.id === selected)?.emoji}
          </span>
          <div>
            <p className="font-semibold text-forest-600 text-sm">
              Excellent choix !
            </p>
            <p className="text-forest-500 text-xs">
              {THEMES.find(t => t.id === selected)?.desc}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
