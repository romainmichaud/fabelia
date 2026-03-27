'use client'

import { useParams }  from 'next/navigation'
import Link           from 'next/link'
import { BookReader } from '@/components/reader/BookReader'
import { ChevronLeftIcon } from 'lucide-react'
import type { BookPage, BookImage } from '@/types'

// ============================================================
// MOCK PAGES (replaced by API in production)
// ============================================================
const MOCK_PAGES: (BookPage & { image?: BookImage })[] = [
  {
    id: 'p0', project_id: 'proj-1', page_number: 0,
    page_type: 'cover', content: null, layout: null,
    metadata: { childName: 'Emma', theme: 'forest' },
  },
  {
    id: 'p1', project_id: 'proj-1', page_number: 1,
    page_type: 'dedication', content: 'À ma petite étoile, qui illumine chaque journée.', layout: null,
    metadata: { senderName: 'Maman & Papa' },
  },
  {
    id: 'p2', project_id: 'proj-1', page_number: 2,
    page_type: 'chapter', layout: null, metadata: { chapterNumber: 1, chapterTitle: 'La lumière dorée' },
    content: `Ce matin-là, Emma se réveilla avec une étrange sensation dans le ventre. Quelque chose l'appelait depuis la forêt derrière la maison — une lumière dorée qu'elle n'avait jamais vue auparavant dansait entre les arbres.\n\nElle noua ses chaussures à toute vitesse, attrapa son sac à dos rouge et sortit en courant dans le jardin encore humide de rosée.`,
  },
  {
    id: 'p3', project_id: 'proj-1', page_number: 3,
    page_type: 'illustration', content: null, layout: null,
    metadata: { caption: 'Emma et la créature de la forêt' },
  },
  {
    id: 'p4', project_id: 'proj-1', page_number: 4,
    page_type: 'chapter', layout: null, metadata: { chapterNumber: 1 },
    content: `— Tu n'as pas peur, toi, dit une petite voix.\n\nEmma se retourna. Sur une branche basse du vieux chêne, une créature qu'elle ne connaissait pas la regardait de ses grands yeux brillants. Elle n'avait pas peur — non, elle était courageuse, tout le monde le disait.\n\n— Je m'appelle Emma, répondit-elle en souriant. Et j'ai l'impression que tu m'attendais.`,
  },
  {
    id: 'p5', project_id: 'proj-1', page_number: 5,
    page_type: 'chapter', layout: null, metadata: { chapterNumber: 2, chapterTitle: 'Le gardien des arbres' },
    content: `La créature s'appelait Feuillot. Elle gardait la forêt depuis des siècles, veillant sur chaque arbre, chaque ruisseau, chaque rayon de soleil qui filtrait entre les branches.\n\n— Je t'attendais, Emma, dit-il. Car tu es la seule capable de sauver notre monde.`,
  },
  {
    id: 'p6', project_id: 'proj-1', page_number: 6,
    page_type: 'illustration', content: null, layout: null,
    metadata: {},
  },
  {
    id: 'p7', project_id: 'proj-1', page_number: 7,
    page_type: 'chapter', layout: null, metadata: {},
    content: `Emma prit une grande inspiration. Elle pensait aux gens qu'elle aimait, à sa famille, à ses amis. C'est pour eux qu'elle ferait face à tous les dangers.\n\n— Je suis prête, dit-elle simplement. Montre-moi le chemin.`,
  },
  {
    id: 'p8', project_id: 'proj-1', page_number: 8,
    page_type: 'back_cover', content: "Fin du tome 1. La suite des aventures d'Emma vous attend…", layout: null,
    metadata: {},
  },
]

// ============================================================
// PAGE
// ============================================================
export default function ReadingPage() {
  const params  = useParams()
  const bookId  = params.bookId as string

  function handleDownload() {
    // In production: fetch signed URL and trigger download
    alert('Téléchargement PDF (à implémenter avec l\'API exports)')
  }

  return (
    <div className="min-h-screen bg-navy-900 flex flex-col">

      {/* Back nav */}
      <div className="bg-navy-800 border-b border-white/10 px-4 py-3">
        <div className="section-container max-w-5xl mx-auto flex items-center gap-4">
          <Link
            href="/ma-bibliotheque"
            className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            Ma bibliothèque
          </Link>
          <span className="text-white/20">·</span>
          <span className="text-sm text-white/50 font-serif">
            L'aventure d'Emma dans la forêt enchantée
          </span>
        </div>
      </div>

      {/* Reader */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-4xl" style={{ height: 'calc(100vh - 120px)', minHeight: '500px' }}>
          <BookReader
            pages={MOCK_PAGES}
            title="L'aventure d'Emma dans la forêt enchantée"
            pdfUrl="/api/exports/pdf-url"
            onDownload={handleDownload}
          />
        </div>
      </div>
    </div>
  )
}
