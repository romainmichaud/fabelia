'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { MenuIcon, XIcon, BookOpenIcon, SparklesIcon } from 'lucide-react'

const NAV_LINKS = [
  { href: '/#comment-ca-marche', label: 'Comment ça marche' },
  { href: '/#exemples',          label: 'Exemples' },
  { href: '/#tarifs',            label: 'Tarifs' },
  { href: '/faq',                label: 'FAQ' },
]

export function Header() {
  const pathname = usePathname()
  const [isScrolled,  setIsScrolled]  = useState(false)
  const [isMenuOpen,  setIsMenuOpen]  = useState(false)
  const isApp = pathname?.startsWith('/creer') ||
                pathname?.startsWith('/preview') ||
                pathname?.startsWith('/commande') ||
                pathname?.startsWith('/ma-bibliotheque') ||
                pathname?.startsWith('/lecture')

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close menu on route change
  useEffect(() => { setIsMenuOpen(false) }, [pathname])

  return (
    <>
      <header
        className={[
          'fixed top-0 left-0 right-0 z-50',
          'transition-all duration-300',
          isScrolled || isMenuOpen
            ? 'bg-cream-50/95 backdrop-blur-md shadow-soft border-b border-cream-200'
            : 'bg-transparent',
        ].join(' ')}
      >
        <div className="section-container">
          <div className="flex items-center justify-between h-16 md:h-20">

            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2.5 group"
              aria-label="Mon Histoire – Accueil"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-amber shadow-warm">
                <BookOpenIcon className="h-5 w-5 text-white" />
              </div>
              <span className="font-serif text-xl font-bold text-navy-800 group-hover:text-amber-500 transition-colors">
                Mon<span className="text-amber-500">Histoire</span>
              </span>
            </Link>

            {/* Desktop nav */}
            {!isApp && (
              <nav className="hidden md:flex items-center gap-8" aria-label="Navigation principale">
                {NAV_LINKS.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="text-sm font-medium text-navy-700 hover:text-amber-500 transition-colors relative group"
                  >
                    {label}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-400 rounded-full transition-all duration-300 group-hover:w-full" />
                  </Link>
                ))}
              </nav>
            )}

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              {isApp ? (
                <Link href="/ma-bibliotheque">
                  <Button variant="ghost" size="sm">
                    Ma bibliothèque
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/connexion">
                    <Button variant="ghost" size="sm">
                      Connexion
                    </Button>
                  </Link>
                  <Link href="/creer/theme">
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<SparklesIcon className="h-4 w-4" />}
                    >
                      Créer un livre
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              type="button"
              className="md:hidden p-2 rounded-xl text-navy-700 hover:bg-cream-200 transition-colors"
              onClick={() => setIsMenuOpen(v => !v)}
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            >
              {isMenuOpen
                ? <XIcon    className="h-6 w-6" />
                : <MenuIcon className="h-6 w-6" />
              }
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        className={[
          'fixed inset-0 z-40 md:hidden',
          'bg-cream-50/98 backdrop-blur-md',
          'flex flex-col pt-20 px-6 pb-8',
          'transition-all duration-300',
          isMenuOpen
            ? 'opacity-100 pointer-events-auto translate-y-0'
            : 'opacity-0 pointer-events-none -translate-y-2',
        ].join(' ')}
      >
        <nav className="flex flex-col gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="py-4 px-4 rounded-2xl text-lg font-medium text-navy-800 hover:bg-cream-200 hover:text-amber-500 transition-all"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-3 pt-8 border-t border-cream-200">
          <Link href="/connexion">
            <Button variant="outline" size="lg" fullWidth>
              Connexion
            </Button>
          </Link>
          <Link href="/creer/theme">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              leftIcon={<SparklesIcon className="h-5 w-5" />}
            >
              Créer un livre maintenant
            </Button>
          </Link>
        </div>
      </div>

      {/* Spacer to avoid content under fixed header */}
      <div className="h-16 md:h-20" aria-hidden="true" />
    </>
  )
}
