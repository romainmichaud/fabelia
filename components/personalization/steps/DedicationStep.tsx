'use client'

import { useState } from 'react'
import type { ProjectFormData } from '@/types'

interface StepProps {
  formData: ProjectFormData
  onChange: (data: Partial<ProjectFormData>) => void
  errors:   Partial<Record<keyof ProjectFormData, string>>
}

const MAX_CHARS = 200
const SUGGESTIONS = [
  'À ma petite étoile, qui illumine chaque journée. Avec tout mon amour.',
  'Pour toi, qui es le héros de notre vie depuis le premier jour.',
  'À mon aventurier préféré — que tes rêves soient aussi grands que le ciel.',
  'Parce que tu mérites une histoire aussi belle que toi.',
  'De la part de quelqu\'un qui t\'aime à l\'infini et au-delà.',
]

export function DedicationStep({ formData, onChange, errors }: StepProps) {
  const dedication  = formData.dedication  ?? ''
  const senderName  = formData.senderName  ?? ''
  const remaining   = MAX_CHARS - dedication.length
  const [showSuggestions, setShowSuggestions] = useState(false)

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-10">
        <p className="text-amber-500 font-medium text-sm tracking-widest uppercase mb-3">
          Étape 5 · La dédicace
        </p>
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy-800 mb-3">
          Un message du cœur
        </h2>
        <p className="text-navy-600 max-w-md mx-auto">
          Cette dédicace apparaîtra en ouverture du livre, en première page.
          Elle est <strong>facultative</strong> mais souvent la page préférée.
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">

        {/* Dédicace text area */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-navy-700">
              Votre message (facultatif)
            </label>
            <button
              type="button"
              onClick={() => setShowSuggestions(v => !v)}
              className="text-xs text-amber-500 hover:text-amber-600 font-medium underline underline-offset-2"
            >
              {showSuggestions ? 'Masquer les idées' : '💡 Besoin d\'inspiration ?'}
            </button>
          </div>

          {/* Suggestions */}
          {showSuggestions && (
            <div className="mb-4 space-y-2 animate-fade-up">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    onChange({ dedication: s })
                    setShowSuggestions(false)
                  }}
                  className="w-full text-left p-3 rounded-2xl bg-amber-50 border border-amber-200
                    text-sm text-navy-700 italic hover:bg-amber-100 hover:border-amber-300
                    transition-colors leading-relaxed"
                >
                  "{s}"
                </button>
              ))}
            </div>
          )}

          <div className="relative">
            <textarea
              value={dedication}
              onChange={e => onChange({ dedication: e.target.value.slice(0, MAX_CHARS) })}
              placeholder="ex: À ma petite étoile, que cette aventure t'inspire autant que tu nous inspires chaque jour…"
              rows={4}
              className={[
                'form-input resize-none',
                remaining < 20 ? 'border-terra-400' : '',
              ].join(' ')}
            />
            <span
              className={[
                'absolute bottom-3 right-4 text-xs font-medium',
                remaining < 20
                  ? 'text-terra-400'
                  : remaining < 50
                    ? 'text-amber-400'
                    : 'text-cream-400',
              ].join(' ')}
            >
              {remaining}
            </span>
          </div>
        </div>

        {/* Sender name */}
        <div>
          <label className="block text-sm font-semibold text-navy-700 mb-2">
            De la part de… (facultatif)
          </label>
          <input
            type="text"
            value={senderName}
            onChange={e => onChange({ senderName: e.target.value })}
            placeholder="ex: Maman & Papa, Mamie Françoise, Tata Marie…"
            maxLength={50}
            className="form-input"
          />
        </div>

        {/* Preview */}
        {(dedication || senderName) && (
          <div className="animate-fade-up">
            <p className="text-xs font-bold text-navy-400 tracking-widest uppercase mb-3">
              Aperçu de la page de dédicace
            </p>
            <div className="relative bg-cream-50 border border-cream-200 rounded-3xl p-8 shadow-soft overflow-hidden">
              {/* Decorative corner */}
              <div className="absolute top-0 left-0 w-16 h-16 bg-amber-100 rounded-br-[3rem]" />
              <div className="absolute bottom-0 right-0 w-16 h-16 bg-amber-100 rounded-tl-[3rem]" />

              <div className="relative text-center py-4">
                {dedication && (
                  <p className="font-serif text-navy-700 italic leading-relaxed text-base mb-4">
                    "{dedication}"
                  </p>
                )}
                {senderName && (
                  <p className="font-serif text-amber-600 font-semibold text-sm">
                    — {senderName}
                  </p>
                )}
                <div className="mt-4 flex justify-center gap-1 text-amber-300">
                  {['✦', '✧', '✦'].map((s, i) => (
                    <span key={i} className="text-sm">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Skip option */}
        {!dedication && (
          <p className="text-center text-sm text-navy-400">
            Vous pouvez laisser vide et continuer sans dédicace.
          </p>
        )}
      </div>
    </div>
  )
}
