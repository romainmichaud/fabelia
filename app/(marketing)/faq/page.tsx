import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { SparklesIcon, MailIcon } from 'lucide-react'

export const metadata: Metadata = {
  title: 'FAQ — Questions fréquentes',
  description: 'Toutes les réponses à vos questions sur les livres personnalisés MonHistoire.',
}

const FAQ_CATEGORIES = [
  {
    id:    'product',
    label: '📖 Le produit',
    items: [
      {
        q: 'À partir de quel âge peut-on créer un livre ?',
        a: 'Nos livres sont conçus pour les enfants de 2 à 10 ans. Le contenu est automatiquement adapté selon l\'âge que vous indiquez lors de la personnalisation : texte court et simple pour les 2-4 ans, histoire élaborée avec plus de rebondissements pour les 6-10 ans.',
      },
      {
        q: 'Combien de pages contient le livre ?',
        a: 'Le livre complet contient 30 pages : couverture, page de dédicace, 4 chapitres avec leurs illustrations, et une page finale. Chaque livre est différent car l\'histoire est générée spécialement pour votre enfant.',
      },
      {
        q: 'Puis-je voir un exemple complet avant d\'acheter ?',
        a: 'Oui ! Avant tout achat, vous pouvez consulter gratuitement le premier chapitre complet, 4 propositions de couverture et 1 illustration. Vous ne payez que si vous adorez ce que vous voyez.',
      },
      {
        q: 'Les livres sont-ils disponibles en d\'autres langues ?',
        a: 'Pour l\'instant, nos livres sont disponibles uniquement en français. Nous travaillons sur des versions anglaise et espagnole.',
      },
    ],
  },
  {
    id:    'personalization',
    label: '✏️ La personnalisation',
    items: [
      {
        q: 'Quelles informations dois-je fournir ?',
        a: 'Pour créer votre livre, vous aurez besoin : du prénom et de l\'âge de l\'enfant, d\'une description physique (couleur des cheveux, yeux, teint), de 1 à 2 traits de personnalité, et d\'un message de dédicace optionnel. L\'ensemble prend moins de 5 minutes.',
      },
      {
        q: 'Puis-je modifier mon livre après l\'avoir commandé ?',
        a: 'Il n\'est pas possible de modifier une commande une fois le paiement effectué. C\'est pourquoi nous proposons un aperçu complet avant achat. Si vous souhaitez un livre différent, vous pouvez en créer un nouveau.',
      },
      {
        q: 'Comment fonctionne le choix de la couverture ?',
        a: 'Lors de la prévisualisation, nous vous proposons 4 couvertures distinctes avec des styles graphiques différents, toutes personnalisées avec le nom de votre enfant. Vous choisissez celle qui vous touche le plus.',
      },
    ],
  },
  {
    id:    'delivery',
    label: '📦 Livraison',
    items: [
      {
        q: 'Quelle est la zone de livraison ?',
        a: 'Nous livrons uniquement en France métropolitaine pour les livres imprimés. La version numérique (PDF + lecture en ligne) est disponible partout dans le monde.',
      },
      {
        q: 'Quels sont les délais de livraison ?',
        a: 'La version numérique est disponible immédiatement après le paiement. Pour les livres imprimés, comptez 5 à 7 jours ouvrés. L\'impression se fait en France, ce qui garantit des délais maîtrisés.',
      },
      {
        q: 'Comment puis-je suivre ma commande ?',
        a: 'Dès l\'expédition de votre livre, vous recevez un email avec un numéro de suivi. Vous pouvez également consulter le statut de votre commande dans votre espace bibliothèque.',
      },
      {
        q: 'Puis-je me faire livrer en point relais ?',
        a: 'Oui, la livraison en point relais est disponible (Colissimo / Mondial Relay). Vous choisissez le mode de livraison lors du checkout.',
      },
    ],
  },
  {
    id:    'quality',
    label: '🌿 Qualité & Éco',
    items: [
      {
        q: 'De quel papier est fait le livre ?',
        a: 'Nous utilisons exclusivement du papier certifié FSC 170g/m² pour les pages intérieures, et 350g/m² pour la couverture. Les encres utilisées sont à base d\'huiles végétales non-toxiques.',
      },
      {
        q: 'Où sont imprimés les livres ?',
        a: 'Tous nos livres sont imprimés en France, par des partenaires certifiés. Cela nous permet de garantir la qualité, de réduire notre empreinte carbone et de soutenir le tissu économique local.',
      },
      {
        q: 'Le livre est-il résistant ?',
        a: 'Absolument. La couverture rigide (option hardcover) et la reliure cousue garantissent une durabilité exceptionnelle. Conçu pour résister aux relectures quotidiennes et traverser les années.',
      },
    ],
  },
  {
    id:    'payment',
    label: '💳 Paiement & Sécurité',
    items: [
      {
        q: 'Quels modes de paiement acceptez-vous ?',
        a: 'Nous acceptons les cartes bancaires (Visa, Mastercard, American Express), Apple Pay, Google Pay et PayPal. Tous les paiements sont sécurisés via Stripe (certifié PCI-DSS niveau 1).',
      },
      {
        q: 'Mes données bancaires sont-elles en sécurité ?',
        a: 'Vos données bancaires ne transitent jamais par nos serveurs. Elles sont gérées directement par Stripe, le leader mondial du paiement en ligne. Nous ne conservons aucun numéro de carte.',
      },
      {
        q: 'Puis-je obtenir un remboursement ?',
        a: 'Pour les versions numériques, un remboursement est possible dans les 24h si vous n\'avez pas téléchargé le PDF. Pour les livres imprimés, nous remboursons ou réimprimons en cas de défaut de fabrication. Contactez notre support dans tous les cas.',
      },
      {
        q: 'Émettez-vous des factures ?',
        a: 'Oui. Une facture est automatiquement envoyée par email après chaque commande. Vous pouvez également les retrouver dans votre espace bibliothèque.',
      },
    ],
  },
]

