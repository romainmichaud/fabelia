'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { CoverSelector } from '@/components/preview/CoverSelector'
import {
  ArrowRightIcon, LockIcon, RefreshCwIcon,
  BookOpenIcon, ImageIcon, AlignLeftIcon, SparklesIcon,
} from 'lucide-react'
import type { BookCoverOption } from '@/types'

// ============================================================
// TYPES
// ============================================================
interface PreviewData {
  isReady:          boolean
  generationStatus: string
  childName:        string
  title:            string
  chapterTitle:     string
  chapterExcerpt:   string
  illustrationUrl:  string
  score:            number
  coverImages:      { id: string; label: string; imageUrl: string }[]
}

// Default palettes for covers when images are generated
const COVER_PALETTES = [
  { primary: '#1A2E4A', secondary: '#FFFFFF', accent: '#E8C547' },
  { primary: '#2D5A3D', secondary: '#FEFCF8', accent: '#E8A93C' },
  { primary: '#C45C44', secondary: '#FEFCF8', accent: '#F5D58A' },
  { primary: '#6B4E8C', secondary: '#FFFFFF', accent: '#F2C96E' },
]

// ============================================================
// GENERATING STATE
// ============================================================
function GeneratingState({ status }: { status: string }) {
  const steps = [
    { id: 'generating_text',   label: 'Écriture du premier chapitre', icon: <AlignLeftIcon className="h-4 w-4" /> },
    { id: 'generating_images', label: 'Création des couvertures',      icon: <ImageIcon     className="h-4 w-4" /> },
    { id: 'completed',         label: 'Illustration de la scène clé',  icon: <SparklesIcon  className="h-4 w-4" /> },
  ]

  const STEP_ORDER = ['generating_text', 'generating_images', 'completed']
  const currentIdx = Math.max(0, STEP_ORDER.indexOf(status))

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-8 py-20">
      <div className="relative">
        <div className="h-20 w-20 rounded-full border-4 border-cream-200 border-t-amber-400 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-3xl">
          📖
        </div>
      </div>

      <div className="text-center max-w-sm">
        <h2 className="font-serif text-2xl font-bold text-navy-800 mb-2">
          Votre histoire se crée…
        </h2>
        <p className="text-navy-500 text-sm">
          Chaque mot est choisi avec soin pour votre enfant.
          Cela prend environ 30 secondes.
        </p>
      </div>

      <div className="w-full max-w-xs space-y-3">
        {steps.map(({ id, label, icon }, idx) => {
          const isDone    = idx < currentIdx
          const isCurrent = idx === currentIdx
          return (
            <div
              key={id}
              className={[
                'flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition-all duration-300',
                isDone    ? 'bg-forest-100 text-forest-600'  :
                isCurrent ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                            'bg-cream-100 text-navy-400',
              ].join(' ')}
            >
              <span className={isCurrent ? 'animate-pulse' : ''}>
                {isDone ? '✓' : icon}
              </span>
              {label}
              {isCurrent && (
                <RefreshCwIcon className="h-3 w-3 ml-auto animate-spin" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ============================================================
// CHAPTER READER
// ============================================================
function ChapterPreview({
  text,
  title,
  childName,
}: {
  text:      string
  title:     string
  childName: string
}) {
  // text may be HTML from the AI (uses <p>, <strong>, <em>)
  // Split on double-newlines if plain text, otherwise use as-is
  const isHtml = /<[a-z][\s\S]*>/i.test(text)

  return (
    <div className="bg-white rounded-3xl border border-cream-200 shadow-soft overflow-hidden">
      {/* Header */}
      <div className="border-b border-cream-100 px-8 py-5 flex items-center gap-3">
        <BookOpenIcon className="h-5 w-5 text-amber-400" />
        <div>
          <p className="text-xs text-navy-400 font-medium tracking-widest uppercase">
            Extrait exclusif
          </p>
          <p className="font-serif font-semibold text-navy-800">
            {title || `Chapitre 1 — L'aventure d'${childName}`}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-xs text-navy-400 bg-cream-100 px-3 py-1.5 rounded-full">
          <LockIcon className="h-3 w-3" />
          Aperçu gratuit
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-8 book-prose max-w-none">
        {isHtml ? (
          <div dangerouslySetInnerHTML={{ __html: text }} />
        ) : (
          text.trim().split('\n\n').filter(Boolean).map((p, i) => (
            <p
              key={i}
              className={i === 0
                ? 'first-letter:text-5xl first-letter:font-bold first-letter:text-forest-500 first-letter:float-left first-letter:mr-2 first-letter:leading-none first-letter:mt-1 first-letter:font-serif'
                : ''}
            >
              {p}
            </p>
          ))
        )}

        {/* Fade out — locked rest */}
        <div className="relative mt-8">
          <div className="text-navy-700 text-base leading-relaxed opacity-40 select-none blur-sm">
            <p>La suite de l'histoire réserve encore bien des surprises pour {childName}…
            Des épreuves, des alliés inattendus et une révélation qui changera tout.</p>
            <p className="mt-4">Mais pour ça, il faudra posséder le livre complet.</p>
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/60 to-white flex items-end justify-center pb-4">
            <div className="flex items-center gap-2 text-sm font-medium text-navy-500 bg-white border border-cream-200 rounded-full px-4 py-2 shadow-soft">
              <LockIcon className="h-4 w-4 text-amber-400" />
              30 pages au total dans le livre complet
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// ILLUSTRATION PREVIEW
// ============================================================
function IllustrationPreview({
  childName,
  illustrationUrl,
}: {
  childName:      string
  illustrationUrl: string
}) {
  return (
    <div className="bg-white rounded-3xl border border-cream-200 shadow-soft overflow-hidden">
      <div className="border-b border-cream-100 px-6 py-4 flex items-center gap-3">
        <ImageIcon className="h-5 w-5 text-amber-400" />
        <div>
          <p className="text-xs text-navy-400 font-medium tracking-widest uppercase">
            Illustration page 4
          </p>
          <p className="font-serif font-semibold text-navy-800 text-sm">
            La scène clé du chapitre
          </p>
        </div>
      </div>
      <div className="aspect-[4/3] relative bg-gradient-to-br from-forest-100 to-amber-50 flex items-center justify-center">
        {illustrationUrl ? (
          <Image
            src={illustrationUrl}
            alt={`Illustration de l'aventure de ${childName}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 800px"
          />
        ) : (
          <div className="text-center p-8">
            <div className="text-6xl mb-4 animate-float">🌟</div>
            <p className="font-serif text-navy-600 text-sm italic">
              "{childName} dans son aventure"
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================
// PAGE
// ============================================================
export default function PreviewPage() {
  const params    = useParams()
  const router    = useRouter()
  const projectId = params.projectId as string

  const [preview,          setPreview]          = useState<PreviewData | null>(null)
  const [error,            setError]            = useState<string | null>(null)
  const [selectedCoverId,  setSelectedCoverId]  = useState<string | null>(null)

  // ——— Poll until preview is ready ———
  const fetchPreview = useCallback(async () => {
    try {
      const res  = await fetch(`/api/preview/${projectId}`)
      const json = await res.json()

      if (!res.ok) {
        setError(json.error ?? 'Erreur lors du chargement')
        return
      }

      setPreview(json.data)

      // Keep polling if not ready
      if (!json.data.isReady) {
        setTimeout(fetchPreview, 2500)
      }
    } catch {
      setError('Impossible de charger l\'aperçu')
    }
  }, [projectId])

  useEffect(() => {
    fetchPreview()
  }, [fetchPreview])

  // ——— Error state ———
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-terra-500 mb-4">{error}</p>
          <Button variant="primary" onClick={() => router.push('/creer/theme')}>
            Recommencer
          </Button>
        </div>
      </div>
    )
  }

  // ——— Generating state ———
  if (!preview?.isReady) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <div className="section-container py-8">
          <GeneratingState status={preview?.generationStatus ?? 'generating_text'} />
        </div>
      </div>
    )
  }

  // ——— Build cover options ———
  const covers: BookCoverOption[] = preview.coverImages.map((img, idx) => ({
    id:       img.id,
    label:    img.label,
    imageUrl: img.imageUrl,
    palette:  COVER_PALETTES[idx % COVER_PALETTES.length],
  }))

  const childName = preview.childName

  return (
    <div className="min-h-screen bg-gradient-hero pb-32">
      <div className="section-container py-10 max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10 animate-fade-up">
          <div className="inline-flex items-center gap-2 bg-forest-100 border border-forest-200 rounded-full px-4 py-2 mb-5">
            <span className="h-2 w-2 rounded-full bg-forest-500 animate-pulse" />
            <span className="text-forest-600 text-sm font-medium">Aperçu prêt !</span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-navy-800 mb-3">
            L'histoire d'<span className="text-gradient-amber">{childName}</span> est là
          </h1>
          <p className="text-navy-600">
            Lisez l'extrait, explorez les couvertures, et obtenez votre livre si vous adorez.
          </p>
        </div>

        <div className="space-y-8">

          {/* Chapter */}
          <div className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <ChapterPreview
              text={preview.chapterExcerpt}
              title={preview.chapterTitle}
              childName={childName}
            />
          </div>

          {/* Illustration */}
          <div className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <IllustrationPreview
              childName={childName}
              illustrationUrl={preview.illustrationUrl}
            />
          </div>

          {/* Cover selector */}
          {covers.length > 0 && (
            <div
              className="animate-fade-up bg-white rounded-3xl border border-cream-200 shadow-soft p-6 md:p-8"
              style={{ animationDelay: '0.3s' }}
            >
              <CoverSelector
                covers={covers}
                selected={selectedCoverId}
                onChange={setSelectedCoverId}
                childName={childName}
              />
            </div>
          )}
        </div>
      </div>

      {/* ——— STICKY PURCHASE BAR ——— */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-cream-200 shadow-[0_-4px_30px_rgba(26,46,74,0.10)]">
        <div className="section-container max-w-4xl mx-auto py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

            <div>
              <p className="font-serif font-bold text-navy-800">
                Vous adorez cette histoire ?
              </p>
              <p className="text-navy-500 text-sm">
                Obtenez le livre complet — numérique ou imprimé en France
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => router.push(`/creer/theme`)}
                className="text-sm text-navy-500 hover:text-amber-500 transition-colors"
              >
                Modifier
              </button>
              <Link href={selectedCoverId ? `/commande/${projectId}` : '#'}>
                <Button
                  variant="primary"
                  size="lg"
                  disabled={!selectedCoverId}
                  rightIcon={<ArrowRightIcon className="h-4 w-4" />}
                >
                  {selectedCoverId ? 'Obtenir le livre' : 'Choisir une couverture'}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
