import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, createAdminClient } from '@/lib/supabase/server'
import { previewService }            from '@/services/previewService'
import { questionEngineService }     from '@/services/questionEngineService'
import { logger }                    from '@/lib/logger'
import type { ProjectFormData }      from '@/types'

export const runtime = 'nodejs'     // Required for OpenAI + Supabase
export const maxDuration = 120       // 2 minutes max

export async function POST(req: NextRequest) {
  const log = logger.child({ route: 'POST /api/preview/generate' })

  try {
    // ——— Auth (optional — guests can generate previews) ———
    const supabase = createServerClient()
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user.id ?? null   // null = guest user

    // ——— Parse body ———
    const body = await req.json() as {
      projectId?: string
      formData:   ProjectFormData
    }

    if (!body.formData) {
      return NextResponse.json({ error: 'formData is required' }, { status: 400 })
    }

    // ——— Validate required fields ———
    const validation = questionEngineService.validate(body.formData)
    if (!validation.valid) {
      return NextResponse.json({
        error:   'Validation failed',
        missing: validation.missing,
      }, { status: 422 })
    }

    // ——— Get or create project ———
    const adminSupabase = createAdminClient()
    let projectId = body.projectId

    if (!projectId) {
      const { data: project, error: createErr } = await adminSupabase
        .from('book_projects')
        .insert({
          // user_id is nullable after migration: ALTER TABLE book_projects ALTER COLUMN user_id DROP NOT NULL
          user_id:  userId as unknown as string,
          theme:    body.formData.theme,
          language: 'fr',
        })
        .select('id')
        .single()

      if (createErr) throw createErr
      projectId = project.id
    }

    // ——— Save inputs ———
    const inputRows = Object.entries({
      childName:     body.formData.childName,
      childAge:      String(body.formData.childAge ?? ''),
      childGender:   body.formData.childGender,
      hairColor:     body.formData.hairColor,
      eyeColor:      body.formData.eyeColor,
      skinTone:      body.formData.skinTone,
      hasGlasses:    String(body.formData.hasGlasses ?? false),
      personalities: JSON.stringify(body.formData.personalities ?? []),
      dedication:    body.formData.dedication ?? '',
      senderName:    body.formData.senderName ?? '',
    }).filter(([, v]) => v !== undefined && v !== '' && v !== 'undefined')

    await questionEngineService.saveAnswers(
      projectId,
      Object.fromEntries(inputRows) as Record<string, string>,
    )

    log.info('starting preview generation', { projectId, userId: userId ?? 'guest' })

    // ——— Generate preview ———
    const result = await previewService.generate(projectId, body.formData)

    return NextResponse.json({
      success: true,
      data: {
        projectId,
        previewId:       result.previewId,
        chapterTitle:    result.chapterTitle,
        chapterExcerpt:  result.chapterExcerpt,
        coverImages:     result.coverImages,
        illustrationUrl: result.illustrationUrl,
        expiresAt:       result.expiresAt,
        score:           result.score,
        passed:          result.passed,
      },
    })
  } catch (err) {
    const error = err as Error
    log.error('preview generation failed', {}, error)

    return NextResponse.json(
      { error: 'Preview generation failed', details: error.message },
      { status: 500 },
    )
  }
}
