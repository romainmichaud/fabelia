import type { Metadata, Viewport } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets:  ['latin'],
  variable: '--font-playfair',
  display:  'swap',
  weight:   ['400', '500', '600', '700', '800', '900'],
})

const dmSans = DM_Sans({
  subsets:  ['latin'],
  variable: '--font-dm-sans',
  display:  'swap',
  weight:   ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: {
    default:  'Mon Histoire — Le livre dont votre enfant est le héros',
    template: '%s | Mon Histoire',
  },
  description:
    'Créez un livre personnalisé unique avec votre enfant comme héros de l\'histoire. Imprimé en France, sur papier recyclé. Un cadeau dont il se souviendra toute sa vie.',
  keywords: [
    'livre personnalisé enfant',
    'livre prénom enfant',
    'cadeau original enfant',
    'livre sur mesure',
    'histoire personnalisée',
    'livre fait en France',
  ],
  authors:    [{ name: 'Mon Histoire' }],
  creator:    'Mon Histoire',
  publisher:  'Mon Histoire',
  robots: {
    index:  true,
    follow: true,
  },
  openGraph: {
    type:        'website',
    locale:      'fr_FR',
    url:         'https://monhistoire.fr',
    siteName:    'Mon Histoire',
    title:       'Mon Histoire — Le livre dont votre enfant est le héros',
    description: 'Créez un livre personnalisé unique avec votre enfant comme héros.',
    images: [
      {
        url:    '/og-image.jpg',
        width:  1200,
        height: 630,
        alt:    'Mon Histoire – Livres personnalisés pour enfants',
      },
    ],
  },
  twitter: {
    card:        'summary_large_image',
    title:       'Mon Histoire — Le livre dont votre enfant est le héros',
    description: 'Créez un livre personnalisé unique avec votre enfant comme héros.',
    images:      ['/og-image.jpg'],
  },
  icons: {
    icon:    '/favicon.ico',
    apple:   '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export const viewport: Viewport = {
  themeColor:       '#FAF5ED',
  width:            'device-width',
  initialScale:     1,
  maximumScale:     5,
  userScalable:     true,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="fr"
      className={`${playfair.variable} ${dmSans.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-cream-50 font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
