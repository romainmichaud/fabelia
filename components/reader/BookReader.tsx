'use client'

import {
  useState, useCallback, useEffect, useRef, TouchEvent,
} from 'react'
import Image from 'next/image'
import {
  ChevronLeftIcon, ChevronRightIcon,
  ZoomInIcon, ZoomOutIcon, DownloadIcon,
  BookOpenIcon, GridIcon, XIcon,
} from 'lucide-react'
import type { BookPage, BookImage } from '@/types'

// ============================================================
// TYPES
// ============================================================
interface ReaderPage extends BookPage {
  image?: BookImage
}

interface BookReaderProps {
  pages:      ReaderPage[]
  title:      string
  pdfUrl?:    string
  onDownload?: () => void
}

// ============================================================
// PAGE CONTENT
// ============================================================
function PageContent({ page }: { page: ReaderPage }) {
  return (
    <div
      className="w-full h-full bg-cream-50 overflow-hidden relative flex flex-col"
      style={{ fontFamily: 'var(--font-playfair)' }}
    >
      {page.page_type === 'cover' ? (
        /* Cover page */
        <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-forest-500 to-forest-700 p-8 text-white">
          {page.image?.public_url ? (
            <Image
              src={page.image.public_url}
              alt="Couverture"
              fill
              className="object-cover"
            />
          ) : (
            <>
              <div className="text-6xl animate-float">🌟</div>
              <div className="text-center">
                <p className="text-amber-300 text-xs tracking-widest uppercase mb-2">
                  L'aventure de
                </p>
                <h1 className="font-serif text-3xl font-bold">
                  {page.metadata?.childName as string ?? 'Votre héros'}
                </h1>
              </div>
            </>
          )}
        </div>

      ) : page.page_type === 'dedication' ? (
        /* Dedication page */
        <div className="flex-1 flex flex-col items-center justify-center p-10 text-center bg-cream-50">
          <div className="absolute top-0 left-0 w-16 h-16 bg-amber-100 rounded-br-[3rem]" />
          <div className="absolute bottom-0 right-0 w-16 h-16 bg-amber-100 rounded-tl-[3rem]" />
          <p className="font-serif text-navy-700 italic leading-relaxed text-base mb-4">
            "{page.content}"
          </p>
          {!!page.metadata?.senderName && (
            <p className="font-serif text-amber-600 font-semibold text-sm">
              — {page.metadata.senderName as string}
            </p>
          )}
          <div className="mt-4 flex justify-center gap-1 text-amber-300">
            {['✦', '✧', '✦'].map((s, i) => <span key={i}>{s}</span>)}
          </div>
        </div>

      ) : page.page_type === 'illustration' ? (
        /* Illustration page */
        <div className="flex-1 bg-gradient-to-br from-cream-100 to-amber-50 flex items-center justify-center p-6">
          {page.image?.public_url ? (
            <Image
              src={page.image.public_url}
              alt={`Illustration page ${page.page_number}`}
              fill
              className="object-contain p-6"
            />
          ) : (
            <div className="text-7xl animate-float">
              {(['🌟', '🦋', '🌈', '🌊', '🏰'][page.page_number % 5])}
            </div>
          )}
        </div>

      ) : (
        /* Chapter / text page */
        <div className="flex-1 flex flex-col p-8 md:p-10">
          {page.page_type === 'chapter' && !!page.metadata?.chapterTitle && (
            <div className="mb-5 pb-3 border-b border-cream-200">
              <p className="text-xs text-navy-400 font-medium tracking-widest uppercase mb-0.5">
                Chapitre {page.metadata.chapterNumber as number}
              </p>
              <h2 className="font-serif font-bold text-navy-800">
                {page.metadata.chapterTitle as string}
              </h2>
            </div>
          )}

          <div className="flex-1 book-prose overflow-hidden">
            {page.content && (
              <p
                dangerouslySetInnerHTML={{ __html: page.content }}
                className={page.page_number % 2 === 1 ? 'first-letter:text-5xl first-letter:font-bold first-letter:text-forest-500 first-letter:float-left first-letter:mr-2 first-letter:leading-none first-letter:mt-1 first-letter:font-serif' : ''}
              />
            )}
          </div>
        </div>
      )}

      {/* Page number */}
      {page.page_type !== 'cover' && (
        <div className="shrink-0 flex items-center justify-center py-3 border-t border-cream-100">
          <span className="text-xs text-navy-300 font-serif">{page.page_number}</span>
        </div>
      )}
    </div>
  )
}

