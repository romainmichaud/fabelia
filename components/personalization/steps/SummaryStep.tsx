'use client'

import Link from 'next/link'
import type { ProjectFormData } from '@/types'
import { EditIcon } from 'lucide-react'

interface StepProps {
  formData: ProjectFormData
  onChange: (data: Partial<ProjectFormData>) => void
  errors:   Partial<Record<keyof ProjectFormData, string>>
}

const THEME_LABELS: Record<string, string> = {
  space:  '🚀 Espace',   ocean:  '🐋 Océan',
  forest: '🦊 Forêt',   castle: '🐉 Château',
  jungle: '🦜 Jungle',  desert: '🦅 Désert',
}
const GENDER_LABELS: Record<string, string> = {
  boy: 'Garçon 👦', girl: 'Fille 👧', neutral: 'Neutre 🧒',
}
const HAIR_LABELS: Record<string, string> = {
  blond: 'Blond', chestnut: 'Châtain', dark: 'Brun', red: 'Roux', gray: 'Gris',
}
const EYE_LABELS: Record<string, string> = {
  blue: 'Bleu', green: 'Vert', brown: 'Marron', hazel: 'Noisette', gray: 'Gris',
}
const SKIN_LABELS: Record<string, string> = {
  light: 'Clair', 'medium-light': 'Moyen clair', medium: 'Moyen',
  'medium-dark': 'Foncé', dark: 'Très foncé',
}
const PERSONALITY_LABELS: Record<string, string> = {
  brave: 'Courageux ⚔️', curious: 'Curieux 🔍', funny: 'Drôle 😄',
  kind: 'Généreux 💛', creative: 'Créatif 🎨', adventurous: 'Aventurier 🌍',
}

function SummaryRow({
  label,
  value,
}: {
  label:  string
  value:  React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-cream-100 last:border-0">
      <span className="text-sm text-navy-500 shrink-0 w-32">{label}</span>
      <span className="text-sm font-medium text-navy-800 text-right">{value}</span>
    </div>
  )
}

export function SummaryStep({ formData }: StepProps) {
  const {
    theme, childName, childAge, childGender,
    hairColor, eyeColor, skinTone, hasGlasses,
    personalities, dedication, senderName,
  } = formData

  const gender = childGender ?? 'neutral'
  const emoji  = gender === 'girl' ? '👧' : gender === 'boy' ? '👦' : '🧒'

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-10">
        <p className="text-amber-500 font-medium text-sm tracking-widest uppercase mb-3">
          Étape 6 · Récapitulatif
        </p>
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy-800 mb-3">
          Tout est prêt ?
        </h2>
        <p className="text-navy-600 max-w-md mx-auto">
          Vérifiez les informations avant de générer l'aperçu de votre livre.
          Vous pourrez voir un extrait avant d'acheter.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">

        {/* Hero preview card */}
        <div className="bg-gradient-warm border border-cream-200 rounded-3xl p-6 mb-6 flex items-center gap-5">
          <div className="text-6xl shrink-0">{emoji}</div>
          <div>
            <p className="font-serif text-2xl font-bold text-navy-800">
              {childName || '—'}
            </p>
            <p className="text-navy-600 text-sm">
              {childAge} ans · {THEME_LABELS[theme ?? ''] ?? '—'}
            </p>
            {personalities?.map(p => (
              <span
                key={p}
                className="inline-block mt-1.5 mr-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-600 text-xs font-medium"
              >
                {PERSONALITY_LABELS[p]}
              </span>
            ))}
          </div>
        </div>

        {/* Summary table */}
        <div className="bg-white border border-cream-200 rounded-3xl p-6 shadow-soft">
          <SummaryRow label="Thème"       value={THEME_LABELS[theme ?? ''] ?? '—'} />
          <SummaryRow label="Prénom"      value={childName    || '—'} />
          <SummaryRow label="Âge"         value={childAge ? `${childAge} ans` : '—'} />
          <SummaryRow label="Genre"       value={GENDER_LABELS[childGender ?? ''] ?? '—'} />
          <SummaryRow label="Cheveux"     value={HAIR_LABELS[hairColor ?? '']   ?? '—'} />
          <SummaryRow label="Yeux"        value={EYE_LABELS[eyeColor   ?? '']   ?? '—'} />
          <SummaryRow label="Teint"       value={SKIN_LABELS[skinTone  ?? '']   ?? '—'} />
          <SummaryRow label="Lunettes"    value={hasGlasses === true ? 'Oui 👓' : hasGlasses === false ? 'Non' : '—'} />
          <SummaryRow
            label="Personnalité"
            value={personalities?.length
              ? personalities.map(p => PERSONALITY_LABELS[p]).join(', ')
              : '—'
            }
          />
          <SummaryRow
            label="Dédicace"
            value={
              dedication
                ? <span className="italic text-navy-600 max-w-[200px] block truncate">"{dedication}"</span>
                : <span className="text-navy-400">Aucune</span>
            }
          />
          {senderName && (
            <SummaryRow label="De la part de" value={senderName} />
          )}
        </div>

        {/* What happens next */}
        <div className="mt-6 p-5 bg-forest-100 border border-forest-200 rounded-3xl">
          <p className="font-semibold text-forest-600 text-sm mb-3">
            🎬 Ce qui va se passer ensuite
          </p>
          <ul className="space-y-2 text-sm text-forest-700">
            <li className="flex gap-2">
              <span className="shrink-0">1.</span>
              Nous créons le <strong>premier chapitre</strong> de l'histoire de {childName || 'votre enfant'}
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">2.</span>
              Vous découvrez <strong>4 propositions de couverture</strong> et 1 illustration
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">3.</span>
              Vous choisissez ce que vous aimez et <strong>payez seulement si vous adorez</strong>
            </li>
          </ul>
        </div>

        {/* CTA note */}
        <p className="text-center text-sm text-navy-400 mt-5">
          En cliquant sur "Voir l'aperçu", vous acceptez nos{' '}
          <Link href="/cgv" className="underline hover:text-amber-500">
            CGV
          </Link>
          {' '}et notre{' '}
          <Link href="/confidentialite" className="underline hover:text-amber-500">
            politique de confidentialité
          </Link>.
        </p>
      </div>
    </div>
  )
}
