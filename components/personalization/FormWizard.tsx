'use client'

import { useState, useCallback, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Stepper, StepCounter } from '@/components/ui/Stepper'
import { Button } from '@/components/ui/Button'
import { ChevronLeftIcon, ArrowRightIcon } from 'lucide-react'
import type { ProjectFormData, WizardStep } from '@/types'

// Steps
import { ThemeStep }       from './steps/ThemeStep'
import { HeroStep }        from './steps/HeroStep'
import { PortraitStep }    from './steps/PortraitStep'
import { PersonalityStep } from './steps/PersonalityStep'
import { DedicationStep }  from './steps/DedicationStep'
import { SummaryStep }     from './steps/SummaryStep'

// ============================================================
// WIZARD CONFIG
// ============================================================
export { WIZARD_STEPS } from './wizard-steps'
import { WIZARD_STEPS } from './wizard-steps'

const STEP_COMPONENTS = [
  ThemeStep,
  HeroStep,
  PortraitStep,
  PersonalityStep,
  DedicationStep,
  SummaryStep,
]

// ============================================================
// PROPS
// ============================================================
interface FormWizardProps {
  initialStep?: number
  initialData?: Partial<ProjectFormData>
  projectId?:   string
}

// ============================================================
// COMPONENT
// ============================================================
export function FormWizard({
  initialStep = 0,
  initialData = {},
  projectId,
}: FormWizardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [currentStep,  setCurrentStep]  = useState(initialStep)
  const [formData,     setFormData]     = useState<ProjectFormData>(initialData)
  const [direction,    setDirection]    = useState<'forward' | 'backward'>('forward')
  const [errors,       setErrors]       = useState<Partial<Record<keyof ProjectFormData, string>>>({})
  const [submitError,  setSubmitError]  = useState<string | null>(null)

  const totalSteps   = WIZARD_STEPS.length
  const isFirstStep  = currentStep === 0
  const isLastStep   = currentStep === totalSteps - 1
  const StepComponent = STEP_COMPONENTS[currentStep]

  // --------------------------------------------------------
  // VALIDATION
  // --------------------------------------------------------
  const validateStep = useCallback((step: number, data: ProjectFormData): boolean => {
    const newErrors: typeof errors = {}

    switch (step) {
      case 0: // Theme
        if (!data.theme) newErrors.theme = 'Choisissez un thème pour continuer'
        break
      case 1: // Hero
        if (!data.childName?.trim())   newErrors.childName  = 'Le prénom est requis'
        if (!data.childAge)            newErrors.childAge   = 'L\'âge est requis'
        if (!data.childGender)         newErrors.childGender = 'Choisissez une option'
        break
      case 2: // Portrait
        if (!data.hairColor) newErrors.hairColor = 'Choisissez une couleur de cheveux'
        if (!data.eyeColor)  newErrors.eyeColor  = 'Choisissez une couleur des yeux'
        if (!data.skinTone)  newErrors.skinTone  = 'Choisissez un teint'
        break
      case 3: // Personality
        if (!data.personalities?.length) newErrors.personalities = 'Choisissez au moins 1 trait'
        break
      // Steps 4 (dedication) and 5 (summary) are optional
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [])

  // --------------------------------------------------------
  // NAVIGATION
  // --------------------------------------------------------
  const updateFormData = useCallback((updates: Partial<ProjectFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
    // Clear related errors
    const keys = Object.keys(updates) as (keyof ProjectFormData)[]
    setErrors(prev => {
      const next = { ...prev }
      keys.forEach(k => delete next[k])
      return next
    })
  }, [])

  const goNext = useCallback(() => {
    if (!validateStep(currentStep, formData)) return

    setDirection('forward')

    if (isLastStep) {
      setSubmitError(null)
      startTransition(async () => {
        try {
          // Ensure a session exists — sign in anonymously if needed
          const supabase = createClient()
          const { data: { session } } = await supabase.auth.getSession()
          if (!session) {
            const { error: anonErr } = await supabase.auth.signInAnonymously()
            if (anonErr) {
              setSubmitError('Connexion impossible. Veuillez vous connecter pour continuer.')
              return
            }
          }

          const res  = await fetch('/api/preview/generate', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ projectId, formData }),
          })
          const json = await res.json()

          if (!res.ok) {
            setSubmitError(json.error ?? `Erreur ${res.status} — veuillez réessayer`)
            return
          }

          router.push(`/preview/${json.data.projectId}`)
        } catch (err) {
          setSubmitError((err as Error).message ?? 'Erreur réseau — veuillez réessayer')
        }
      })
      return
    }

    setCurrentStep(prev => prev + 1)
  }, [currentStep, formData, isLastStep, projectId, router, validateStep])

  const goBack = useCallback(() => {
    if (isFirstStep) {
      router.push('/')
      return
    }
    setDirection('backward')
    setCurrentStep(prev => prev - 1)
    setErrors({})
  }, [isFirstStep, router])

  const goToStep = useCallback((index: number) => {
    if (index < currentStep) {
      setDirection('backward')
      setCurrentStep(index)
      setErrors({})
    }
  }, [currentStep])

  // --------------------------------------------------------
  // RENDER
  // --------------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">

      {/* ——— TOP BAR ——— */}
      <div className="sticky top-0 z-20 bg-cream-50/95 backdrop-blur-md border-b border-cream-200">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={goBack}
              className="flex items-center gap-1.5 text-sm font-medium text-navy-600 hover:text-amber-500 transition-colors"
            >
              <ChevronLeftIcon className="h-4 w-4" />
              {isFirstStep ? 'Accueil' : 'Retour'}
            </button>

            <StepCounter current={currentStep + 1} total={totalSteps} />
          </div>

          <Stepper
            steps={WIZARD_STEPS}
            currentStep={currentStep}
            onStepClick={goToStep}
          />
        </div>
      </div>

      {/* ——— STEP CONTENT ——— */}
      <div className="flex-1 flex flex-col">
        <div className="max-w-3xl mx-auto w-full px-4 py-10 flex-1">

          {/* Animated step wrapper */}
          <div
            key={currentStep}
            className={`animate-fade-up`}
            style={{ animationDuration: '0.4s' }}
          >
            <StepComponent
              formData={formData}
              onChange={updateFormData}
              errors={errors}
            />
          </div>
        </div>

        {/* ——— BOTTOM NAV ——— */}
        <div className="sticky bottom-0 bg-cream-50/95 backdrop-blur-md border-t border-cream-200 py-4">
          {submitError && (
            <div className="max-w-3xl mx-auto px-4 mb-3">
              <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-700 flex items-start gap-2">
                <span className="shrink-0">⚠️</span>
                <span>{submitError}</span>
              </div>
            </div>
          )}
          <div className="max-w-3xl mx-auto px-4 flex items-center justify-between gap-4">
            <Button
              variant="ghost"
              size="md"
              onClick={goBack}
              leftIcon={<ChevronLeftIcon className="h-4 w-4" />}
            >
              {isFirstStep ? 'Accueil' : 'Retour'}
            </Button>

            <Button
              variant="primary"
              size="lg"
              onClick={goNext}
              loading={isPending}
              rightIcon={
                isLastStep
                  ? <span className="text-base">✨</span>
                  : <ArrowRightIcon className="h-4 w-4" />
              }
              className="min-w-[180px]"
            >
              {isLastStep ? 'Voir l\'aperçu' : 'Continuer'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