// ============================================================
// THUMBNAIL STRIP
// ============================================================
function ThumbnailStrip({
  pages,
  currentPage,
  onSelect,
  onClose,
}: {
  pages:      ReaderPage[]
  currentPage: number
  onSelect:   (i: number) => void
  onClose:    () => void
}) {
  return (
    <div className="fixed inset-0 z-50 bg-navy-900/95 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <p className="font-serif text-white font-semibold">
          Table des pages
        </p>
        <button
          type="button"
          onClick={onClose}
          className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20"
        >
          <XIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {pages.map((page, i) => (
            <button
              key={page.id}
              type="button"
              onClick={() => { onSelect(i); onClose() }}
              className={[
                'aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all duration-200',
                i === currentPage
                  ? 'border-amber-400 scale-105'
                  : 'border-white/10 hover:border-amber-300',
              ].join(' ')}
            >
              <div className="w-full h-full bg-cream-100 flex flex-col items-center justify-center gap-1">
                {page.page_type === 'cover' ? (
                  <div className="w-full h-full bg-gradient-to-br from-forest-500 to-forest-700 flex items-center justify-center text-2xl">
                    📖
                  </div>
                ) : (
                  <>
                    {page.image?.public_url ? (
                      <Image
                        src={page.image.public_url}
                        alt={`Page ${page.page_number}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-xs text-navy-400 font-serif">{page.page_number}</span>
                    )}
                  </>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================================
// MAIN READER
// ============================================================
export function BookReader({ pages, title, pdfUrl, onDownload }: BookReaderProps) {
  const [currentPage,    setCurrentPage]    = useState(0)
  const [isFlipping,     setIsFlipping]     = useState(false)
  const [flipDirection,  setFlipDirection]  = useState<'left' | 'right'>('right')
  const [zoom,           setZoom]           = useState(1)
  const [showThumbs,     setShowThumbs]     = useState(false)
  const [isTwoPage,      setIsTwoPage]      = useState(false)
  const touchStartX                         = useRef<number>(0)
  const containerRef                        = useRef<HTMLDivElement>(null)

  const totalPages = pages.length
  const canGoBack  = currentPage > 0
  const canGoNext  = isTwoPage
    ? currentPage + 2 < totalPages
    : currentPage + 1 < totalPages

  // ——— Navigation ———
  const navigate = useCallback((direction: 'prev' | 'next') => {
    if (isFlipping) return
    if (direction === 'next' && !canGoNext) return
    if (direction === 'prev' && !canGoBack) return

    setFlipDirection(direction === 'next' ? 'right' : 'left')
    setIsFlipping(true)

    setTimeout(() => {
      setCurrentPage(prev =>
        direction === 'next'
          ? Math.min(prev + (isTwoPage ? 2 : 1), totalPages - 1)
          : Math.max(prev - (isTwoPage ? 2 : 1), 0)
      )
      setIsFlipping(false)
    }, 400)
  }, [isFlipping, canGoNext, canGoBack, isTwoPage, totalPages])

  // ——— Keyboard ———
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') navigate('next')
      if (e.key === 'ArrowLeft')  navigate('prev')
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [navigate])

  // ——— Touch / swipe ———
  const onTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e: TouchEvent) => {
    const delta = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(delta) > 50) {
      navigate(delta < 0 ? 'next' : 'prev')
    }
  }

  const leftPage  = pages[currentPage]
  const rightPage = isTwoPage ? pages[currentPage + 1] : null

  return (
    <div className="relative flex flex-col h-full bg-navy-900 rounded-2xl overflow-hidden select-none">

      {/* ——— TOP BAR ——— */}
      <div className="flex items-center justify-between gap-4 px-4 py-3 bg-navy-800 border-b border-white/10">
        <div className="flex items-center gap-2 text-white min-w-0">
          <BookOpenIcon className="h-4 w-4 text-amber-400 shrink-0" />
          <span className="font-serif font-semibold text-sm truncate">{title}</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Zoom out */}
          <button
            type="button"
            onClick={() => setZoom(z => Math.max(0.7, z - 0.15))}
            className="h-7 w-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <ZoomOutIcon className="h-3.5 w-3.5" />
          </button>

          <span className="text-xs text-white/60 w-10 text-center">
            {Math.round(zoom * 100)}%
          </span>

          {/* Zoom in */}
          <button
            type="button"
            onClick={() => setZoom(z => Math.min(1.5, z + 0.15))}
            className="h-7 w-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <ZoomInIcon className="h-3.5 w-3.5" />
          </button>

          {/* Thumbnails */}
          <button
            type="button"
            onClick={() => setShowThumbs(true)}
            className="h-7 w-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white ml-1"
          >
            <GridIcon className="h-3.5 w-3.5" />
          </button>

          {/* Download PDF */}
          {pdfUrl && (
            <button
              type="button"
              onClick={onDownload}
              className="h-7 px-3 rounded-lg bg-amber-400 hover:bg-amber-500 flex items-center gap-1.5 text-white text-xs font-medium ml-1"
            >
              <DownloadIcon className="h-3.5 w-3.5" />
              PDF
            </button>
          )}
        </div>
      </div>

      {/* ——— BOOK STAGE ——— */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center p-4 md:p-8 overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="relative flex gap-0 shadow-book rounded-xl overflow-hidden transition-transform duration-300"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
        >
          {/* Left page (or single page) */}
          <div
            className={[
              'relative bg-cream-50 transition-all duration-400',
              isTwoPage ? 'w-64 md:w-80' : 'w-72 md:w-96',
              'h-96 md:h-[520px]',
              isFlipping && flipDirection === 'left'
                ? 'animate-[pageFlip_0.4s_ease-in-out]'
                : '',
            ].join(' ')}
          >
            {leftPage && <PageContent page={leftPage} />}

            {/* Spine shadow */}
            {isTwoPage && (
              <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-r from-transparent to-black/20 pointer-events-none" />
            )}
          </div>

          {/* Right page (two-page mode) */}
          {isTwoPage && rightPage && (
            <div
              className={[
                'relative bg-cream-50 w-64 md:w-80 h-96 md:h-[520px]',
                'border-l border-cream-200',
                isFlipping && flipDirection === 'right'
                  ? 'animate-[pageFlip_0.4s_ease-in-out]'
                  : '',
              ].join(' ')}
            >
              <PageContent page={rightPage} />
            </div>
          )}
        </div>
      </div>

      {/* ——— BOTTOM NAV ——— */}
      <div className="flex items-center justify-between px-4 py-3 bg-navy-800 border-t border-white/10">

        <button
          type="button"
          onClick={() => navigate('prev')}
          disabled={!canGoBack || isFlipping}
          className="h-9 w-9 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-white transition-all"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center gap-1">
          <div className="flex gap-1">
            {Array.from({ length: Math.min(totalPages, 12) }).map((_, i) => {
              const isActive = isTwoPage
                ? i === currentPage || i === currentPage + 1
                : i === currentPage
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentPage(i)}
                  className={[
                    'rounded-full transition-all duration-200',
                    isActive ? 'w-4 h-1.5 bg-amber-400' : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40',
                  ].join(' ')}
                />
              )
            })}
          </div>
          <span className="text-white/40 text-xs">
            {currentPage + 1} / {totalPages}
          </span>
        </div>

        <button
          type="button"
          onClick={() => navigate('next')}
          disabled={!canGoNext || isFlipping}
          className="h-9 w-9 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-white transition-all"
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>

      {/* ——— THUMBNAIL OVERLAY ——— */}
      {showThumbs && (
        <ThumbnailStrip
          pages={pages}
          currentPage={currentPage}
          onSelect={setCurrentPage}
          onClose={() => setShowThumbs(false)}
        />
      )}
    </div>
  )
}
