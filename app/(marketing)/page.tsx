import Link from 'next/link'
import type { Metadata } from 'next'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import {
  SparklesIcon,
  StarIcon,
  CheckCircleIcon,
  LeafIcon,
  MapPinIcon,
  PackageIcon,
  BookOpenIcon,
  HeartIcon,
  ChevronDownIcon,
  ArrowRightIcon,
  UsersIcon,
  ShieldCheckIcon,
  ZapIcon,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Mon Histoire — Le livre dont votre enfant est le héros',
}

// ============================================================
// DATA
// ============================================================

const STEPS = [
  {
    number: '01',
    emoji:  '✏️',
    title:  'Je personnalise',
    desc:   'Je choisis le thème de l\'aventure, je dessine le portrait de mon héros et j\'écris une dédicace unique.',
    color:  'bg-amber-400/10 text-amber-500 border-amber-200',
    dot:    'bg-amber-400',
  },
  {
    number: '02',
    emoji:  '👀',
    title:  'Je prévisualise',
    desc:   'Je lis le premier chapitre, je découvre les illustrations et je choisis ma couverture préférée.',
    color:  'bg-forest-100 text-forest-500 border-forest-200',
    dot:    'bg-forest-400',
  },
  {
    number: '03',
    emoji:  '📦',
    title:  'Je reçois mon livre',
    desc:   'Imprimé en France sous 5 jours ouvrés, livré directement chez moi. Version numérique disponible immédiatement.',
    color:  'bg-terra-300/30 text-terra-500 border-terra-300',
    dot:    'bg-terra-400',
  },
]

const BENEFITS = [
  {
    icon:  <StarIcon className="h-5 w-5" />,
    title: 'Une histoire 100% unique',
    desc:  'Chaque livre est créé sur mesure, centré sur votre enfant. Aucun autre enfant au monde n\'aura la même histoire.',
    color: 'from-amber-400/20 to-amber-300/10',
    accent: 'text-amber-500',
  },
  {
    icon:  <PackageIcon className="h-5 w-5" />,
    title: 'Qualité premium',
    desc:  'Papier épais 170g, couverture rigide, reliure cousue. Un objet qui résiste au temps et aux lectures répétées.',
    color: 'from-forest-200/40 to-forest-100/20',
    accent: 'text-forest-500',
  },
  {
    icon:  <MapPinIcon className="h-5 w-5" />,
    title: 'Fabriqué en France',
    desc:  'Impression française, délais maîtrisés, qualité garantie. On soutient le savoir-faire local à chaque commande.',
    color: 'from-navy-600/10 to-navy-700/5',
    accent: 'text-navy-700',
  },
  {
    icon:  <LeafIcon className="h-5 w-5" />,
    title: 'Éco-responsable',
    desc:  'Papier certifié FSC, encres végétales, production locale. Parce que les histoires d\'aujourd\'hui construisent la planète de demain.',
    color: 'from-sage-200/40 to-sage-100/20',
    accent: 'text-sage-500',
  },
]

const THEMES = [
  { emoji: '🚀', label: 'Espace',    color: '#1A2E4A', bg: 'bg-navy-800' },
  { emoji: '🌊', label: 'Océan',     color: '#1B6CA8', bg: 'bg-blue-700' },
  { emoji: '🌲', label: 'Forêt',     color: '#2D5A3D', bg: 'bg-forest-500' },
  { emoji: '🏰', label: 'Château',   color: '#7B4F8F', bg: 'bg-purple-700' },
  { emoji: '🦁', label: 'Jungle',    color: '#C9843A', bg: 'bg-amber-500' },
  { emoji: '🏜️', label: 'Désert',   color: '#D4845A', bg: 'bg-terra-500' },
]

