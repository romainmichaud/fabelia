'use client'

import type { ProjectFormData, Personality } from '@/types'

interface StepProps {
  formData: ProjectFormData
  onChange: (data: Partial<ProjectFormData>) => void
  errors:   Partial<Record<keyof ProjectFormData, string>>
}

const PERSONALITIES: {
  id:     Personality
  emoji:  string
  label:  string
  desc:   string
  color:  string
  bg:     string
}[] = [
  {
    id:    'brave',
    emoji: '⚔️',
    label: 'Courageux',
    desc:  'Qui n\'hésite jamais face au danger',
    color: 'text-terra-500',
    bg:    'bg-terra-300/20 border-terra-300',
  },
  {
    id:    'curious',
    emoji: '🔍',
    label: 'Curieux',
    desc:  'Qui pose mille questions et explore tout',
    color: 'text-amber-500',
    bg:    'bg-amber-50 border-amber-200',
  },
  {
    id:    'funny',
    emoji: '😄',
    label: 'Drôle',
    desc:  'Qui fait rire avec ses bêtises et remarques',
    color: 'text-navy-500',
    bg:    'bg-navy-600/10 border-navy-200',
  },
  {
    id:    'kind',
    emoji: '💛',
    label: 'Généreux',
    desc:  'Qui pense toujours aux autres en premier',
    color: 'text-gold-500',
    bg:    'bg-gold-300/20 border-gold-300',
  },
  {
    id:    'creative',
    emoji: '🎨',
    label: 'Créatif',
    desc:  'Qui invente, dessine et imagine sans cesse',
    color: 'text-purple-600',
    bg:    'bg-purple-50 border-purple-200',
  },
  {
    id:    'adventurous',
    emoji: '🌍',
    label: 'Aventurier',
    desc:  'Qui aime partir à la découverte de l\'inconnu',
    color: 'text-forest-500',
    bg:    'bg-forest-100 border-forest-200',
  },
]

const MAX_PERSONALITIES = 2

export function PersonalityStep({ formData, onChange, errors }: StepProps) {
  const selected = formData.personalities ?? []

  function toggle(id: Personality) {
    let next: Personality[]
    if (selected.includes(id)) {
      next = selected.filter(p => p !== id)
    } else if (selected.length < MAX_PERSONALITIES) {
      next = [...selected, id]
    } else {
      // Replace the first one
      next = [selected[1], id]
    }
    onChange({ personalities: next })
  }

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-10">
        <p className="text-amber-500 font-medium text-sm tracking-widest uppercase mb-3">
          Étape 4 · La personnalité
        </p>
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy-800 mb-3">
          Qui est vraiment{' '}
          <span className="text-gradient-amber">
            {formData.childName || 'votre héros'}
          </span> ?
        </h2>
        <p className="text-navy-600 max-w-md mx-auto">
          Choisissez jusqu'à <strong>2 traits</strong> qui lui ressemblent le plus.
          L'aventure sera façonnée autour de sa personnalité.
        </p>
      </div>

      {/* Counter */}
      <div className="flex justify-center mb-8">
        <div className="flex gap-2 items-center bg-cream-100 rounded-full px-4 py-2 border border-cream-200">
          {[0, 1].map(i => (
            <div
              key={i}
              className={[
                'h-2 w-8 rounded-full transition-all duration-300',
                selected.length > i ? 'bg-amber-400' : 'bg-cream-300',
              ].join(' ')}
            />
          ))}
          <span className="text-xs text-navy-500 ml-1">
            {selected.length}/{MAX_PERSONALITIES} sélectionné{selected.length > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Error */}
      {errors.personalities && (
        <div className="mb-6 p-4 rounded-2xl bg-terra-300/20 border border-terra-300 text-terra-600 text-sm text-center">
          {errors.personalities}
        </div>
      )}

      {/* Personality grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {PERSONALITIES.map(({ id, emoji, label, desc, color, bg }) => {
          const isSelected = selected.includes(id)
          const isDisabled = !isSelected && selected.length >= MAX_PERSONALITIES

          return (
            <button
              key={id}
              type="button"
              onClick={() => toggle(id)}
              disabled={isDisabled}
              className={[
                'relative rounded-2xl p-5 text-left border-2 transition-all duration-200',
                isSelected
                  ? `${bg} scale-[1.03] shadow-soft`
                  : isDisabled
                    ? 'bg-cream-50 border-cream-200 opacity-40 cursor-not-allowed'
                    : `bg-white border-cream-200 hover:${bg} hover:scale-[1.02] hover:shadow-soft`,
              ].join(' ')}
            >
              <span className={`text-3xl block mb-3 transition-transform duration-200 ${isSelected ? 'scale-125' : ''}`}>
                {emoji}
              </span>
              <p className={`font-serif font-semibold text-sm mb-1 ${isSelected ? color : 'text-navy-800'}`}>
                {label}
              </p>
              <p className="text-xs text-navy-500 leading-relaxed">
                {desc}
              </p>
              {isSelected && (
                <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-amber-400 flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">✓</span>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Story preview */}
      {selected.length > 0 && (
        <div className="mt-8 p-5 bg-amber-50 border border-amber-200 rounded-3xl animate-fade-up">
          <p className="text-xs font-bold text-amber-500 tracking-widest uppercase mb-2">
            Extrait de votre histoire
          </p>
          <p className="font-serif text-navy-700 italic leading-relaxed text-sm">
            "{formData.childName || 'L\'enfant'}{' '}
            {selected.includes('brave')
              ? 'avança sans hésiter, le cœur plein de courage,'
              : selected.includes('curious')
                ? 'observa chaque détail avec ses yeux pétillants de curiosité,'
                : selected.includes('funny')
                  ? 'lança une plaisanterie qui fit rire même les oiseaux,'
                  : selected.includes('kind')
                    ? 'tendit la main à la créature blessée sans réfléchir,'
                    : selected.includes('creative')
                      ? 'inventa une solution que personne n\'aurait imaginée,'
                      : 'se lança dans l\'inconnu sans regarder derrière lui,'
            }{' '}
            et c'est ainsi que commença la plus grande aventure de sa vie…"
          </p>
        </div>
      )}
    </div>
  )
}
