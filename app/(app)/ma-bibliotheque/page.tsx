import type { Metadata }  from 'next'
import Link               from 'next/link'
import { redirect }       from 'next/navigation'
import { createServerClient, createAdminClient } from '@/lib/supabase/server'
import { Button }         from '@/components/ui/Button'
import {
  BookOpenIcon, DownloadIcon, PackageIcon,
  PlusIcon, ClockIcon, CheckCircleIcon, SparklesIcon,
} from 'lucide-react'
import type { GenerationStatus } from '@/types'

export const metadata: Metadata = { title: 'Ma bibliothèque' }

// ============================================================
// THEME CONFIG
// ============================================================
const THEME_CONFIG: Record<string, { emoji: string; gradient: string }> = {
  forest:  { emoji: '🦊', gradient: 'from-forest-500 to-forest-700' },
  space:   { emoji: '🚀', gradient: 'from-navy-700 to-navy-900' },
  ocean:   { emoji: '🐋', gradient: 'from-blue-600 to-blue-900' },
  magic:   { emoji: '🧙', gradient: 'from-purple-600 to-purple-900' },
  pirate:  { emoji: '🏴‍☠️', gradient: 'from-amber-600 to-amber-900' },
  default: { emoji: '📖', gradient: 'from-navy-500 to-navy-800' },
}

// ============================================================
// STATUS BADGE
// ============================================================
function StatusBadge({ status }: { status: GenerationStatus | 'draft' }) {
  const MAP: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    idle:              { label: 'Brouillon',        className: 'bg-cream-200 text-navy-500',             icon: <ClockIcon className="h-3 w-3" /> },
    queued:            { label: 'En attente',        className: 'bg-amber-100 text-amber-600',            icon: <ClockIcon className="h-3 w-3" /> },
    generating_text:   { label: 'Écriture...',       className: 'bg-amber-100 text-amber-600 animate-pulse', icon: <SparklesIcon className="h-3 w-3" /> },
    generating_images: { label: 'Illustrations...', className: 'bg-amber-100 text-amber-600 animate-pulse', icon: <SparklesIcon className="h-3 w-3" /> },
    assembling:        { label: 'Finalisation...',   className: 'bg-amber-100 text-amber-600 animate-pulse', icon: <SparklesIcon className="h-3 w-3" /> },
    completed:         { label: 'Prêt',              className: 'bg-forest-100 text-forest-600',          icon: <CheckCircleIcon className="h-3 w-3" /> },
    failed:            { label: 'Erreur',            className: 'bg-terra-300/30 text-terra-500',         icon: null },
    draft:             { label: 'Non payé',          className: 'bg-cream-200 text-navy-500',             icon: null },
  }
  const config = MAP[status] ?? MAP['idle']
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
      {config.icon}{config.label}
    </span>
  )
}

// ============================================================
// BOOK CARD
// ============================================================
type Book = {
  id:               string
  title:            string | null
  theme:            string | null
  generation_status: GenerationStatus
  is_book_ready:    boolean
  created_at:       string
  childName:        string
  productType:      string | null
  trackingNumber:   string | null
  printStatus:      string | null
}