const TESTIMONIALS = [
  {
    id:      '1',
    content: '"Ma fille a fondu en larmes en voyant son prénom dans l\'histoire. Elle nous a demandé à le relire tous les soirs pendant deux semaines. C\'est le plus beau cadeau qu\'on lui ait jamais offert."',
    author:  'Sophie M.',
    role:    'Maman de Léa, 6 ans',
    rating:  5,
    avatar:  '👩‍👧',
  },
  {
    id:      '2',
    content: '"La qualité du livre est vraiment impressionnante. Le papier, les illustrations, la couverture… C\'est un objet qu\'on a envie de garder toute sa vie. Mes parents ont été aussi émerveillés que mon fils !"',
    author:  'Thomas B.',
    role:    'Papa de Mathieu, 4 ans',
    rating:  5,
    avatar:  '👨‍👦',
  },
  {
    id:      '3',
    content: '"J\'en ai offert deux pour les jumeaux de ma sœur. Chaque livre était complètement différent, adapté à leur personnalité. La livraison a été rapide et l\'emballage était magnifique, parfait pour un cadeau."',
    author:  'Marie-Claire D.',
    role:    'Tante de Lucas et Chloé, 5 ans',
    rating:  5,
    avatar:  '👩',
  },
]

const PRICING = [
  {
    id:          'digital',
    name:        'Numérique',
    price:       19,
    badge:       null,
    highlighted: false,
    desc:        'Lecture en ligne + PDF téléchargeable',
    features: [
      'Histoire complète (30 pages)',
      'Toutes les illustrations',
      'Lecture feuilletable en ligne',
      'PDF haute qualité à imprimer chez soi',
      'Accès illimité à vie',
    ],
  },
  {
    id:          'bundle',
    name:        'Premium',
    price:       44,
    badge:       'Le plus populaire',
    highlighted: true,
    desc:        'Livre imprimé + version numérique',
    features: [
      'Tout le numérique inclus',
      'Livre couverture rigide',
      'Papier recyclé 170g',
      'Impression française',
      'Livraison offerte en France',
      'Emballage cadeau inclus',
    ],
  },
  {
    id:          'print',
    name:        'Livre seul',
    price:       34,
    badge:       null,
    highlighted: false,
    desc:        'Uniquement le livre imprimé',
    features: [
      'Livre couverture rigide',
      'Papier recyclé 170g',
      'Impression française',
      'Livraison en France',
    ],
  },
]

const FAQ_ITEMS = [
  {
    q: 'À partir de quel âge peut-on créer un livre ?',
    a: 'Nos livres sont adaptés aux enfants de 2 à 10 ans. Vous choisissez le thème et la complexité de l\'histoire en fonction de l\'âge lors de la personnalisation.',
  },
  {
    q: 'Combien de temps prend la livraison ?',
    a: 'La version numérique est disponible immédiatement après paiement. Pour les livres imprimés, comptez 5 à 7 jours ouvrés pour la France métropolitaine.',
  },
  {
    q: 'Peut-on modifier l\'histoire après commande ?',
    a: 'Il n\'est pas possible de modifier une commande payée. C\'est pourquoi nous proposons une prévisualisation du premier chapitre et de la couverture avant tout achat.',
  },
  {
    q: 'Les livres sont-ils vraiment fabriqués en France ?',
    a: 'Oui, à 100%. Nos partenaires imprimeurs sont tous basés en France, ce qui nous permet de garantir la qualité, des délais courts et un impact carbone réduit.',
  },
]

// ============================================================
// SECTION COMPONENTS
// ============================================================

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} étoiles sur 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon
          key={i}
          className={`h-4 w-4 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-cream-300'}`}
        />
      ))}
    </div>
  )
}

// ============================================================
// PAGE
// ============================================================

