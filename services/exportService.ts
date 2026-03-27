import { createAdminClient } from '@/lib/supabase/server'
import { logger }            from '@/lib/logger'

// ============================================================
// EXPORT SERVICE — uses book_exports table
// ============================================================

export type ExportFormat = 'pdf' | 'print_ready_pdf'

export interface ExportRecord {
  id:           string
  project_id:   string
  order_id:     string | null
  filename:     string
  storage_path: string
  type:         string
  file_size:    number | null
  generated_at: string
}

// ============================================================
// SERVICE
// ============================================================
export const exportService = {

  // ----------------------------------------------------------
  // GENERATE PDF (digital quality)
  // ----------------------------------------------------------
  async generatePDF(projectId: string): Promise<ExportRecord> {
    const supabase = createAdminClient()
    const log      = logger.child({ service: 'export', projectId, format: 'pdf' })

    log.info('PDF generation start')

    // Load all pages + images
    const { data: pages } = await supabase
      .from('book_pages')
      .select('*, book_images(*)')
      .eq('project_id', projectId)
      .order('page_number')

    if (!pages?.length) throw new Error('No pages found for PDF generation')

    // Load project metadata
    const { data: project } = await supabase
      .from('book_projects')
      .select('title')
      .eq('id', projectId)
      .single()

    // Generate PDF bytes
    const pdfBytes = await exportService.renderPDF(pages, project?.title ?? 'Mon Histoire')

    // Upload to Supabase Storage
    const fileName    = `${projectId}/book_${Date.now()}.pdf`
    const storagePath = `exports/${fileName}`

    const { error: uploadErr } = await supabase.storage
      .from('exports')
      .upload(storagePath, pdfBytes, {
        contentType:  'application/pdf',
        cacheControl: '3600',
        upsert:       true,
      })

    if (uploadErr) throw uploadErr

    // Insert export record
    const { data: exportRecord, error: insertErr } = await supabase
      .from('book_exports')
      .insert({
        project_id:   projectId,
        filename:     fileName,
        storage_path: storagePath,
        type:         'pdf',
        file_size:    pdfBytes.byteLength,
      })
      .select()
      .single()

    if (insertErr) throw insertErr

    log.info('PDF generated', {
      exportId: exportRecord.id,
      size:     pdfBytes.byteLength,
      pages:    pages.length,
    })

    return exportRecord as ExportRecord
  },

  // ----------------------------------------------------------
  // GENERATE PRINT-READY PDF (with bleed, crop marks, CMYK)
  // ----------------------------------------------------------
  async generatePrintReadyPDF(projectId: string): Promise<ExportRecord> {
    const supabase = createAdminClient()
    const log      = logger.child({ service: 'export', projectId, format: 'print_ready_pdf' })

    log.info('print-ready PDF generation start')

    const { data: pages } = await supabase
      .from('book_pages')
      .select('*, book_images(*)')
      .eq('project_id', projectId)
      .order('page_number')

    const { data: project } = await supabase
      .from('book_projects')
      .select('title')
      .eq('id', projectId)
      .single()

    // Print-ready: higher resolution, with bleed marks
    const pdfBytes = await exportService.renderPrintReadyPDF(
      pages ?? [],
      project?.title ?? 'Mon Histoire',
    )

    const storagePath = `exports/${projectId}/print_${Date.now()}.pdf`
    const fileName    = `${projectId}/print_${Date.now()}.pdf`

    await supabase.storage
      .from('exports')
      .upload(storagePath, pdfBytes, {
        contentType: 'application/pdf',
        upsert:      true,
      })

    const { data: exportRecord, error: insertErr } = await supabase
      .from('book_exports')
      .insert({
        project_id:   projectId,
        filename:     fileName,
        storage_path: storagePath,
        type:         'print_ready_pdf',
        file_size:    pdfBytes.byteLength,
      })
      .select()
      .single()

    if (insertErr) throw insertErr

    log.info('print-ready PDF generated', { size: pdfBytes.byteLength })

    return exportRecord as ExportRecord
  },

  // ----------------------------------------------------------
  // RENDER PDF — core implementation (stub)
  // ----------------------------------------------------------
  async renderPDF(
    pages: { page_type: string; content_text?: string | null; metadata?: unknown }[],
    title: string,
  ): Promise<Uint8Array> {
    logger.warn('renderPDF — using stub implementation, replace with real renderer')
    const pdfContent = `%PDF-1.4\n%MonHistoire Book: ${title}\n%Pages: ${pages.length}\n%%EOF`
    return new TextEncoder().encode(pdfContent)
  },

  async renderPrintReadyPDF(
    pages: { page_type: string; content_text?: string | null; metadata?: unknown }[],
    title: string,
  ): Promise<Uint8Array> {
    logger.warn('renderPrintReadyPDF — using stub, replace with real renderer')
    return exportService.renderPDF(pages, title)
  },

  // ----------------------------------------------------------
  // GET SIGNED DOWNLOAD URL
  // ----------------------------------------------------------
  async getDownloadUrl(
    exportId:  string,
    userId:    string,
    orderId:   string,
  ): Promise<string> {
    const supabase = createAdminClient()
    const log      = logger.child({ service: 'export', exportId, userId })

    const { data: exportRecord } = await supabase
      .from('book_exports')
      .select('storage_path, project_id')
      .eq('id', exportId)
      .single()

    if (!exportRecord) throw new Error('Export not found')
    if (!exportRecord.storage_path) throw new Error('Export file missing')

    // Verify order ownership
    const { data: order } = await supabase
      .from('orders')
      .select('id')
      .eq('id', orderId)
      .eq('user_id', userId)
      .eq('book_project_id', exportRecord.project_id)
      .eq('status', 'completed')
      .single()

    if (!order) throw new Error('Unauthorized: no completed order for this export')

    // Generate signed URL (15 minutes)
    const { data: signed, error } = await supabase.storage
      .from('exports')
      .createSignedUrl(exportRecord.storage_path, 900)

    if (error || !signed) throw new Error('Failed to create signed URL')

    // Update download tracking
    await supabase
      .from('book_exports')
      .update({ last_downloaded_at: new Date().toISOString(), download_count: 1 })
      .eq('id', exportId)

    log.info('signed download URL created', { expiresIn: 900 })

    return signed.signedUrl
  },

  // ----------------------------------------------------------
  // GET EXPORT BY ID
  // ----------------------------------------------------------
  async getStatus(exportId: string): Promise<ExportRecord | null> {
    const supabase = createAdminClient()

    const { data } = await supabase
      .from('book_exports')
      .select('*')
      .eq('id', exportId)
      .single()

    return (data as ExportRecord | null)
  },

  // ----------------------------------------------------------
  // ENSURE EXPORT EXISTS (create if not)
  // ----------------------------------------------------------
  async ensureExport(
    projectId: string,
    format:    ExportFormat,
  ): Promise<ExportRecord> {
    const supabase = createAdminClient()

    // Check if already exists
    const { data: existing } = await supabase
      .from('book_exports')
      .select('*')
      .eq('project_id', projectId)
      .eq('type', format)
      .order('generated_at', { ascending: false })
      .limit(1)
      .single()

    if (existing) return existing as ExportRecord

    // Generate it
    if (format === 'print_ready_pdf') {
      return exportService.generatePrintReadyPDF(projectId)
    }
    return exportService.generatePDF(projectId)
  },
}
