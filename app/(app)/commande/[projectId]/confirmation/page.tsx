import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { BookOpenIcon, DownloadIcon, MailIcon, PackageIcon } from 'lucide-react'

export const metadata: Metadata = { title: 'Commande confirmée !' }

interface Props {
  params: { projectId: string }
}

export default function ConfirmationPage({ params }: Props) {
  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center py-20">
      <div className="section-container max-w-lg mx-auto text-center">

        {/* Confetti animation */}
        <div className="relative mb-8">
          <div className="text-7xl animate-bounce">🎉</div>
          <div className="absolute -top-4 -left-8 text-3xl animate-float opacity-70">✨</div>
          <div className="absolute -top-2 -right-6 text-2xl animate-float-delayed opacity-70">⭐</div>
          <div className="absolute bottom-0 left-4 text-2xl animate-float opacity-60" style={{ animationDelay: '0.5s' }}>🌟</div>
        </div>

        <h1 className="font-serif text-3xl md:text-4xl font-bold text-navy-800 mb-3">
          Commande confirmée !
        </h1>
        <p className="text-navy-600 text-lg mb-2">
          Merci pour votre confiance.
        </p>
        <p className="text-navy-500 mb-10">
          Un email de confirmation vous a été envoyé.
        </p>

        {/* Order card */}
        <div className="bg-white border border-cream-200 rounded-3xl shadow-soft p-6 mb-8 text-left">
          <div className="flex items-center gap-3 mb-5 pb-5 border-b border-cream-100">
            <div className="h-10 w-10 rounded-2xl bg-forest-100 flex items-center justify-center">
              <BookOpenIcon className="h-5 w-5 text-forest-500" />
            </div>
            <div>
              <p className="font-serif font-bold text-navy-800">L'aventure d'Emma</p>
              <p className="text-navy-500 text-sm">Commande n° ORD-2024-00042</p>
            </div>
          </div>

          {/* Next steps */}
          <div className="space-y-4">
            <p className="text-sm font-semibold text-navy-700 mb-2">Ce qui se passe maintenant :</p>

            {[
              {
                icon:  <MailIcon    className="h-4 w-4" />,
                color: 'bg-amber-100 text-amber-500',
                title: 'Email de confirmation envoyé',
                desc:  'Vérifiez votre boîte mail (et les spams)',
                done:  true,
              },
              {
                icon:  <BookOpenIcon className="h-4 w-4" />,
                color: 'bg-forest-100 text-forest-500',
                title: 'Génération du livre complet',
                desc:  'Votre livre de 30 pages est en cours de création',
                done:  false,
              },
              {
                icon:  <DownloadIcon className="h-4 w-4" />,
                color: 'bg-navy-100 text-navy-500',
                title: 'Version numérique disponible',
                desc:  'Accessible dans votre bibliothèque dans ~2 minutes',
                done:  false,
              },
              {
                icon:  <PackageIcon className="h-4 w-4" />,
                color: 'bg-cream-200 text-navy-400',
                title: 'Envoi à l\'imprimeur',
                desc:  'Livraison estimée dans 5 à 7 jours ouvrés',
                done:  false,
              },
            ].map(({ icon, color, title, desc, done }) => (
              <div key={title} className="flex items-start gap-3">
                <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                  {done ? '✓' : icon}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${done ? 'text-forest-600 line-through opacity-60' : 'text-navy-800'}`}>
                    {title}
                  </p>
                  <p className="text-xs text-navy-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <Link href="/ma-bibliotheque">
            <Button variant="primary" size="lg" fullWidth leftIcon={<BookOpenIcon className="h-5 w-5" />}>
              Voir ma bibliothèque
            </Button>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="md" fullWidth>
              Retour à l'accueil
            </Button>
          </Link>
        </div>

        {/* Share */}
        <div className="mt-8 p-5 bg-amber-50 border border-amber-200 rounded-2xl">
          <p className="text-sm font-semibold text-amber-700 mb-2">
            🙌 Partagez la magie !
          </p>
          <p className="text-sm text-amber-600">
            Vos amis méritent aussi ce cadeau unique. Offrez-leur 5€ de réduction avec votre code <strong>EMMA5</strong>.
          </p>
        </div>
      </div>
    </div>
  )
}
