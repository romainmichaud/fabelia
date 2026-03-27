import type { ProjectFormData } from '@/types'

// ============================================================
// THEME DESCRIPTIONS
// ============================================================
const THEME_DESCRIPTIONS: Record<string, string> = {
  space:   'L\'espace sidéral : planètes, étoiles, vaisseaux spatiaux, galaxies inconnues, astronautes et créatures extraterrestres bienveillantes',
  ocean:   'Les profondeurs de l\'océan : récifs de corail, dauphins, baleines, trésors engloutis, créatures des profondeurs, cités sous-marines',
  forest:  'Une forêt enchantée : arbres millénaires qui parlent, fées, elfes, animaux magiques, clairières secrètes, champignons géants',
  castle:  'Un royaume médiéval fantastique : châteaux, dragons, chevaliers, princesses, sorciers, quêtes héroïques, tournois',
  jungle:  'Une jungle tropicale mystérieuse : animaux exotiques, lianes, temples cachés, tribus amicales, plantes carnivores géantes',
  desert:  'Un désert magique : dunes d\'or, oasis cachées, caravanes, esprits du sable, cités perdues, pyramides mystérieuses',
}

const HAIR_LABELS: Record<string, string> = {
  blond:    'blonds',
  chestnut: 'châtains',
  dark:     'bruns',
  red:      'roux',
  gray:     'gris',
}

const EYE_LABELS: Record<string, string> = {
  blue:   'bleus',
  green:  'verts',
  brown:  'marron',
  hazel:  'noisette',
  gray:   'gris',
}

const PERSONALITY_LABELS: Record<string, string> = {
  brave:        'courageux·se — qui n\'hésite jamais face au danger',
  curious:      'curieux·se — qui pose mille questions et explore tout',
  funny:        'drôle et espiègle — qui fait rire avec ses bêtises',
  kind:         'généreux·se et bienveillant·e — qui pense toujours aux autres',
  creative:     'créatif·ve — qui invente des solutions inattendues',
  adventurous:  'aventurier·ère — qui aime se lancer dans l\'inconnu',
}

const GENDER_PRONOUNS: Record<string, { subject: string; object: string; possessive: string; adj: string }> = {
  boy:     { subject: 'il',    object: 'lui',   possessive: 'son',   adj: '' },
  girl:    { subject: 'elle',  object: 'elle',  possessive: 'sa',    adj: 'e' },
  neutral: { subject: 'iel',   object: 'ellui', possessive: 'son',   adj: '' },
}

// ============================================================
// BUILD VARIABLES FROM FORM DATA
// ============================================================
export interface PromptVariables {
  childName:        string
  childAge:         number
  childGender:      string
  hairColor:        string
  eyeColor:         string
  skinTone:         string
  hasGlasses:       string
  personalities:    string
  theme:            string
  themeDescription: string
  dedication:       string
  pronouns:         { subject: string; object: string; possessive: string; adj: string }
  ageGuidance:      string
}

export function buildPromptVariables(data: ProjectFormData): PromptVariables {
  const gender = data.childGender ?? 'neutral'
  const age    = data.childAge    ?? 6

  const ageGuidance =
    age <= 4  ? 'Phrases très courtes (5-8 mots max). Vocabulaire simple. Beaucoup de dialogues. 2-3 paragraphes courts par chapitre.' :
    age <= 7  ? 'Phrases moyennes. Vocabulaire accessible. Mélange narration/dialogue. 4-5 paragraphes par chapitre.' :
               'Phrases variées. Vocabulaire riche. Structure narrative développée. 6-8 paragraphes par chapitre.'

  return {
    childName:        data.childName        ?? 'l\'enfant',
    childAge:         age,
    childGender:      gender,
    hairColor:        HAIR_LABELS[data.hairColor ?? '']  ?? 'indéfinis',
    eyeColor:         EYE_LABELS[data.eyeColor   ?? '']  ?? 'indéfinis',
    skinTone:         data.skinTone ?? 'moyen',
    hasGlasses:       data.hasGlasses ? ', porte des lunettes' : '',
    personalities:    data.personalities
      ?.map(p => PERSONALITY_LABELS[p] ?? p)
      .join(' et ') ?? 'courageux·se',
    theme:            data.theme            ?? 'forest',
    themeDescription: THEME_DESCRIPTIONS[data.theme ?? 'forest'] ?? '',
    dedication:       data.dedication       ? `"${data.dedication}"` : 'Aucune',
    pronouns:         GENDER_PRONOUNS[gender],
    ageGuidance,
  }
}

