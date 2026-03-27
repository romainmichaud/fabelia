import { createAdminClient }   from '@/lib/supabase/server'
import { generationService }   from './generationService'
import { exportService }       from './exportService'
import { printService }        from './printService'
import { logger }              from '@/lib/logger'
import type { OrderStatus }    from '@/types'

// ============================================================
// TYPES
// ============================================================
export interface DashboardStats {
  orders: {
    total:      number
    today:      number
    revenue:    number
    revenueToday: number
  }
  generation: {
    total:     number
    completed: number
    failed:    number
    queued:    number
  }
  print: {
    total:     number
    submitted: number
    shipped:   number
  }
  support: {
    open:     number
    urgent:   number
  }
  prompts: {
    avgScore:  number
    flagged:   number
  }
}

export interface OrderFilters {
  status?:      OrderStatus
  productType?: string
  dateFrom?:    string
  dateTo?:      string
  search?:      string
  page?:        number
  perPage?:     number
}

// ============================================================
// SERVICE
// ============================================================
export const adminService = {

  // ----------------------------------------------------------
  // DASHBOARD STATS
  // ----------------------------------------------------------
  async getDashboardStats(): Promise<DashboardStats> {
    const supabase = createAdminClient()
    const today    = new Date().toISOString().split('T')[0]

    const [
      ordersTotal,
      ordersToday,
      generationStats,
      printStats,
      supportStats,
      promptStats,
    ] = await Promise.all([
      // All orders
      supabase
        .from('orders')
        .select('total_amount, status', { count: 'exact' }),

      // Today's orders
      supabase
        .from('orders')
        .select('total_amount', { count: 'exact' })
        .gte('created_at', `${today}T00:00:00`),

      // Generation stats
      supabase
        .from('book_projects')
        .select('generation_status', { count: 'exact' }),

      // Print stats
      supabase
        .from('print_jobs')
        .select('status', { count: 'exact' }),

      // Support stats
      supabase
        .from('support_tickets')
        .select('status, priority', { count: 'exact' })
        .eq('status', 'open'),

      // Prompt score stats
      supabase
        .from('prompt_scores')
        .select('score, status'),
    ])

    const allOrders    = ordersTotal.data ?? []
    const todayOrders  = ordersToday.data ?? []
    const genData      = generationStats.data ?? []
    const printData    = printStats.data ?? []
    const supportData  = supportStats.data ?? []
    const scoreData    = promptStats.data ?? []

    const paidOrders = allOrders.filter(o =>
      ['paid', 'processing', 'completed'].includes(o.status ?? '')
    )

    return {
      orders: {
        total:        allOrders.length,
        today:        todayOrders.length,
        revenue:      paidOrders.reduce((s, o) => s + (o.total_amount ?? 0), 0),
        revenueToday: todayOrders.reduce((s, o) => s + (o.total_amount ?? 0), 0),
      },
      generation: {
        total:     genData.length,
        completed: genData.filter(g => g.generation_status === 'completed').length,
        failed:    genData.filter(g => g.generation_status === 'failed').length,
        queued:    genData.filter(g => ['queued', 'generating_text', 'generating_images', 'assembling'].includes(g.generation_status ?? '')).length,
      },
      print: {
        total:     printData.length,
        submitted: printData.filter(p => p.status === 'submitted').length,
        shipped:   printData.filter(p => p.status === 'shipped').length,
      },
      support: {
        open:   supportData.length,
        urgent: supportData.filter(s => s.priority === 'urgent').length,
      },
      prompts: {
        avgScore: scoreData.length
          ? parseFloat((scoreData.reduce((s, p) => s + (p.score ?? 0), 0) / scoreData.length).toFixed(2))
          : 0,
        flagged: scoreData.filter(p => p.status === 'flagged').length,
      },
    }
  },

  // ----------------------------------------------------------
  // ORDERS
  // ----------------------------------------------------------
  async getOrders(filters: OrderFilters) {
    const supabase  = createAdminClient()
    const page      = filters.page    ?? 1
    const perPage   = filters.perPage ?? 20
    const offset    = (page - 1) * perPage

    let query = supabase
      .from('orders')
      .select(`
        id, order_number, status, product_type, book_format,
        total_amount, currency, created_at,
        profiles(email, full_name),
        book_projects(title, generation_status)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + perPage - 1)

    if (filters.status)      query = query.eq('status', filters.status as 'draft' | 'pending_payment' | 'paid' | 'processing' | 'completed' | 'cancelled' | 'refunded')
    if (filters.productType) query = query.eq('product_type', filters.productType as 'digital' | 'print' | 'bundle')
    if (filters.dateFrom)    query = query.gte('created_at', filters.dateFrom)
    if (filters.dateTo)      query = query.lte('created_at', filters.dateTo)
    if (filters.search) {
      query = query.or(
        `order_number.ilike.%${filters.search}%`
      )
    }

    const { data, count, error } = await query
    if (error) throw error

    return {
      data:        data ?? [],
      total:       count ?? 0,
      page,
      perPage,
      totalPages:  Math.ceil((count ?? 0) / perPage),
    }
  },

  async updateOrderStatus(
    orderId:  string,
    status:   OrderStatus,
    adminId:  string,
    note?:    string,
  ): Promise<void> {
    const supabase = createAdminClient()

    const { data: before } = await supabase
      .from('orders')
      .select('status')
      .eq('id', orderId)
      .single()

    await supabase.from('orders').update({ status }).eq('id', orderId)

    await adminService.logAction(adminId, 'update_order_status', 'orders', orderId, {
      from: before?.status,
      to:   status,
      note,
    })

    logger.info('admin — order status updated', { orderId, from: before?.status, to: status, adminId })
  },

  // ----------------------------------------------------------
  // PROJECTS
  // ----------------------------------------------------------
  async getProjects(filters: {
    status?: string; search?: string; page?: number; perPage?: number
  }) {
    const supabase = createAdminClient()
    const page     = filters.page    ?? 1
    const perPage  = filters.perPage ?? 20
    const offset   = (page - 1) * perPage

    let query = supabase
      .from('book_projects')
      .select(`
        id, title, theme, generation_status, is_preview_ready, is_book_ready,
        product_type, paid_at, created_at,
        profiles(email, full_name)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + perPage - 1)

    if (filters.status) query = query.eq('generation_status', filters.status as 'idle' | 'queued' | 'generating_text' | 'generating_images' | 'assembling' | 'completed' | 'failed')

    const { data, count, error } = await query
    if (error) throw error

    return { data: data ?? [], total: count ?? 0, page, perPage }
  },

  // ----------------------------------------------------------
  // PROMPT VERSIONS
  // ----------------------------------------------------------
  async getPromptVersions() {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('prompt_versions')
      .select('*, profiles(full_name)')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data ?? []
  },

  async createPromptVersion(payload: {
    name:        string
    template:    string
    use_case:    string
    model:       string
    temperature: number
    max_tokens:  number
    variables:   string[]
    adminId:     string
  }): Promise<{ id: string }> {
    const supabase = createAdminClient()

    // Determine next version number
    const { data: existing } = await supabase
      .from('prompt_versions')
      .select('version')
      .eq('name', payload.name)
      .order('version', { ascending: false })
      .limit(1)
      .single()

    const version = (existing?.version ?? 0) + 1

    const { data, error } = await supabase
      .from('prompt_versions')
      .insert({
        name:        payload.name,
        version,
        template:    payload.template,
        use_case:    payload.use_case,
        model:       payload.model,
        temperature: payload.temperature,
        max_tokens:  payload.max_tokens,
        variables:   payload.variables,
        is_active:   false,   // Must be explicitly activated
        created_by:  payload.adminId,
      })
      .select('id')
      .single()

    if (error) throw error

    await adminService.logAction(payload.adminId, 'create_prompt_version', 'prompt_versions', data.id)
    return data
  },

  async activatePromptVersion(versionId: string, adminId: string): Promise<void> {
    const supabase = createAdminClient()

    // Get the version's use_case
    const { data: version } = await supabase
      .from('prompt_versions')
      .select('use_case, name, version')
      .eq('id', versionId)
      .single()

    if (!version) throw new Error('Prompt version not found')

    // Deactivate all versions for this use_case
    await supabase
      .from('prompt_versions')
      .update({ is_active: false })
      .eq('use_case', version.use_case)

    // Activate the target version
    await supabase
      .from('prompt_versions')
      .update({ is_active: true })
      .eq('id', versionId)

    await adminService.logAction(adminId, 'activate_prompt_version', 'prompt_versions', versionId, {
      name:     version.name,
      version:  version.version,
      use_case: version.use_case,
    })

    logger.info('admin — prompt version activated', { versionId, adminId })
  },

  // ----------------------------------------------------------
  // SUPPORT TICKETS
  // ----------------------------------------------------------
  async getSupportTickets(filters: {
    status?: string; priority?: string; page?: number; perPage?: number
  }) {
    const supabase = createAdminClient()
    const page     = filters.page    ?? 1
    const perPage  = filters.perPage ?? 20
    const offset   = (page - 1) * perPage

    let query = supabase
      .from('support_tickets')
      .select(`
        id, subject, status, priority, created_at,
        profiles(email, full_name),
        orders(order_number)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + perPage - 1)

    if (filters.status)   query = query.eq('status', filters.status as 'open' | 'in_progress' | 'resolved' | 'closed')
    if (filters.priority) query = query.eq('priority', filters.priority as 'low' | 'normal' | 'high' | 'urgent')

    const { data, count, error } = await query
    if (error) throw error

    return { data: data ?? [], total: count ?? 0, page, perPage }
  },

  async resolveTicket(ticketId: string, adminId: string, note?: string): Promise<void> {
    const supabase = createAdminClient()

    await supabase
      .from('support_tickets')
      .update({ status: 'resolved', resolved_by: adminId, resolved_at: new Date().toISOString() })
      .eq('id', ticketId)

    if (note) {
      await supabase.from('support_messages').insert({
        ticket_id:   ticketId,
        author_id:   adminId,
        body:        note,
        is_internal: true,
      })
    }

    await adminService.logAction(adminId, 'resolve_ticket', 'support_tickets', ticketId)
  },

  // ----------------------------------------------------------
  // REGENERATION ACTIONS
  // ----------------------------------------------------------
  async retryGeneration(projectId: string, adminId: string): Promise<void> {
    await generationService.retryGeneration(projectId)
    await adminService.logAction(adminId, 'retry_generation', 'book_projects', projectId)
  },

  async regenerateIllustration(projectId: string, pageId: string, adminId: string): Promise<string> {
    const url = await generationService.regenerateIllustration(projectId, pageId)
    await adminService.logAction(adminId, 'regenerate_illustration', 'book_pages', pageId, { projectId })
    return url
  },

  async regenerateCover(projectId: string, styleId: string, adminId: string): Promise<string> {
    const url = await generationService.regenerateCover(projectId, styleId)
    await adminService.logAction(adminId, 'regenerate_cover', 'book_projects', projectId, { styleId })
    return url
  },

  // ----------------------------------------------------------
  // FLAGGED CONTENT REVIEW
  // ----------------------------------------------------------
  async getFlaggedContent(page = 1, perPage = 20) {
    const supabase = createAdminClient()
    const offset   = (page - 1) * perPage

    const { data, count, error } = await supabase
      .from('prompt_scores')
      .select(`
        id, score, dimensions, status, flagged_reason, created_at,
        prompt_sessions(id, resolved_prompt, response, project_id)
      `, { count: 'exact' })
      .eq('status', 'flagged')
      .order('created_at', { ascending: false })
      .range(offset, offset + perPage - 1)

    if (error) throw error
    return { data: data ?? [], total: count ?? 0 }
  },

  async reviewContent(
    scoreId:  string,
    decision: 'approve' | 'reject',
    adminId:  string,
  ): Promise<void> {
    const supabase = createAdminClient()

    await supabase
      .from('prompt_scores')
      .update({
        status:      decision === 'approve' ? 'scored' : 'archived',
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', scoreId)

    await adminService.logAction(adminId, `content_review_${decision}`, 'prompt_scores', scoreId)
  },

  // ----------------------------------------------------------
  // ADMIN LOGS
  // ----------------------------------------------------------
  async logAction(
    adminId:    string,
    action:     string,
    resource:   string,
    resourceId?: string,
    details?:   Record<string, unknown>,
  ): Promise<void> {
    const supabase = createAdminClient()

    await supabase.from('admin_logs').insert({
      admin_id:    adminId,
      action,
      resource,
      resource_id: resourceId ?? null,
      after_state: (details ?? null) as Record<string, string | number | boolean | null> | null,
    })
  },

  async getLogs(filters: {
    adminId?: string; action?: string; resource?: string
    dateFrom?: string; dateTo?: string; page?: number; perPage?: number
  }) {
    const supabase = createAdminClient()
    const page     = filters.page    ?? 1
    const perPage  = filters.perPage ?? 50
    const offset   = (page - 1) * perPage

    let query = supabase
      .from('admin_logs')
      .select(`
        id, action, resource, resource_id, after_state, created_at, ip_address,
        profiles(email, full_name)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + perPage - 1)

    if (filters.adminId)  query = query.eq('admin_id', filters.adminId)
    if (filters.action)   query = query.eq('action', filters.action)
    if (filters.resource) query = query.eq('resource', filters.resource)
    if (filters.dateFrom) query = query.gte('created_at', filters.dateFrom)
    if (filters.dateTo)   query = query.lte('created_at', filters.dateTo)

    const { data, count, error } = await query
    if (error) throw error

    return { data: data ?? [], total: count ?? 0, page, perPage }
  },

  // ----------------------------------------------------------
  // USERS
  // ----------------------------------------------------------
  async getUsers(filters: { search?: string; role?: string; page?: number; perPage?: number }) {
    const supabase = createAdminClient()
    const page     = filters.page    ?? 1
    const perPage  = filters.perPage ?? 20
    const offset   = (page - 1) * perPage

    let query = supabase
      .from('profiles')
      .select('id, email, full_name, role, locale, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + perPage - 1)

    if (filters.role) query = query.eq('role', filters.role as 'user' | 'admin')
    if (filters.search) {
      query = query.or(`email.ilike.%${filters.search}%,full_name.ilike.%${filters.search}%`)
    }

    const { data, count, error } = await query
    if (error) throw error

    return { data: data ?? [], total: count ?? 0, page, perPage }
  },
}
