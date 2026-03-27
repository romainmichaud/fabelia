'use client'

import type { ProjectFormData, HairColor, EyeColor, SkinTone } from '@/types'

interface StepProps {
  formData: ProjectFormData
  onChange: (data: Partial<ProjectFormData>) => void
  errors:   Partial<Record<keyof ProjectFormData, string>>
}

const HAIR_COLORS: { id: HairColor; label: string; hex: string; emoji: string }[] = [
  { id: 'blond',    label: 'Blond',    hex: '#F5D58A', emoji: '👱' },
  { id: 'chestnut', label: 'Châtain',  hex: '#8B5E3C', emoji: '🟤' },
  { id: 'dark',     label: 'Brun',     hex: '#3D2B1F', emoji: '⬛' },
  { id: 'red',      label: 'Roux',     hex: '#C0472C', emoji: '🟠' },
  { id: 'gray',     label: 'Gris',     hex: '#B0B0B0', emoji: '⬜' },
]

const EYE_COLORS: { id: EyeColor; label: string; hex: string }[] = [
  { id: 'blue',   label: 'Bleu',       hex: '#5B9BD5' },
  { id: 'green',  label: 'Vert',       hex: '#4CAF6B' },
  { id: 'brown',  label: 'Marron',     hex: '#8B5E3C' },
  { id: 'hazel',  label: 'Noisette',   hex: '#9B7D4F' },
  { id: 'gray',   label: 'Gris',       hex: '#8C9CAD' },
]

const SKIN_TONES: { id: SkinTone; label: string; hex: string }[] = [
  { id: 'light',        label: 'Clair',       hex: '#FFDBB4' },
  { id: 'medium-light', label: 'Moyen clair', hex: '#E8C49A' },
  { id: 'medium',       label: 'Moyen',       hex: '#C68642' },
  { id: 'medium-dark',  label: 'Foncé',       hex: '#8D5524' },
  { id: 'dark',         label: 'Très foncé',  hex: '#4C2E10' },
]

function ColorSwatch({
  hex,
  label,
  selected,
  onClick,
}: {
  hex:      string
  label:    string
  selected: boolean
  onClick:  () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={[
        'relative flex flex-col items-center gap-1.5 group',
        'transition-all duration-200',
      ].join(' ')}
    >
      <div
        className={[
          'h-10 w-10 rounded-full border-4 transition-all duration-200',
          selected
            ? 'border-amber-400 scale-125 shadow-warm'
            : 'border-transparent hover:border-cream-300 hover:scale-110',
        ].join(' ')}
        style={{ backgroundColor: hex }}
      />
      <span className={`text-xs font-medium transition-colors ${selected ? 'text-amber-500' : 'text-navy-500'}`}>
        {label}
      </span>
      {selected && (
        <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-amber-400 rounded-full flex items-center justify-center">
          <span className="text-white text-[8px] font-bold">✓</span>
        </span>
      )}
    </button>
  )
}

// ============================================================
// AVATAR PREVIEW
// ============================================================
function AvatarPreview({ formData }: { formData: ProjectFormData }) {
  const gender = formData.childGender ?? 'neutral'
  const emoji  = gender === 'girl' ? '👧' : gender === 'boy' ? '👦' : '🧒'

  return (
    <div className="flex flex-col items-center gap-3 p-6 bg-gradient-warm rounded-3xl border border-cream-200">
      <p className="text-xs font-medium text-navy-500 tracking-widest uppercase">
        Aperçu
      </p>
      <div
        className="text-6xl transition-all duration-300"
        style={{
          filter: formData.skinTone
            ? `hue-rotate(${
                formData.skinTone === 'light'        ? '0' :
                formData.skinTone === 'medium-light' ? '10' :
                formData.skinTone === 'medium'       ? '20' :
                formData.skinTone === 'medium-dark'  ? '30' : '40'
              }deg)`
            : undefined,
        }}
      >
        {emoji}
      </div>
      <div className="flex gap-2">
        {formData.hairColor && (
          <div
            className="h-4 w-4 rounded-full border-2 border-white shadow-sm"
            style={{ backgroundColor: HAIR_COLORS.find(h => h.id === formData.hairColor)?.hex }}
            title={`Cheveux : ${HAIR_COLORS.find(h => h.id === formData.hairColor)?.label}`}
          />
        )}
        {formData.eyeColor && (
          <div
            className="h-4 w-4 rounded-full border-2 border-white shadow-sm"
            style={{ backgroundColor: EYE_COLORS.find(e => e.id === formData.eyeColor)?.hex }}
            title={`Yeux : ${EYE_COLORS.find(e => e.id === formData.eyeColor)?.label}`}
          />
        )}
        {formData.skinTone && (
          <div
            className="h-4 w-4 rounded-full border-2 border-white shadow-sm"
            style={{ backgroundColor: SKIN_TONES.find(s => s.id === formData.skinTone)?.hex }}
            title={`Teint : ${SKIN_TONES.find(s => s.id === formData.skinTone)?.label}`}
          />
        )}
      </div>
      <p className="text-xs text-navy-500">
        {formData.childName || 'Votre héros'}
      </p>
    </div>
  )
}

