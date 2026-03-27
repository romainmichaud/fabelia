import type { Metadata } from 'next'
import { notFound }    from 'next/navigation'
import { FormWizard } from '@/components/personalization/FormWizard'
import { WIZARD_STEPS } from '@/components/personalization/wizard-steps'

export const metadata: Metadata = { title: 'Créer votre livre' }

const STEP_IDS = WIZARD_STEPS.map(s => s.id)

interface Props {
  params: { step: string }
}

export function generateStaticParams() {
  return STEP_IDS.map(step => ({ step }))
}

export default function CreatePage({ params }: Props) {
  const stepIndex = STEP_IDS.indexOf(params.step)
  if (stepIndex === -1) notFound()

  return <FormWizard initialStep={stepIndex} />
}
