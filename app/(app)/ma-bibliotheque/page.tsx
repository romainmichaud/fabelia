import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import {
  BookOpenIcon, DownloadIcon, PackageIcon,
  PlusIcon, ClockIcon, CheckCircleIcon, SparklesIcon,
} from 'lucide-react'
import type { GenerationStatus } from '@/types'

export const metadata: Metadata = { title: 'Ma bibliothèque' }

// ============================================================
// MOCK DATA
// ============================================================
const MOCK_BOOKS = [
  {
    id:               'proj-1',
    title:            'L\'aventure d\'Emma dans la forêt enchantée',
    childName:        'Emma',
    theme:            'forest',
    emoji:            '🦊',
    generationStatus: 'completed' as GenerationStatus,
    productType:      'bundle',
    createdAt:        '2024-01-15',
    coverGradient:    'from-forest-500 to-forest-700',
    pdfReady:         true,
    printStatus:      'shipped',
    trackingNumber:   'FR123456789',
  },
  {
    id:               'proj-2',
    title:            'Lucas et les mystères de l\'espace',
    childName:        'Lucas',
    theme:            'space',
    emoji:            '🚀',
    generationStatus: 'generating_images' as GenerationStatus,
    productType:      'digital',
    createdAt:        '2024-01-20',
    coverGradient:    'from-navy-700 to-navy-900',
    pdfReady:         false,
    printStatus:      null,
    trackingNumber:   null,
  },
  {
    id:               'proj-3',
    title:            'Chloé et le trésor des profondeurs',
    childName:        'Chloé',
    theme:            'ocean',
    emoji:            '🐋',
    generationStatus: 'idle' as GenerationStatus,
    productType:      null,
    createdAt:        '2024-01-22',
    coverGradient:    'from-blue-600 to-blue-900',
    pdfReady:         false,
    printStatus:      null,
    trackingNumber:   null,
  },
]

// ============================================================
// STATUS BADGE
// ============================================================
function StatusBadge({ status }: { status: GenerationStatus | 'draft' }) {
  const MAP: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    idle:             { label: 'Brouillon',          className: 'bg-cream-200 text-navy-500',    icon: <ClockIcon className="h-3 w-3" /> },
    queued:           { label: 'En attente',         className: 'bg-amber-100 text-amber-600',   icon: <ClockIcon className="h-3 w-3" /> },
    generating_text:  { label: 'Écriture...',        className: 'bg-amber-100 text-amber-600 animate-pulse', icon: <SparklesIcon className="h-3 w-3" /> },
    generating_images:{ label: 'Illustrations...',   className: 'bg-amber-100 text-amber-600 animate-pulse', icon: <SparklesIcon className="h-3 w-3" /> },
    assembling:       { label: 'Finalisation...',    className: 'bg-amber-100 text-amber-600 animate-pulse', icon: <SparklesIcon className="h-3 w-3" /> },
    completed:        { label: 'Prêt',               className: 'bg-forest-100 text-forest-600',  icon: <CheckCircleIcon className="h-3 w-3" /> },
    failed:           { label: 'Erreur',             className: 'bg-terra-300/30 text-terra-500', icon: null },
    draft:            { label: 'Non payé',           className: 'bg-cream-200 text-navy-500',    icon: null },
  }

  const config = MAP[status] ?? MAP['idle']
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
      {config.icon}
      {config.label}
    </span>
  )
}

