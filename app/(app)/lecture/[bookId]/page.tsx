'use client'

import { useEffect, useState } from 'react'
import { useParams }           from 'next/navigation'
import Link                    from 'next/link'
import { createClient }        from '@/lib/supabase/client'
import { BookReader }          from '@/components/reader/BookReader'
import { ChevronLeftIcon }     from 'lucide-react'
import type { BookPage, BookImage } from '@/types'

type PageWithImage = BookPage & { image?: BookImage }

export default function ReadingPage() {
  const params  = useParams()
  const bookId  = params.bookId as string
  const supabase = createClient()

  const [pages, setPages]   = useState<PageWithImage[]>([])
  const [title, setTitle]   = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) { setError('Non connecté'); setLoading(false); return }

        // Fetch project + pages
        const { data: project, error: projErr } = await supabase
          .from('book_projects')
          .select(`
            id, title, theme,
            book_pages (
              id, page_number, page_type,
              content_text, illustration_url, chapter_title
            )
          `)
          .eq('id', bookId)
          .eq('user_id', session.user.id)
          .single()

        if (projErr || !project) { setError('Livre introuvable'); setLoading(false); return }

        setTitle(project.title ?? 'Mon livre')

        type RawPage = {
          id: string
          page_number: number
          page_type: string
          content_text: string | null
          illustration_url: string | null
          chapter_title: string | null
        }

        const sorted = ([...(project.book_pages as RawPage[])])
          .sort((a, b) => a.page_number - b.page_number)

        const mapped: PageWithImage[] = sorted.map(p => ({
          id:          p.id,
          project_id:  bookId,
          page_number: p.page_number,
          page_type:   p.page_type as BookPage['page_type'],
          content:     p.content_text ?? null,
          layout:      null,
          metadata:    p.chapter_title ? { chapterTitle: p.chapter_title } : {},
          image: p.illustration_url ? {
            id:           p.id + '_img',
            project_id:   bookId,
            page_id:      p.id,
            style:        'default',
            url:          p.illustration_url,
            public_url:   p.illustration_url,
            storage_path: '',
            image_type:   'illustration',
            is_selected:  true,
            is_cover:     p.page_type === 'cover',
          } as unknown as BookImage : undefined,
        }))

        setPages(mapped)
      } catch (e) {
        setError((e as Error).message)
      } finally {
        setLoading(false)
      }
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId])

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
          {title && (
            <>
              <span className="text-white/20">·</span>
              <span className="text-sm text-white/50 font-serif truncate max-w-xs">{title}</span>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        {loading ? (
          <div className="flex flex-col items-center gap-3 text-white/50">
            <div className="w-8 h-8 border-2 border-white/20 border-t-amber-400 rounded-full animate-spin" />
            <p className="text-sm">Chargement…</p>
          </div>
        ) : error ? (
          <div className="text-center text-white/60">
            <p className="text-lg mb-4">{error}</p>
            <Link href="/ma-bibliotheque" className="text-amber-400 hover:underline text-sm">
              ← Retour à la bibliothèque
            </Link>
          </div>
        ) : pages.length === 0 ? (
          <div className="text-center text-white/60">
            <p className="text-lg mb-2">Ce livre n&apos;a pas encore de pages.</p>
            <p className="text-sm">La génération est peut-être encore en cours.</p>
          </div>
        ) : (
          <div className="w-full max-w-4xl" style={{ height: 'calc(100vh - 120px)', minHeight: '500px' }}>
            <BookReader
              pages={pages}
              title={title}
              pdfUrl={`/api/exports/${bookId}`}
              onDownload={() => window.open(`/api/exports/${bookId}`, '_blank')}
            />
          </div>
        )}
      </div>
    </div>
  )
}