export default function LandingPage() {
  return (
    <main className="overflow-x-hidden">

      {/* ====================================================
          HERO
          ==================================================== */}
      <section className="relative min-h-[92vh] flex items-center bg-gradient-hero overflow-hidden">

        {/* Decorative background circles */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-amber-300/20 blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-forest-200/30 blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

        <div className="section-container py-20 md:py-28 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left — Text */}
            <div className="flex flex-col gap-8 animate-fade-up">

              {/* Badge */}
              <div className="inline-flex items-center gap-2 self-start bg-white border border-amber-200 rounded-full px-4 py-2 shadow-warm">
                <span className="text-amber-500">✦</span>
                <span className="text-sm font-medium text-navy-700">
                  Plus de 12 000 histoires créées
                </span>
                <span className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="h-3 w-3 text-amber-400 fill-amber-400" />
                  ))}
                </span>
              </div>

              {/* Headline */}
              <div>
                <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-navy-800 leading-tight mb-5">
                  Votre enfant,{' '}
                  <span className="text-gradient-warm block">héros de son</span>
                  propre conte
                </h1>
                <p className="text-lg md:text-xl text-navy-600 leading-relaxed max-w-lg">
                  Un livre unique créé spécialement pour lui — avec son prénom, son portrait,
                  ses aventures. Un cadeau dont il se souviendra toute sa vie.
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/creer/theme">
                  <Button
                    size="xl"
                    variant="primary"
                    leftIcon={<SparklesIcon className="h-5 w-5" />}
                    rightIcon={<ArrowRightIcon className="h-5 w-5" />}
                  >
                    Créer son livre
                  </Button>
                </Link>
                <Link href="/#exemples">
                  <Button size="xl" variant="white">
                    Voir un exemple
                  </Button>
                </Link>
              </div>

              {/* Trust signals */}
              <div className="flex flex-wrap gap-5 pt-2">
                {[
                  { icon: <MapPinIcon className="h-4 w-4" />,     label: 'Fabriqué en France' },
                  { icon: <LeafIcon   className="h-4 w-4" />,     label: 'Papier recyclé FSC' },
                  { icon: <ShieldCheckIcon className="h-4 w-4" />, label: 'Paiement 100% sécurisé' },
                ].map(({ icon, label }) => (
                  <div key={label} className="flex items-center gap-1.5 text-sm text-navy-600">
                    <span className="text-forest-500">{icon}</span>
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Book visual */}
            <div className="flex justify-center items-center relative">
              <BookHeroIllustration />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce opacity-60">
          <span className="text-xs font-medium text-navy-500">Découvrir</span>
          <ChevronDownIcon className="h-5 w-5 text-navy-400" />
        </div>
      </section>

      {/* ====================================================
          STATS BAR
          ==================================================== */}
      <section className="bg-navy-800 py-8">
        <div className="section-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '12 000+', label: 'livres créés',       color: 'text-amber-400' },
              { value: '98%',     label: 'clients satisfaits', color: 'text-amber-400' },
              { value: '4,9★',    label: 'note moyenne',       color: 'text-amber-400' },
              { value: '5 jours', label: 'délai de livraison', color: 'text-amber-400' },
            ].map(({ value, label, color }) => (
              <div key={label} className="text-center">
                <p className={`font-serif text-3xl font-bold ${color}`}>{value}</p>
                <p className="text-cream-400 text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================
          HOW IT WORKS
          ==================================================== */}
      <section id="comment-ca-marche" className="py-24 md:py-32 bg-cream-50">
        <div className="section-container">

          <div className="text-center mb-16">
            <p className="text-amber-500 font-medium text-sm tracking-widest uppercase mb-3">
              Simple & rapide
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-navy-800 mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-navy-600 text-lg max-w-2xl mx-auto">
              En 5 minutes, créez un livre unique. Pas de compte requis pour commencer.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-10 relative">
            {/* Connector line (desktop) */}
            <div className="hidden md:block absolute top-16 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-0.5 bg-gradient-to-r from-amber-300 via-forest-300 to-terra-300 z-0" />

            {STEPS.map(({ number, emoji, title, desc, color, dot }) => (
              <div key={number} className="relative z-10 flex flex-col items-center text-center gap-5">
                {/* Icon circle */}
                <div className={`relative flex h-16 w-16 items-center justify-center rounded-2xl border-2 ${color} bg-white shadow-soft text-2xl`}>
                  {emoji}
                  <span className={`absolute -bottom-2 -right-2 h-5 w-5 rounded-full ${dot} border-2 border-white`} />
                </div>

                <div>
                  <p className="text-xs font-bold text-cream-400 tracking-widest mb-1">
                    ÉTAPE {number}
                  </p>
                  <h3 className="font-serif text-xl font-bold text-navy-800 mb-2">
                    {title}
                  </h3>
                  <p className="text-navy-600 text-sm leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-14">
            <Link href="/creer/theme">
              <Button size="lg" variant="primary" leftIcon={<SparklesIcon className="h-5 w-5" />}>
                Je commence maintenant
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ====================================================
          THEMES SHOWCASE
          ==================================================== */}
      <section id="exemples" className="py-24 bg-gradient-warm">
        <div className="section-container">

          <div className="text-center mb-12">
            <p className="text-amber-500 font-medium text-sm tracking-widest uppercase mb-3">
              6 univers magiques
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-navy-800 mb-4">
              Quel est son univers préféré ?
            </h2>
            <p className="text-navy-600 text-lg max-w-2xl mx-auto">
              De l'espace aux profondeurs des océans, choisissez l'aventure qui fait briller ses yeux.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {THEMES.map(({ emoji, label, bg }) => (
              <Link
                key={label}
                href={`/creer/theme`}
                className="group"
              >
                <div className={`${bg} rounded-3xl aspect-[3/4] flex flex-col items-center justify-center gap-3 p-4 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-book`}>
                  <span className="text-4xl group-hover:scale-125 transition-transform duration-300">
                    {emoji}
                  </span>
                  <span className="text-white font-serif font-semibold text-sm text-center">
                    {label}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================
          DEMO / BOOK PREVIEW
          ==================================================== */}
      <section className="py-24 md:py-32 bg-white overflow-hidden">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Text */}
            <div className="flex flex-col gap-6">
              <div>
                <p className="text-amber-500 font-medium text-sm tracking-widest uppercase mb-3">
                  Aperçu d'une histoire
                </p>
                <h2 className="font-serif text-4xl md:text-5xl font-bold text-navy-800 mb-4 leading-tight">
                  Chaque mot parle
                  <span className="text-gradient-amber block">directement à lui</span>
                </h2>
              </div>

              <div className="space-y-4">
                {[
                  'Son prénom apparaît dans chaque chapitre',
                  'Son portrait est fidèlement illustré',
                  'Ses traits de personnalité guident l\'aventure',
                  'La dédicace de votre choix en ouverture',
                ].map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <div className="shrink-0 h-5 w-5 mt-0.5 rounded-full bg-forest-100 flex items-center justify-center">
                      <CheckCircleIcon className="h-3.5 w-3.5 text-forest-500" />
                    </div>
                    <p className="text-navy-700">{point}</p>
                  </div>
                ))}
              </div>

              <Link href="/creer/theme" className="self-start">
                <Button variant="forest" size="lg" rightIcon={<ArrowRightIcon className="h-5 w-5" />}>
                  Voir l'aperçu de mon livre
                </Button>
              </Link>
            </div>

            {/* Book page mockup */}
            <div className="relative flex justify-center">
              <BookPageMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================
          BENEFITS
          ==================================================== */}
      <section className="py-24 bg-cream-50">
        <div className="section-container">

          <div className="text-center mb-14">
            <p className="text-amber-500 font-medium text-sm tracking-widest uppercase mb-3">
              Pourquoi MonHistoire
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-navy-800">
              Un cadeau comme aucun autre
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {BENEFITS.map(({ icon, title, desc, color, accent }) => (
              <div
                key={title}
                className={`relative rounded-3xl p-6 bg-gradient-to-br ${color} border border-cream-200 hover:-translate-y-1 transition-all duration-300 hover:shadow-soft-lg`}
              >
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-soft mb-4 ${accent}`}>
                  {icon}
                </div>
                <h3 className="font-serif text-lg font-semibold text-navy-800 mb-2">
                  {title}
                </h3>
                <p className="text-navy-600 text-sm leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================
          ECOLOGY
          ==================================================== */}
      <section className="py-24 md:py-32 bg-gradient-forest overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          {/* SVG leaf pattern */}
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <pattern id="leaves" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <text x="10" y="50" fontSize="40" opacity="0.5">🌿</text>
            </pattern>
            <rect width="100%" height="100%" fill="url(#leaves)" />
          </svg>
        </div>

        <div className="section-container relative z-10">
          <div className="max-w-3xl mx-auto text-center text-white">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-8">
              <LeafIcon className="h-4 w-4 text-sage-300" />
              <span className="text-sm font-medium text-sage-200">Engagement éco-responsable</span>
            </div>

            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Des histoires belles,
              <span className="text-amber-400 block">pour une planète belle</span>
            </h2>

            <p className="text-forest-100 text-lg leading-relaxed mb-10">
              Nous croyons que les cadeaux les plus précieux doivent aussi respecter l'avenir
              de ceux à qui on les offre. C'est pourquoi chaque livre MonHistoire est produit
              avec le plus grand soin de l'environnement.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { emoji: '🌱', title: 'Papier FSC', desc: 'Certifié forêts gérées durablement, 100% recyclé' },
                { emoji: '🇫🇷', title: 'Circuit court', desc: 'Imprimé en France, livré en France. 0 conteneur, 0 escale' },
                { emoji: '🌍', title: 'Encres végétales', desc: 'Nos encres sont à base d\'huiles végétales non-toxiques' },
              ].map(({ emoji, title, desc }) => (
                <div key={title} className="bg-white/10 border border-white/20 rounded-3xl p-6 text-left">
                  <span className="text-3xl block mb-3">{emoji}</span>
                  <h3 className="font-serif font-semibold text-white mb-1">{title}</h3>
                  <p className="text-forest-200 text-sm">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================
          TESTIMONIALS
          ==================================================== */}
      <section className="py-24 bg-cream-100">
        <div className="section-container">

          <div className="text-center mb-14">
            <p className="text-amber-500 font-medium text-sm tracking-widest uppercase mb-3">
              Ils en parlent mieux que nous
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-navy-800">
              Des familles conquises
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ id, content, author, role, rating, avatar }) => (
              <div
                key={id}
                className="bg-white rounded-3xl p-7 shadow-soft border border-cream-200 flex flex-col gap-5"
              >
                <StarRating rating={rating} />
                <blockquote className="font-serif text-navy-700 leading-relaxed text-sm italic flex-1">
                  {content}
                </blockquote>
                <div className="flex items-center gap-3 pt-3 border-t border-cream-100">
                  <div className="h-10 w-10 rounded-full bg-cream-200 flex items-center justify-center text-xl">
                    {avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-navy-800 text-sm">{author}</p>
                    <p className="text-navy-500 text-xs">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================
          PRICING
          ==================================================== */}
      <section id="tarifs" className="py-24 md:py-32 bg-white">
        <div className="section-container">

          <div className="text-center mb-14">
            <p className="text-amber-500 font-medium text-sm tracking-widest uppercase mb-3">
              Tarifs
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-navy-800 mb-4">
              Choisissez votre format
            </h2>
            <p className="text-navy-600 text-lg">
              Numérique instantané ou livre imprimé — la qualité reste identique.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PRICING.map(({ id, name, price, badge, highlighted, desc, features }) => (
              <div
                key={id}
                className={[
                  'rounded-3xl p-8 flex flex-col gap-6 relative',
                  highlighted
                    ? 'bg-navy-800 text-white shadow-book ring-2 ring-amber-400 scale-105'
                    : 'bg-cream-50 border border-cream-200 shadow-soft',
                ].join(' ')}
              >
                {badge && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-amber text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-warm whitespace-nowrap">
                    {badge}
                  </span>
                )}

                <div>
                  <h3 className={`font-serif text-xl font-bold mb-1 ${highlighted ? 'text-white' : 'text-navy-800'}`}>
                    {name}
                  </h3>
                  <p className={`text-sm ${highlighted ? 'text-cream-300' : 'text-navy-500'}`}>
                    {desc}
                  </p>
                </div>

                <div className="flex items-end gap-1">
                  <span className={`font-serif text-5xl font-bold ${highlighted ? 'text-white' : 'text-navy-800'}`}>
                    {price}€
                  </span>
                  <span className={`text-sm mb-2 ${highlighted ? 'text-cream-400' : 'text-navy-500'}`}>
                    par livre
                  </span>
                </div>

                <ul className="space-y-3 flex-1">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <CheckCircleIcon className={`h-4 w-4 shrink-0 mt-0.5 ${highlighted ? 'text-amber-400' : 'text-forest-400'}`} />
                      <span className={highlighted ? 'text-cream-200' : 'text-navy-700'}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link href="/creer/theme">
                  <Button
                    variant={highlighted ? 'primary' : 'outline'}
                    size="md"
                    fullWidth
                  >
                    Commencer
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================
          FAQ
          ==================================================== */}
      <section id="faq" className="py-24 bg-cream-50">
        <div className="section-container max-w-3xl mx-auto">

          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl font-bold text-navy-800 mb-3">
              Questions fréquentes
            </h2>
            <p className="text-navy-600">
              Vous avez d'autres questions ?{' '}
              <Link href="/contact" className="text-amber-500 hover:underline font-medium">
                Contactez-nous
              </Link>
            </p>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map(({ q, a }) => (
              <details
                key={q}
                className="group bg-white rounded-2xl border border-cream-200 overflow-hidden"
              >
                <summary className="flex items-center justify-between gap-4 p-6 cursor-pointer list-none select-none hover:bg-cream-50 transition-colors">
                  <span className="font-serif font-semibold text-navy-800">{q}</span>
                  <ChevronDownIcon className="h-5 w-5 text-navy-400 shrink-0 group-open:rotate-180 transition-transform duration-300" />
                </summary>
                <div className="px-6 pb-6 text-navy-600 leading-relaxed">
                  {a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================
          FINAL CTA
          ==================================================== */}
      <section className="py-24 md:py-32 bg-gradient-warm relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-amber-300/20 blur-3xl pointer-events-none" />

        <div className="section-container relative z-10 text-center max-w-3xl mx-auto">
          <div className="text-5xl mb-6">📖</div>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-navy-800 mb-6 leading-tight">
            Prêt à créer l'histoire
            <span className="text-gradient-warm block">de sa vie ?</span>
          </h2>
          <p className="text-navy-600 text-xl mb-10 leading-relaxed">
            Rejoignez les 12 000 familles qui ont déjà offert un livre unique.
            Commencez en 2 minutes, sans créer de compte.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/creer/theme">
              <Button
                size="xl"
                variant="primary"
                leftIcon={<SparklesIcon className="h-5 w-5" />}
                rightIcon={<ArrowRightIcon className="h-5 w-5" />}
              >
                Créer son livre maintenant
              </Button>
            </Link>
          </div>

          <p className="text-navy-500 text-sm mt-6">
            Prévisualisation gratuite · Paiement uniquement si vous adorez
          </p>
        </div>
      </section>
    </main>
  )
}

// ============================================================
// HERO ILLUSTRATION COMPONENT
// ============================================================
function BookHeroIllustration() {
  return (
    <div className="relative w-full max-w-md aspect-[4/5]">
      {/* Shadow / glow */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-amber-300/40 blur-xl rounded-full" />

      {/* Main book */}
      <div className="absolute inset-0 flex items-center justify-center animate-float">
        <div className="relative w-72 h-96 rounded-2xl bg-gradient-to-br from-forest-500 to-forest-700 shadow-book overflow-hidden">
          {/* Book spine */}
          <div className="absolute left-0 top-0 bottom-0 w-5 bg-forest-700 shadow-inner" />

          {/* Cover content */}
          <div className="absolute inset-0 ml-5 p-6 flex flex-col justify-between">
            {/* Stars decoration */}
            <div className="flex gap-1 justify-end">
              {['✦', '✧', '✦'].map((s, i) => (
                <span key={i} className="text-amber-300 text-xs opacity-80">{s}</span>
              ))}
            </div>

            {/* Illustration placeholder */}
            <div className="flex-1 flex items-center justify-center my-4">
              <div className="w-40 h-40 rounded-full bg-gradient-to-br from-amber-300/30 to-amber-400/20 flex items-center justify-center text-6xl">
                🧒
              </div>
            </div>

            {/* Title */}
            <div className="text-center">
              <p className="font-serif text-amber-300 text-xs tracking-widest uppercase mb-1">
                L'aventure de
              </p>
              <p className="font-serif text-white text-2xl font-bold">
                Léa
              </p>
              <div className="mt-2 h-0.5 w-16 mx-auto bg-amber-400/50 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Floating badges */}
      <div className="absolute top-4 right-4 animate-float-delayed">
        <div className="bg-white rounded-2xl px-3 py-2 shadow-warm border border-cream-200 flex items-center gap-2">
          <HeartIcon className="h-4 w-4 text-terra-400 fill-terra-400" />
          <span className="text-xs font-semibold text-navy-700">Unique à 100%</span>
        </div>
      </div>

      <div className="absolute bottom-16 -left-4 animate-float" style={{ animationDelay: '1s' }}>
        <div className="bg-forest-500 rounded-2xl px-3 py-2 shadow-forest flex items-center gap-2">
          <MapPinIcon className="h-4 w-4 text-forest-200" />
          <span className="text-xs font-semibold text-white">Made in France</span>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// BOOK PAGE MOCKUP COMPONENT
// ============================================================
function BookPageMockup() {
  return (
    <div className="relative">
      {/* Glow */}
      <div className="absolute inset-8 bg-amber-300/20 blur-2xl rounded-full" />

      {/* Open book */}
      <div className="relative w-full max-w-lg shadow-book rounded-2xl overflow-hidden bg-cream-50 border border-cream-200">
        <div className="grid grid-cols-2">
          {/* Left page */}
          <div className="p-8 border-r border-cream-200 bg-white">
            {/* Illustration */}
            <div className="aspect-square w-full rounded-xl bg-gradient-to-br from-amber-100 to-cream-200 flex items-center justify-center text-5xl mb-4">
              🌟
            </div>
          </div>

          {/* Right page */}
          <div className="p-8">
            <p className="font-serif text-xs text-navy-400 mb-4 tracking-widest uppercase">
              Chapitre 1
            </p>
            <h3 className="font-serif text-lg font-bold text-navy-800 mb-3 leading-tight">
              Le jour où tout a changé
            </h3>
            {/* Animated text highlight */}
            <p className="text-navy-700 text-sm leading-relaxed">
              Ce matin-là,{' '}
              <mark className="bg-amber-200/80 text-amber-700 rounded px-0.5 font-semibold not-italic">
                Emma
              </mark>{' '}
              se réveilla avec une étrange sensation.
              La forêt derrière sa maison brillait d'une lumière dorée
              qu'elle n'avait jamais vue auparavant…
            </p>
            <div className="mt-4 space-y-1.5">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-2 rounded-full bg-cream-200"
                  style={{ width: `${[100, 85, 92, 60][i]}%` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Page footer */}
        <div className="bg-cream-100 border-t border-cream-200 px-8 py-3 flex justify-between items-center">
          <span className="text-xs text-navy-400 font-serif italic">L'aventure d'Emma</span>
          <span className="text-xs text-navy-400">4</span>
        </div>
      </div>
    </div>
  )
}