// ============================================================
// SYSTEM PROMPT — BASE
// ============================================================
export const STORY_SYSTEM_PROMPT = `
Tu es un auteur de livres pour enfants de renommée mondiale, spécialisé dans les histoires personnalisées.
Ton style : chaleureux, imaginatif, poétique mais accessible, émotionnellement engageant.
Tu écris exclusivement en français, avec une maîtrise parfaite de la langue.
Tu ne mentionnes JAMAIS d'intelligence artificielle, d'algorithme ou de technologie dans tes histoires.
Ton seul objectif : créer une histoire magique qui fera briller les yeux de l'enfant qui la lit.
`.trim()

// ============================================================
// STORY GENERATION PROMPT
// ============================================================
export function buildStoryPrompt(vars: PromptVariables, chapterNumber?: number): string {
  const isPreview  = chapterNumber === 1
  const chaptersDesc = isPreview
    ? 'UNIQUEMENT le Chapitre 1'
    : 'les 4 chapitres complets'

  return `
Crée ${chaptersDesc} d'un livre personnalisé pour enfant avec ces caractéristiques précises :

═══ HÉROS DE L'HISTOIRE ═══
• Prénom : ${vars.childName}
• Âge : ${vars.childAge} ans
• Cheveux : ${vars.hairColor}
• Yeux : ${vars.eyeColor}
• Teint : ${vars.skinTone}${vars.hasGlasses}
• Personnalité : ${vars.personalities}

═══ UNIVERS ═══
• Thème : ${vars.theme}
• Description : ${vars.themeDescription}

═══ DÉDICACE (à intégrer subtilement dans l'histoire) ═══
${vars.dedication}

═══ RÈGLES STRICTES ═══
1. ${vars.childName} EST le/la héros·héroïne — jamais un personnage secondaire
2. Les traits de personnalité (${vars.personalities}) DOIVENT guider ses choix
3. L'apparence physique est décrite fidèlement dès la première apparition
4. ${vars.ageGuidance}
5. Chaque chapitre se termine sur un "doux cliffhanger" (curiosité, jamais peur)
6. Aucun contenu violent, effrayant ou inapproprié
7. Ton émotionnel : chaleureux, bienveillant, joyeux
8. Le prénom ${vars.childName} apparaît minimum 3 fois par chapitre

═══ FORMAT DE SORTIE OBLIGATOIRE (JSON strict) ═══
{
  "title": "Titre complet du livre",
  "chapters": [
    {
      "number": 1,
      "title": "Titre du chapitre",
      "content": "Texte complet en HTML léger (<p>, <strong>, <em> uniquement). Minimum 300 mots.",
      "illustration_prompt": "Detailed English description for DALL-E 3: child with ${vars.hairColor} hair, ${vars.eyeColor} eyes, ${vars.skinTone} skin${vars.hasGlasses}, in ${vars.themeDescription} setting. Children's book illustration style, warm colors, detailed, magical atmosphere, safe for children.",
      "key_scene": "Une phrase décrivant la scène clé de ce chapitre"
    }
  ],
  "back_cover_text": "Texte de 4e de couverture (3 phrases max, accrocheur, sans spoiler)",
  "metadata": {
    "word_count": 0,
    "themes_explored": [],
    "moral_lesson": ""
  }
}

Réponds UNIQUEMENT avec le JSON valide, sans texte avant ou après.
`.trim()
}

// ============================================================
// COVER GENERATION PROMPT (4 styles)
// ============================================================
export const COVER_STYLES = [
  {
    id:    'mystere',
    label: 'Mystérieuse',
    style: 'dark magical, navy blue and gold tones, mysterious atmosphere, glowing elements',
  },
  {
    id:    'lumineuse',
    label: 'Lumineuse',
    style: 'bright warm, golden sunlight, cheerful colors, green and amber palette',
  },
  {
    id:    'aquarelle',
    label: 'Aquarelle',
    style: 'watercolor painting style, soft pastel colors, dreamy and poetic',
  },
  {
    id:    'aventure',
    label: 'Aventure',
    style: 'bold colors, dynamic composition, adventure movie poster style, vibrant',
  },
]

export function buildCoverImagePrompt(vars: PromptVariables, style: typeof COVER_STYLES[0]): string {
  return `
Children's book cover illustration. ${style.style}.
Main character: a ${vars.childAge}-year-old child with ${vars.hairColor} hair, ${vars.eyeColor} eyes, ${vars.skinTone} skin tone${vars.hasGlasses ? ', wearing glasses' : ''}.
Setting: ${vars.themeDescription}.
The child looks brave and curious, in an epic pose.
Book title area at top and bottom (leave space for text overlay).
Professional children's book cover art, high quality, detailed, magical, safe for all ages.
No text, no letters, no words in the image.
`.trim()
}

