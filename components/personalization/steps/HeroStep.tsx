'use client'

import type { ProjectFormData } from '@/types'

interface StepProps {
  formData: ProjectFormData
  onChange: (data: Partial<ProjectFormData>) => void
  errors:   Partial<Record<keyof ProjectFormData, string>>
}

const AGE_OPTIONS = [2, 3, 4, 5, 6, 7, 8, 9, 10]

const GENDER_OPTIONS: {
  id:    'boy' | 'girl' | 'neutral'
  emoji: string
  label: string
  desc:  string
}[] = [
  { id: 'boy',     emoji: '👦', label: 'Garçon',   desc: 'Il, son héros' },
  { id: 'girl',    emoji: '👧', label: 'Fille',     desc: 'Elle, son héroïne' },
  { id: 'neutral', emoji: '🧒', label: 'Neutre',    desc: 'Un héros universel' },
]

export function HeroStep({ formData, onChange, errors }: StepProps) {
  const childName   = formData.childName   ?? ''
  const childAge    = formData.childAge
  const childGender = formData.childGender

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-10">
        <p className="text-amber-500 font-medium text-sm tracking-widest uppercase mb-3">
          Étape 2 · Le héros
        </p>
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy-800 mb-3">
          Qui est votre héros ?
        </h2>
        <p className="text-navy-600 max-w-md mx-auto">
          Son prénom apparaîtra à chaque page de l'histoire.
          L'aventure sera faite sur mesure pour lui.
        </p>
      </div>

      <div className="space-y-8">

        {/* Prénom */}
        <div>
          <label className="block text-sm font-semibold text-navy-700 mb-2" htmlFor="childName">
            Comment s'appelle-t-il ? *
          </label>
          <div className="relative">
            <input
              id="childName"
              type="text"
              value={childName}
              onChange={e => onChange({ childName: e.target.value })}
              placeholder="ex: Emma, Lucas, Chloé…"
              maxLength={20}
              className={[
                'form-input text-lg',
                errors.childName ? 'border-terra-400 focus:border-terra-400' : '',
              ].join(' ')}
              autoFocus
              autoComplete="given-name"
            />
            {childName && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-forest-100 flex items-center justify-center">
                <span className="text-forest-500 text-xs font-bold">✓</span>
              </div>
            )}
          </div>
          {errors.childName && (
            <p className="mt-2 text-terra-500 text-sm">{errors.childName}</p>
          )}

          {/* Live preview */}
          {childName && (
            <div className="mt-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl animate-fade-in">
              <p className="text-amber-700 text-sm">
                ✨ "<span className="font-bold">{childName}</span> regarda au loin les étoiles et sut
                que l'aventure l'appelait…"
              </p>
            </div>
          )}
        </div>

        {/* Âge */}
        <div>
          <label className="block text-sm font-semibold text-navy-700 mb-3">
            Quel âge a-t-il ? *
          </label>
          <div className="flex flex-wrap gap-2">
            {AGE_OPTIONS.map(age => (
              <button
                key={age}
                type="button"
                onClick={() => onChange({ childAge: age })}
                className={[
                  'h-11 w-11 rounded-2xl font-semibold text-sm transition-all duration-200',
                  childAge === age
                    ? 'bg-gradient-amber text-white shadow-warm scale-110'
                    : 'bg-cream-100 border border-cream-200 text-navy-700 hover:border-amber-300 hover:bg-amber-50',
                ].join(' ')}
              >
                {age}
              </button>
            ))}
            <span className="h-11 flex items-center text-navy-400 text-sm px-1">ans</span>
          </div>
          {errors.childAge && (
            <p className="mt-2 text-terra-500 text-sm">{errors.childAge}</p>
          )}

          {/* Age-based complexity note */}
          {childAge && (
            <p className="mt-2 text-xs text-navy-500">
              {childAge <= 4
                ? '📚 Histoire courte et simple, avec beaucoup d\'illustrations'
                : childAge <= 7
                  ? '📖 Histoire équilibrée avec des aventures adaptées'
                  : '📕 Histoire riche avec des rebondissements et du vocabulaire élaboré'
              }
            </p>
          )}
        </div>

        {/* Genre */}
        <div>
          <label className="block text-sm font-semibold text-navy-700 mb-3">
            Votre héros est… *
          </label>
          <div className="grid grid-cols-3 gap-3">
            {GENDER_OPTIONS.map(({ id, emoji, label, desc }) => {
              const isSelected = childGender === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onChange({ childGender: id })}
                  className={[
                    'rounded-2xl p-4 text-center flex flex-col items-center gap-2',
                    'border-2 transition-all duration-200',
                    isSelected
                      ? 'border-amber-400 bg-amber-50 scale-105'
                      : 'border-cream-200 bg-white hover:border-amber-200 hover:bg-cream-50',
                  ].join(' ')}
                >
                  <span className="text-3xl">{emoji}</span>
                  <div>
                    <p className={`text-sm font-semibold ${isSelected ? 'text-amber-600' : 'text-navy-800'}`}>
                      {label}
                    </p>
                    <p className="text-xs text-navy-500">{desc}</p>
                  </div>
                </button>
              )
            })}
          </div>
          {errors.childGender && (
            <p className="mt-2 text-terra-500 text-sm">{errors.childGender}</p>
          )}
        </div>
      </div>
    </div>
  )
}