// ============================================================
// COMPONENT
// ============================================================
export function PortraitStep({ formData, onChange, errors }: StepProps) {
  return (
    <div>
      {/* Header */}
      <div className="text-center mb-10">
        <p className="text-amber-500 font-medium text-sm tracking-widest uppercase mb-3">
          Étape 3 · Le portrait
        </p>
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy-800 mb-3">
          À quoi ressemble{' '}
          <span className="text-gradient-amber">
            {formData.childName || 'votre héros'}
          </span> ?
        </h2>
        <p className="text-navy-600 max-w-md mx-auto">
          Ces détails permettront d'illustrer fidèlement votre enfant dans le livre.
        </p>
      </div>

      <div className="grid md:grid-cols-[1fr_auto] gap-8 items-start">

        {/* Form */}
        <div className="space-y-8">

          {/* Hair color */}
          <div>
            <label className="block text-sm font-semibold text-navy-700 mb-4">
              Couleur des cheveux *
            </label>
            <div className="flex flex-wrap gap-6">
              {HAIR_COLORS.map(({ id, label, hex }) => (
                <ColorSwatch
                  key={id}
                  hex={hex}
                  label={label}
                  selected={formData.hairColor === id}
                  onClick={() => onChange({ hairColor: id })}
                />
              ))}
            </div>
            {errors.hairColor && (
              <p className="mt-2 text-terra-500 text-sm">{errors.hairColor}</p>
            )}
          </div>

          {/* Eye color */}
          <div>
            <label className="block text-sm font-semibold text-navy-700 mb-4">
              Couleur des yeux *
            </label>
            <div className="flex flex-wrap gap-6">
              {EYE_COLORS.map(({ id, label, hex }) => (
                <ColorSwatch
                  key={id}
                  hex={hex}
                  label={label}
                  selected={formData.eyeColor === id}
                  onClick={() => onChange({ eyeColor: id })}
                />
              ))}
            </div>
            {errors.eyeColor && (
              <p className="mt-2 text-terra-500 text-sm">{errors.eyeColor}</p>
            )}
          </div>

          {/* Skin tone */}
          <div>
            <label className="block text-sm font-semibold text-navy-700 mb-4">
              Teint *
            </label>
            <div className="flex flex-wrap gap-6">
              {SKIN_TONES.map(({ id, label, hex }) => (
                <ColorSwatch
                  key={id}
                  hex={hex}
                  label={label}
                  selected={formData.skinTone === id}
                  onClick={() => onChange({ skinTone: id })}
                />
              ))}
            </div>
            {errors.skinTone && (
              <p className="mt-2 text-terra-500 text-sm">{errors.skinTone}</p>
            )}
          </div>

          {/* Glasses */}
          <div>
            <label className="block text-sm font-semibold text-navy-700 mb-3">
              Porte-t-il des lunettes ?
            </label>
            <div className="flex gap-3">
              {[
                { val: true,  label: 'Oui 👓', },
                { val: false, label: 'Non',    },
              ].map(({ val, label }) => (
                <button
                  key={String(val)}
                  type="button"
                  onClick={() => onChange({ hasGlasses: val })}
                  className={[
                    'px-5 py-2.5 rounded-full text-sm font-medium border-2 transition-all duration-200',
                    formData.hasGlasses === val
                      ? 'border-amber-400 bg-amber-50 text-amber-600 scale-105'
                      : 'border-cream-200 bg-white text-navy-700 hover:border-amber-200',
                  ].join(' ')}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="md:w-40">
          <AvatarPreview formData={formData} />
        </div>
      </div>
    </div>
  )
}