// ============================================================
// ILLUSTRATION PROMPT
// ============================================================
export function buildIllustrationPrompt(
  vars:     PromptVariables,
  scene:    string,
  pageNum:  number,
): string {
  return `
Children's book interior illustration, page ${pageNum}.
Scene: ${scene}
Main character: a ${vars.childAge}-year-old child with ${vars.hairColor} hair, ${vars.eyeColor} eyes, ${vars.skinTone} skin${vars.hasGlasses ? ', glasses' : ''}.
Setting: ${vars.themeDescription}.
Style: warm, detailed, magical, children's picture book. Soft lines, rich colors.
Full page illustration with no text. Safe for children.
`.trim()
}

// ============================================================
// SCORING PROMPT
// ============================================================
export function buildScoringPrompt(
  storyContent: string,
  vars:         PromptVariables,
): string {
  return `
Tu es un expert en littérature jeunesse et en psychologie de l'enfant.
Évalue rigoureusement cette histoire personnalisée selon les critères suivants.

═══ DONNÉES ATTENDUES ═══
• Enfant : ${vars.childName}, ${vars.childAge} ans
• Personnalité : ${vars.personalities}
• Thème : ${vars.theme}

═══ HISTOIRE À ÉVALUER ═══
${storyContent.substring(0, 3000)}${storyContent.length > 3000 ? '\n[...tronqué pour évaluation]' : ''}

═══ CRITÈRES D'ÉVALUATION (note de 0 à 5 pour chacun) ═══
1. personalisation — Le prénom est-il bien intégré ? Les traits de personnalité guident-ils l'histoire ?
2. coherence — La narration est-elle logique et fluide ?
3. age_appropriateness — Le vocabulaire et la complexité sont-ils adaptés à ${vars.childAge} ans ?
4. emotional_depth — L'histoire est-elle engageante et touchante ?
5. creativity — L'histoire est-elle originale et imaginative ?
6. safety — Le contenu est-il 100% adapté aux enfants (aucune violence, peur, contenu inapproprié) ?

═══ FORMAT DE SORTIE (JSON strict) ═══
{
  "scores": {
    "personalisation": 4.5,
    "coherence": 4.8,
    "age_appropriateness": 5.0,
    "emotional_depth": 4.2,
    "creativity": 4.7,
    "safety": 5.0
  },
  "overall": 4.7,
  "passed": false,
  "issues": [
    "Description d'un problème spécifique avec exemple du texte concerné"
  ],
  "improvements": [
    "Amélioration concrète et actionnable"
  ],
  "missing_data": [
    "Donnée manquante qui améliorerait l'histoire (ex: couleur préférée, animal de compagnie)"
  ]
}

Règle : "passed" = true UNIQUEMENT si overall >= 4.5 ET safety = 5.0
Réponds UNIQUEMENT avec le JSON valide.
`.trim()
}

// ============================================================
// IMPROVEMENT PROMPT (when score < threshold)
// ============================================================
export function buildImprovementPrompt(
  originalStory: string,
  improvements:  string[],
  vars:          PromptVariables,
): string {
  return `
Tu as écrit une histoire pour ${vars.childName} (${vars.childAge} ans).
Un comité d'experts a identifié ces points d'amélioration :

${improvements.map((imp, i) => `${i + 1}. ${imp}`).join('\n')}

Voici l'histoire originale :
${originalStory.substring(0, 4000)}

Réécris l'histoire en corrigeant EXACTEMENT ces points, sans en introduire de nouveaux.
Conserve la structure (JSON), le titre et la trame générale.
Réponds UNIQUEMENT avec le JSON valide.
`.trim()
}

// ============================================================
// DYNAMIC QUESTION PROMPT
// ============================================================
export function buildQuestionDetectionPrompt(vars: PromptVariables): string {
  return `
Tu es un assistant qui aide à créer des livres personnalisés pour enfants.

Données actuelles sur l'enfant :
- Prénom : ${vars.childName}
- Âge : ${vars.childAge} ans
- Thème : ${vars.theme} (${vars.themeDescription})
- Personnalité : ${vars.personalities}

Identifie 1 à 3 questions supplémentaires qui enrichiraient SIGNIFICATIVEMENT l'histoire.
Ne demande que des informations non déjà fournies et vraiment utiles.
Exemples : animal préféré, meilleur ami, sport pratiqué, couleur préférée, peur surmontée.

FORMAT JSON strict :
{
  "questions": [
    {
      "key": "favorite_animal",
      "label_fr": "Quel est l'animal préféré de ${vars.childName} ?",
      "type": "text",
      "placeholder": "ex: un lion, une pieuvre...",
      "why": "L'animal pourra apparaître comme allié dans l'histoire"
    }
  ]
}

Si aucune question pertinente, renvoie { "questions": [] }
Réponds UNIQUEMENT avec le JSON valide.
`.trim()
}