function BookCard({ book }: { book: Book }) {
  const theme       = THEME_CONFIG[book.theme ?? ''] ?? THEME_CONFIG.default
  const isReady     = book.generation_status === 'completed' && book.is_book_ready
  const isGenerating = ['generating_text', 'generating_images', 'assembling', 'queued'].includes(book.generation_status)
  const isDraft     = !book.productType

  const title = book.title ?? `Histoire de ${book.childName}`

  return (
    <div className="bg-white rounded-3xl border border-cream-200 shadow-soft overflow-hidden hover:-translate-y-1 transition-all duration-300 hover:shadow-soft-lg">

      {/* Cover */}
      <div className={`aspect-[16/9] bg-gradient-to-br ${theme.gradient} relative flex items-center justify-center`}>
        <div className="text-5xl">{theme.emoji}</div>

        {isGenerating && (
          <div className="absolute inset-0 bg-navy-900/50 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="h-8 w-8 rounded-full border-2 border-white border-t-amber-400 animate-spin mx-auto mb-2" />
              <p className="text-xs font-medium">Création en cours…</p>
            </div>
          </div>
        )}

        <div className="absolute top-3 right-3">
          <StatusBadge status={isDraft ? 'draft' : book.generation_status} />
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-serif font-bold text-navy-800 leading-tight mb-1 line-clamp-2">
          {title}
        </h3>
        <p className="text-navy-500 text-xs mb-4">
          Créé le {new Date(book.created_at).toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'long', year: 'numeric',
          })}
        </p>

        {book.printStatus === 'shipped' && (
          <div className="flex items-center gap-2 p-3 bg-forest-50 border border-forest-200 rounded-2xl mb-4 text-xs text-forest-600">
            <PackageIcon className="h-3.5 w-3.5 shrink-0" />
            <span>Livre expédié · Suivi <strong>{book.trackingNumber}</strong></span>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {isDraft ? (
            <Link href={`/preview/${book.id}`}>
              <Button variant="outline" size="sm" fullWidth leftIcon={<SparklesIcon className="h-4 w-4" />}>
                Voir l&apos;aperçu
              </Button>
            </Link>
          ) : isReady ? (
            <>
              <Link href={`/lecture/${book.id}`}>
                <Button variant="primary" size="sm" fullWidth leftIcon={<BookOpenIcon className="h-4 w-4" />}>
                  Lire le livre
                </Button>
              </Link>
              <Button variant="ghost" size="sm" fullWidth leftIcon={<DownloadIcon className="h-4 w-4" />}>
                Télécharger le PDF
              </Button>
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
export default async function LibraryPage() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/connexion')

  const admin = createAdminClient()

  // Fetch all projects for this user
  const { data: projects } = await admin
    .from('book_projects')
    .select('id, title, theme, generation_status, is_book_ready, created_at')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  if (!projects || projects.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-hero py-10">
        <div className="section-container max-w-5xl mx-auto">
          <div className="flex items-start justify-between gap-4 mb-10">
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-navy-800">Ma bibliothèque</h1>
            <Link href="/creer/theme">
              <Button variant="primary" size="md" leftIcon={<PlusIcon className="h-4 w-4" />}>Nouveau livre</Button>
            </Link>
          </div>
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-6xl mb-5">📚</div>
            <h2 className="font-serif text-2xl font-bold text-navy-800 mb-3">Votre bibliothèque est vide</h2>
            <p className="text-navy-600 mb-8 max-w-sm">Créez votre premier livre personnalisé en moins de 5 minutes.</p>
            <Link href="/creer/theme">
              <Button variant="primary" size="lg" leftIcon={<SparklesIcon className="h-5 w-5" />}>
                Créer mon premier livre
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Fetch child names from dynamic_answers for all projects
  const projectIds = projects.map(p => p.id)
  const { data: answers } = await admin
    .from('dynamic_answers')
    .select('project_id, question_key, answer_value')
    .in('project_id', projectIds)
    .eq('question_key', 'childName')

  const childNameMap = Object.fromEntries(
    (answers ?? []).map(a => [a.project_id, a.answer_value as string])
  )

  // Fetch orders to know product type and print status
  const { data: orders } = await admin
    .from('orders')
    .select('book_project_id, product_type, status')
    .in('book_project_id', projectIds)

  const orderMap = Object.fromEntries(
    (orders ?? []).map(o => [o.book_project_id, o])
  )

  const books: Book[] = projects.map(p => ({
    id:               p.id,
    title:            p.title,
    theme:            p.theme,
    generation_status: p.generation_status as GenerationStatus,
    is_book_ready:    p.is_book_ready ?? false,
    created_at:       p.created_at,
    childName:        childNameMap[p.id] ?? 'Votre héros',
    productType:      orderMap[p.id]?.product_type ?? null,
    printStatus:      null,
    trackingNumber:   null,
  }))

  const completedBooks = books.filter(b => b.generation_status === 'completed')
  const otherBooks     = books.filter(b => b.generation_status !== 'completed')

  return (
    <div className="min-h-screen bg-gradient-hero py-10">
      <div className="section-container max-w-5xl mx-auto">

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
            <Button variant="primary" size="md" leftIcon={<PlusIcon className="h-4 w-4" />}>
              Nouveau livre
            </Button>
          </Link>
        </div>

        <div className="space-y-10">
          {completedBooks.length > 0 && (
            <section>
              <h2 className="font-serif text-lg font-semibold text-navy-700 mb-5 flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-forest-400" />Prêts à lire
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {completedBooks.map(b => <BookCard key={b.id} book={b} />)}
              </div>
            </section>
          )}

          {otherBooks.length > 0 && (
            <section>
              <h2 className="font-serif text-lg font-semibold text-navy-700 mb-5 flex items-center gap-2">
                <ClockIcon className="h-5 w-5 text-amber-400" />En cours
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {otherBooks.map(b => <BookCard key={b.id} book={b} />)}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