export default function FaqPage() {
  return (
    <main className="bg-cream-50">
      {/* Hero */}
      <section className="bg-gradient-warm py-20">
        <div className="section-container max-w-3xl mx-auto text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-navy-800 mb-4">
            Questions fréquentes
          </h1>
          <p className="text-navy-600 text-lg">
            Tout ce que vous voulez savoir sur MonHistoire.
          </p>
        </div>
      </section>

      {/* FAQ content */}
      <section className="py-16 md:py-20">
        <div className="section-container max-w-3xl mx-auto">
          <div className="space-y-12">
            {FAQ_CATEGORIES.map(({ id, label, items }) => (
              <div key={id}>
                <h2 className="font-serif text-xl font-bold text-navy-800 mb-5 flex items-center gap-2">
                  {label}
                </h2>
                <div className="space-y-3">
                  {items.map(({ q, a }) => (
                    <details
                      key={q}
                      className="group bg-white rounded-2xl border border-cream-200 overflow-hidden"
                    >
                      <summary className="flex items-start justify-between gap-4 p-5 cursor-pointer list-none select-none hover:bg-cream-50 transition-colors">
                        <span className="font-serif font-semibold text-navy-800 leading-snug">{q}</span>
                        <span className="text-navy-400 text-xl shrink-0 group-open:rotate-45 transition-transform duration-300 mt-0.5">
                          +
                        </span>
                      </summary>
                      <div className="px-5 pb-5 text-navy-600 leading-relaxed text-sm">
                        {a}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-16 text-center bg-white border border-cream-200 rounded-3xl p-10 shadow-soft">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="font-serif text-2xl font-bold text-navy-800 mb-3">
              Vous n'avez pas trouvé votre réponse ?
            </h3>
            <p className="text-navy-600 mb-8">
              Notre équipe répond dans les 24h, du lundi au vendredi.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button
                  variant="outline"
                  size="lg"
                  leftIcon={<MailIcon className="h-5 w-5" />}
                >
                  Nous contacter
                </Button>
              </Link>
              <Link href="/creer/theme">
                <Button
                  variant="primary"
                  size="lg"
                  leftIcon={<SparklesIcon className="h-5 w-5" />}
                >
                  Créer un livre
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
