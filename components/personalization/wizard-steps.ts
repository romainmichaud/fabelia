import type { WizardStep } from '@/types'

export const WIZARD_STEPS: WizardStep[] = [
  {
    id:          'theme',
    label:       'Thème',
    description: 'Choisissez l\'univers de l\'aventure',
    icon:        '🗺️',
  },
  {
    id:          'hero',
    label:       'Le héros',
    description: 'Prénom, âge et identité',
    icon:        '🦸',
  },
  {
    id:          'portrait',
    label:       'Portrait',
    description: 'L\'apparence de votre héros',
    icon:        '🎨',
  },
  {
    id:          'personality',
    label:       'Personnalité',
    description: 'Les traits qui définissent le héros',
    icon:        '✨',
  },
  {
    id:          'dedication',
    label:       'Dédicace',
    description: 'Un message du cœur',
    icon:        '💌',
  },
  {
    id:          'summary',
    label:       'Résumé',
    description: 'Vérifiez avant de prévisualiser',
    icon:        '📖',
  },
]
