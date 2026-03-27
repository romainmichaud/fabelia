'use client'

import { CheckIcon } from 'lucide-react'
import type { WizardStep } from '@/types'

interface StepperProps {
  steps:       WizardStep[]
  currentStep: number          // 0-indexed
  onStepClick?: (index: number) => void
  variant?: 'horizontal' | 'compact'
}

export function Stepper({
  steps,
  currentStep,
  onStepClick,
  variant = 'horizontal',
}: StepperProps) {
  if (variant === 'compact') {
    return <CompactStepper steps={steps} currentStep={currentStep} />
  }

  return (
    <nav
      aria-label="Étapes de personnalisation"
      className="w-full"
    >
      {/* Progress bar */}
      <div className="relative mb-8">
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-cream-300">
          <div
            className="h-full bg-gradient-amber transition-all duration-500 ease-out-expo"
            style={{
              width: `${Math.min((currentStep / (steps.length - 1)) * 100, 100)}%`,
            }}
          />
        </div>

        {/* Steps */}
        <ol className="relative flex justify-between">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep
            const isCurrent   = index === currentStep
            const isClickable = onStepClick && index < currentStep

            return (
              <li
                key={step.id}
                className="flex flex-col items-center gap-3"
                style={{ width: `${100 / steps.length}%` }}
              >
                {/* Circle */}
                <button
                  type="button"
                  onClick={() => isClickable && onStepClick(index)}
                  disabled={!isClickable}
                  aria-current={isCurrent ? 'step' : undefined}
                  className={[
                    'relative z-10 flex h-10 w-10 items-center justify-center rounded-full',
                    'text-sm font-semibold font-sans',
                    'transition-all duration-300 ease-spring',
                    'border-2',
                    isCompleted
                      ? 'bg-forest-500 border-forest-500 text-white cursor-pointer hover:scale-110'
                      : isCurrent
                        ? 'bg-white border-amber-400 text-amber-500 shadow-warm scale-110'
                        : 'bg-cream-100 border-cream-300 text-cream-400 cursor-default',
                  ].join(' ')}
                >
                  {isCompleted ? (
                    <CheckIcon className="h-4 w-4 stroke-[2.5]" />
                  ) : (
                    <span>{step.icon || String(index + 1)}</span>
                  )}

                  {/* Pulse ring for current */}
                  {isCurrent && (
                    <span className="absolute inset-0 rounded-full border-2 border-amber-400 animate-ping opacity-30" />
                  )}
                </button>

                {/* Label */}
                <div className="text-center px-1">
                  <p
                    className={[
                      'text-xs font-medium font-sans transition-colors duration-300 hidden sm:block',
                      isCurrent   ? 'text-amber-500'  :
                      isCompleted ? 'text-forest-500'  :
                                    'text-cream-400',
                    ].join(' ')}
                  >
                    {step.label}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      </div>

      {/* Current step description */}
      <div className="text-center animate-fade-up" key={currentStep}>
        <p className="text-sm text-navy-600">
          Étape <span className="font-semibold text-amber-500">{currentStep + 1}</span> sur{' '}
          <span className="font-semibold">{steps.length}</span>
          {' · '}
          <span className="text-navy-700">{steps[currentStep]?.description}</span>
        </p>
      </div>
    </nav>
  )
}

// ============================================================
// COMPACT VARIANT — dots only
// ============================================================
function CompactStepper({
  steps,
  currentStep,
}: {
  steps: WizardStep[]
  currentStep: number
}) {
  return (
    <div className="flex items-center justify-center gap-1.5" aria-label="Progression">
      {steps.map((_, index) => {
        const isCompleted = index < currentStep
        const isCurrent   = index === currentStep

        return (
          <span
            key={index}
            className={[
              'rounded-full transition-all duration-300',
              isCurrent   ? 'w-6 h-2 bg-amber-400' :
              isCompleted ? 'w-2 h-2 bg-forest-400' :
                            'w-2 h-2 bg-cream-300',
            ].join(' ')}
            aria-hidden="true"
          />
        )
      })}
    </div>
  )
}

// ============================================================
// STEP COUNTER BADGE
// ============================================================
export function StepCounter({
  current,
  total,
}: {
  current: number
  total:   number
}) {
  const percent = Math.round((current / total) * 100)

  return (
    <div className="flex items-center gap-3">
      {/* Circular progress */}
      <div className="relative h-10 w-10">
        <svg className="h-10 w-10 -rotate-90" viewBox="0 0 36 36">
          <circle
            cx="18" cy="18" r="15.9155"
            className="fill-none stroke-cream-200"
            strokeWidth="2"
          />
          <circle
            cx="18" cy="18" r="15.9155"
            className="fill-none stroke-amber-400 transition-all duration-500"
            strokeWidth="2"
            strokeDasharray={`${percent} ${100 - percent}`}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-navy-800">
          {current}
        </span>
      </div>

      <div>
        <p className="text-xs text-navy-500">Étape</p>
        <p className="text-sm font-semibold text-navy-800">
          {current} / {total}
        </p>
      </div>
    </div>
  )
}