// ============================================================
// BOOK CARD
// ============================================================
function BookCard({ book }: { book: typeof MOCK_BOOKS[0] }) {
  const isReady    = book.generationStatus === 'completed'
  const isGenerating = ['generating_text', 'generating_images', 'assembling', 'queued'].includes(book.generationStatus)
  const isDraft    = !book.productType

  return (
    <div className="bg-white rounded-3xl border border-cream-200 shadow-soft overflow-hidden hover:-translate-y-1 transition-all duration-300 hover:shadow-soft-lg">

      {/* Cover */}
      <div className={`aspect-[16/9] bg-gradient-to-br ${book.coverGradient} relative flex items-center justify-center`}>
        <div className="text-5xl animate-float">{book.emoji}</div>

        {/* Status overlay for generating */}
        {isGenerating && (
          <div className="absolute inset-0 bg-navy-900/50 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="h-8 w-8 rounded-full border-2 border-white border-t-amber-400 animate-spin mx-auto mb-2" />
              <p className="text-xs font-medium">Création en cours…</p>
            </div>
          </div>
        )}

        {/* Top right badge */}
        <div className="absolute top-3 right-3">
          <StatusBadge status={book.generationStatus} />
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-serif font-bold text-navy-800 leading-tight mb-1 line-clamp-2">
          {book.title}
        </h3>
        <p className="text-navy-500 text-xs mb-4">
          Créé le {new Date(book.createdAt).toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'long', year: 'numeric',
          })}
        </p>

        {/* Print tracking */}
        {book.printStatus === 'shipped' && (
          <div className="flex items-center gap-2 p-3 bg-forest-50 border border-forest-200 rounded-2xl mb-4 text-xs text-forest-600">
            <PackageIcon className="h-3.5 w-3.5 shrink-0" />
            <span>
              Livre expédié · Suivi <strong>{book.trackingNumber}</strong>
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {isDraft ? (
            <Link href={`/creer/theme`}>
              <Button variant="outline" size="sm" fullWidth leftIcon={<SparklesIcon className="h-4 w-4" />}>
                Finaliser l'achat
              </Button>
            </Link>
          ) : isReady ? (
            <>
              <Link href={`/lecture/${book.id}`}>
                <Button variant="primary" size="sm" fullWidth leftIcon={<BookOpenIcon className="h-4 w-4" />}>
                  Lire le livre
                </Button>
              </Link>
              {book.pdfReady && (
                <Button variant="ghost" size="sm" fullWidth leftIcon={<DownloadIcon className="h-4 w-4" />}>
                  Télécharger le PDF
                </Button>
              )}
            </>
          ) : isGenerating ? (
            <Button variant="ghost" size="sm" fullWidth disabled loading>
              Génération en cours…
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

// ============================================================
// PAGE
// ============================================================
export default function LibraryPage() {
  const completedBooks = MOCK_BOOKS.filter(b => b.generationStatus === 'completed')
  const otherBooks     = MOCK_BOOKS.filter(b => b.generationStatus !== 'completed')

  return (
    <div className="min-h-screen bg-gradient-hero py-10">
      <div className="section-container max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-10">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-navy-800 mb-2">
              Ma bibliothèque
            </h1>
            <p className="text-navy-500">
              {completedBooks.length} livre{completedBooks.length !== 1 ? 's' : ''} prêt{completedBooks.length !== 1 ? 's' : ''} à lire
            </p>
          </div>
          <Link href="/creer/theme">
            <Button
              variant="primary"
              size="md"
              leftIcon={<PlusIcon className="h-4 w-4" />}
            >
              Nouveau livre
            </Button>
          </Link>
        </div>

        {MOCK_BOOKS.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-6xl mb-5">📚</div>
            <h2 className="font-serif text-2xl font-bold text-navy-800 mb-3">
              Votre bibliothèque est vide
            </h2>
            <p className="text-navy-600 mb-8 max-w-sm">
              Créez votre premier livre personnalisé en moins de 5 minutes.
            </p>
            <Link href="/creer/theme">
              <Button
                variant="primary"
                size="lg"
                leftIcon={<SparklesIcon className="h-5 w-5" />}
              >
                Créer mon premier livre
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Ready books */}
            {completedBooks.length > 0 && (
              <section>
                <h2 className="font-serif text-lg font-semibold text-navy-700 mb-5 flex items-center gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-forest-400" />
                  Prêts à lire
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {completedBooks.map(b => <BookCard key={b.id} book={b} />)}
                </div>
              </section>
            )}

            {/* In progress / drafts */}
            {otherBooks.length > 0 && (
              <section>
                <h2 className="font-serif text-lg font-semibold text-navy-700 mb-5 flex items-center gap-2">
                  <ClockIcon className="h-5 w-5 text-amber-400" />
                  En cours
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {otherBooks.map(b => <BookCard key={b.id} book={b} />)}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
