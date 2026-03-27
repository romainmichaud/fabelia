'use client'

import { useState } from 'react'
import type { Metadata } from 'next'
import { Button } from '@/components/ui/Button'
import { MailIcon, ClockIcon, MapPinIcon, CheckCircleIcon } from 'lucide-react'

const TOPICS = [
  { id: 'order',        label: '📦 Ma commande' },
  { id: 'delivery',     label: '🚚 Livraison' },
  { id: 'product',      label: '📖 Le produit' },
  { id: 'billing',      label: '💳 Facturation' },
  { id: 'other',        label: '💬 Autre' },
]

export default function ContactPage() {
  const [topic,     setTopic]     = useState('')
  const [name,      setName]      = useState('')
  const [email,     setEmail]     = useState('')
  const [orderNum,  setOrderNum]  = useState('')
  const [message,   setMessage]   = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading,   setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!topic || !name || !email || !message) return

    setLoading(true)
    // In production: POST to /api/support
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-gradient-hero flex items-center justify-center py-20">
        <div className="section-container max-w-lg mx-auto text-center">
          <div className="text-6xl mb-6 animate-bounce">✉️</div>
          <h1 className="font-serif text-3xl font-bold text-navy-800 mb-3">
            Message envoyé !
          </h1>
          <p className="text-navy-600 mb-2">
            Merci {name}, nous avons bien reçu votre message.
          </p>
          <p className="text-navy-500 text-sm mb-8">
            Notre équipe vous répondra à <strong>{email}</strong> dans les 24 heures ouvrées.
          </p>
          <div className="flex items-center gap-2 justify-center text-forest-600 bg-forest-100 border border-forest-200 rounded-2xl px-5 py-3 inline-flex">
            <CheckCircleIcon className="h-5 w-5" />
            <span className="text-sm font-medium">Ticket #TKT-{Math.floor(Math.random() * 9000) + 1000}</span>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-cream-50">
      {/* Hero */}
      <section className="bg-gradient-warm py-16">
        <div className="section-container max-w-3xl mx-auto text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-navy-800 mb-4">
            Contactez-nous
          </h1>
          <p className="text-navy-600 text-lg">
            Une question ? Un problème ? Nous sommes là pour vous aider.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="section-container max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-10">

            {/* Info sidebar */}
            <div className="space-y-5">
              {[
                {
                  icon:  <MailIcon  className="h-5 w-5" />,
                  title: 'Email',
                  desc:  'contact@monhistoire.fr',
                  sub:   null,
                  color: 'text-amber-500 bg-amber-100',
                },
                {
                  icon:  <ClockIcon  className="h-5 w-5" />,
                  title: 'Disponibilité',
                  desc:  'Lun – Ven, 9h – 18h',
                  sub:   'Réponse sous 24h ouvrées',
                  color: 'text-forest-500 bg-forest-100',
                },
                {
                  icon:  <MapPinIcon className="h-5 w-5" />,
                  title: 'Siège social',
                  desc:  'Paris, France',
                  sub:   'Entreprise française',
                  color: 'text-navy-500 bg-navy-100',
                },
              ].map(({ icon, title, desc, sub, color }) => (
                <div key={title} className="flex items-start gap-3 bg-white rounded-2xl p-4 border border-cream-200 shadow-soft">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                    {icon}
                  </div>
                  <div>
                    <p className="font-semibold text-navy-800 text-sm">{title}</p>
                    <p className="text-navy-600 text-sm">{desc}</p>
                    {sub && <p className="text-navy-400 text-xs mt-0.5">{sub}</p>}
                  </div>
                </div>
              ))}
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              <form
                onSubmit={handleSubmit}
                className="bg-white rounded-3xl border border-cream-200 shadow-soft p-6 md:p-8 space-y-6"
              >
                {/* Topic */}
                <div>
                  <label className="block text-sm font-semibold text-navy-700 mb-3">
                    Sujet de votre message *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {TOPICS.map(({ id, label }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setTopic(id)}
                        className={[
                          'px-4 py-2 rounded-full text-sm font-medium border-2 transition-all',
                          topic === id
                            ? 'border-amber-400 bg-amber-50 text-amber-600'
                            : 'border-cream-200 bg-white text-navy-600 hover:border-amber-200',
                        ].join(' ')}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name + Email */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-navy-700 mb-1.5">
                      Votre nom *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                      placeholder="Sophie Martin"
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-navy-700 mb-1.5">
                      Votre email *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      placeholder="sophie@exemple.fr"
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Order number (optional) */}
                {(topic === 'order' || topic === 'delivery' || topic === 'billing') && (
                  <div className="animate-fade-up">
                    <label className="block text-sm font-semibold text-navy-700 mb-1.5">
                      Numéro de commande (si applicable)
                    </label>
                    <input
                      type="text"
                      value={orderNum}
                      onChange={e => setOrderNum(e.target.value)}
                      placeholder="ORD-2024-00042"
                      className="form-input"
                    />
                  </div>
                )}

                {/* Message */}
                <div>
                  <label className="block text-sm font-semibold text-navy-700 mb-1.5">
                    Votre message *
                  </label>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    required
                    rows={5}
                    placeholder="Décrivez votre question ou problème en détail…"
                    className="form-input resize-none"
                  />
                  <p className="text-xs text-navy-400 mt-1 text-right">
                    {message.length} caractères
                  </p>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={loading}
                  disabled={!topic || !name || !email || !message}
                  leftIcon={<MailIcon className="h-5 w-5" />}
                >
                  Envoyer le message
                </Button>

                <p className="text-center text-xs text-navy-400">
                  Nous ne partageons jamais vos données avec des tiers.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
