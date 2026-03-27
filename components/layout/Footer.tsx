import Link from 'next/link'
import { BookOpenIcon, LeafIcon, MapPinIcon, ShieldCheckIcon } from 'lucide-react'

const FOOTER_LINKS = {
  product: {
    title: 'Produit',
    links: [
      { href: '/#comment-ca-marche', label: 'Comment ça marche' },
      { href: '/#exemples',          label: 'Voir des exemples' },
      { href: '/#tarifs',            label: 'Tarifs' },
      { href: '/creer/theme',        label: 'Créer un livre' },
    ],
  },
  help: {
    title: 'Aide',
    links: [
      { href: '/faq',      label: 'Questions fréquentes' },
      { href: '/contact',  label: 'Nous contacter' },
      { href: '/livraison', label: 'Livraison & délais' },
    ],
  },
  legal: {
    title: 'Légal',
    links: [
      { href: '/mentions-legales',      label: 'Mentions légales' },
      { href: '/confidentialite',        label: 'Confidentialité' },
      { href: '/cgv',                    label: 'CGV' },
      { href: '/cookies',                label: 'Cookies' },
    ],
  },
}

const TRUST_ITEMS = [
  {
    icon: <MapPinIcon className="h-4 w-4" />,
    label: 'Imprimé en France',
  },
  {
    icon: <LeafIcon className="h-4 w-4" />,
    label: 'Papier recyclé FSC',
  },
  {
    icon: <ShieldCheckIcon className="h-4 w-4" />,
    label: 'Paiement sécurisé',
  },
]

export function Footer() {
  return (
    <footer className="bg-navy-800 text-white">
      {/* Trust bar */}
      <div className="border-b border-white/10">
        <div className="section-container py-5">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {TRUST_ITEMS.map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-cream-300 text-sm">
                <span className="text-amber-400">{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="section-container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-amber">
                <BookOpenIcon className="h-5 w-5 text-white" />
              </div>
              <span className="font-serif text-xl font-bold text-white">
                Mon<span className="text-amber-400">Histoire</span>
              </span>
            </Link>

            <p className="text-cream-300 text-sm leading-relaxed max-w-xs mb-6">
              Des livres uniques où votre enfant devient le héros de sa propre aventure.
              Fabriqués avec amour, en France.
            </p>

            {/* Social */}
            <div className="flex gap-3">
              {['Instagram', 'Facebook', 'Pinterest'].map((s) => (
                <a
                  key={s}
                  href="#"
                  aria-label={s}
                  className="h-9 w-9 rounded-xl bg-white/10 hover:bg-amber-400/20 flex items-center justify-center transition-colors text-xs font-bold text-cream-300"
                >
                  {s[0]}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.values(FOOTER_LINKS).map(({ title, links }) => (
            <div key={title}>
              <h4 className="font-serif font-semibold text-white mb-4 text-sm">
                {title}
              </h4>
              <ul className="space-y-2.5">
                {links.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-cream-400 hover:text-amber-400 text-sm transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="section-container py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-cream-500">
            <p>
              © {new Date().getFullYear()} MonHistoire SAS — Tous droits réservés
            </p>
            <p className="flex items-center gap-1.5">
              <LeafIcon className="h-3.5 w-3.5 text-forest-400" />
              Entreprise éco-responsable · Siège social en France
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
