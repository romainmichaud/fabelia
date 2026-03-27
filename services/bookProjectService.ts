import { createAdminClient }        from '@/lib/supabase/server'
import { createServerClient }       from '@/lib/supabase/server'
import { questionEngineService }    from './questionEngineService'
import { logger }                   from '@/lib/logger'
import type { BookProject, ProjectFormData } from '@/types'

export const bookProjectService = {

  // ----------------------------------------------------------
  // GET USER'S PROJECTS
  // ----------------------------------------------------------
  async getUserProjects(userId: string) {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('book_projects')
      .select(`
        id, title, theme, generation_status,
        is_preview_ready, is_book_ready,
        product_type, language, created_at, paid_at,
        orders(id, status, product_type, book_format, total_amount, created_at),
        print_jobs(id, status, tracking_number, estimated_delivery)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data ?? []
  },

  // ----------------------------------------------------------
  // GET SINGLE PROJECT (with auth check)
  // ----------------------------------------------------------
  async getProject(projectId: string, userId: string) {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('book_projects')
      .select(`
        id, title, theme, generation_status,
        is_preview_ready, is_book_ready,
        product_type, language, created_at, paid_at,
        book_pages(
          id, page_number, page_type,
          content_text, illustration_url, image_style,
          chapter_title
        ),
        book_images(id, style, url, is_selected, is_cover)
      `)
      .eq('id', projectId)
      .eq('user_id', userId)
      .single()

    if (error || !data) return null
    return data
  },

  // ----------------------------------------------------------
  // GET PROJECT FORM DATA (reconstruct from DB)
  // ----------------------------------------------------------
  async getFormData(projectId: string): Promise<Partial<ProjectFormData>> {
    const supabase = createAdminClient()

    const { data: answers } = await supabase
      .from('dynamic_answers')
      .select('question_key, answer_value')
      .eq('project_id', projectId)

    if (!answers || answers.length === 0) return {}

    const answerMap = Object.fromEntries(
      answers
        .filter(a => a.answer_value !== null)
        .map(a => [a.question_key, a.answer_value as string])
    )

    return questionEngineService.normalizeInputs(answerMap)
  },

  // ----------------------------------------------------------
  // UPDATE PROJECT TITLE
  // ----------------------------------------------------------
  async updateTitle(projectId: string, userId: string, title: string): Promise<void> {
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('book_projects')
      .update({ title })
      .eq('id', projectId)
      .eq('user_id', userId)

    if (error) throw error
    logger.info('project title updated', { projectId })
  },

  // ----------------------------------------------------------
  // MARK PAID
  // ----------------------------------------------------------
  async markPaid(projectId: string, productType: string): Promise<void> {
    const supabase = createAdminClient()

    await supabase
      .from('book_projects')
      .update({
        paid_at:      new Date().toISOString(),
        product_type: productType as 'digital' | 'print' | 'bundle',
      })
      .eq('id', projectId)

    logger.info('project marked paid', { projectId, productType })
  },

  // ----------------------------------------------------------
  // GET PREVIEW DATA
  // ----------------------------------------------------------
  async getPreview(projectId: string) {
    const supabase = createAdminClient()

    const { data } = await supabase
      .from('book_previews')
      .select('*')
      .eq('project_id', projectId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    return data ?? null
  },

  // ----------------------------------------------------------
  // SELECT COVER
  // ----------------------------------------------------------
  async selectCover(projectId: string, userId: string, imageId: string): Promise<void> {
    const supabase = createAdminClient()

    // Verify ownership
    const { data: project } = await supabase
      .from('book_projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single()

    if (!project) throw new Error('Project not found')

    // Deselect all covers for this project
    await supabase
      .from('book_images')
      .update({ is_selected: false })
      .eq('project_id', projectId)
      .eq('is_cover', true)

    // Select the chosen one
    await supabase
      .from('book_images')
      .update({ is_selected: true })
      .eq('id', imageId)
      .eq('project_id', projectId)

    logger.info('cover selected', { projectId, imageId })
  },
}
