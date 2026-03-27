import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, createAdminClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

const STYLE_LABELS: Record<string, string> = {
  mystere:   'Mystérieuse',
  lumineuse: 'Lumineuse',
  aquarelle: 'Aquarelle',
  aventure:  'Aventure',
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { projectId: string } },
) {
  try {
    const supabase = createServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminSupabase = createAdminClient()
    const { projectId }  = params

    // ——— Fetch project ———
    const { data: project } = await adminSupabase
      .from('book_projects')
      .select('is_preview_ready, generation_status, title')
      .eq('id', projectId)
      .eq('user_id', session.user.id)
      .single()

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // ——— Fetch child name from dynamic_answers ———
    const { data: answers } = await adminSupabase
      .from('dynamic_answers')
      .select('question_key, answer_value')
      .eq('project_id', projectId)

    const answerMap = Object.fromEntries(
      (answers ?? []).map(a => [a.question_key, a.answer_value])
    )
    const childName = answerMap['childName'] ?? 'Votre héros'

    // ——— If generation not complete yet, return status only ———
    if (!project.is_preview_ready) {
      return NextResponse.json({
        success: true,
        data: {
          isReady:          false,
          generationStatus: project.generation_status,
          childName,
        },
      })
    }

    // ——— Fetch preview ———
    const { data: preview } = await adminSupabase
      .from('book_previews')
      .select('chapter_excerpt, chapter_title, illustration_url, expires_at, score')
      .eq('project_id', projectId)
      .eq('is_active', true)
      .single()

    // ——— Fetch cover images ———
    const { data: coverImages } = await adminSupabase
      .from('book_images')
      .select('id, url, style')
      .eq('project_id', projectId)
      .eq('is_cover', true)

    const covers = (coverImages ?? []).map(img => ({
      id:       img.id,
      label:    STYLE_LABELS[img.style ?? ''] ?? img.style ?? 'Couverture',
      imageUrl: img.url ?? '',
    }))

    return NextResponse.json({
      success: true,
      data: {
        isReady:          true,
        generationStatus: project.generation_status,
        childName,
        title:            project.title ?? '',
        chapterTitle:     preview?.chapter_title   ?? '',
        chapterExcerpt:   preview?.chapter_excerpt ?? '',
        illustrationUrl:  preview?.illustration_url ?? '',
        score:            preview?.score ?? 0,
        coverImages:      covers,
      },
    })
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 },
    )
  }
}
