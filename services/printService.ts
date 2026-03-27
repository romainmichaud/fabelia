import { createAdminClient } from '@/lib/supabase/server'
import { exportService }     from './exportService'
import { logger }            from '@/lib/logger'
import { retry }             from '@/lib/retry'
import type { ShippingAddress } from '@/types'

// ============================================================
// PRINT PROVIDER INTERFACE
// Swap provider without changing calling code
// ============================================================
export interface PrintProvider {
  name:        string
  submitJob:   (job: PrintJobPayload) => Promise<ProviderJobResult>
  getStatus:   (providerJobId: string) => Promise<ProviderStatus>
  cancelJob:   (providerJobId: string) => Promise<void>
  getTracking: (providerJobId: string) => Promise<TrackingInfo | null>
}

export interface PrintJobPayload {
  fileUrl:        string
  pageCount:      number
  bookFormat:     'softcover' | 'hardcover'
  quantity:       number
  shippingAddress: ShippingAddress
  orderReference: string
}

export interface ProviderJobResult {
  providerJobId:    string
  estimatedDays:   number
  cost:            number
}

export type ProviderJobStatus =
  | 'pending' | 'submitted' | 'in_production'
  | 'shipped'  | 'delivered' | 'failed' | 'cancelled'

export interface ProviderStatus {
  status:              ProviderJobStatus
  trackingNumber?:     string
  trackingUrl?:        string
  estimatedDelivery?:  string
}

export interface TrackingInfo {
  number:            string
  url:               string
  estimatedDelivery: string | null
  carrier:           string
}

// ============================================================
// MOCK PROVIDER (replace with real one: Printful, Mimeo, etc.)
// ============================================================
const mockProvider: PrintProvider = {
  name: 'MockPrint',

  async submitJob(job: PrintJobPayload): Promise<ProviderJobResult> {
    logger.info('mockProvider — job submitted', { ref: job.orderReference })
    // Simulate API latency
    await new Promise(r => setTimeout(r, 200))
    return {
      providerJobId: `MOCK-${Date.now()}`,
      estimatedDays: 5,
      cost:          800,  // centimes
    }
  },

  async getStatus(providerJobId: string): Promise<ProviderStatus> {
    // Simulate progression
    return { status: 'in_production' }
  },

  async cancelJob(providerJobId: string): Promise<void> {
    logger.info('mockProvider — job cancelled', { providerJobId })
  },

  async getTracking(providerJobId: string): Promise<TrackingInfo | null> {
    return null
  },
}

// ============================================================
// PROVIDER REGISTRY — swap here
// ============================================================
const PROVIDERS: Record<string, PrintProvider> = {
  mock:    mockProvider,
  // printful: printfulProvider,
  // lulu:     luluProvider,
}

function getProvider(): PrintProvider {
  const name = process.env.PRINT_PROVIDER ?? 'mock'
  const provider = PROVIDERS[name]
  if (!provider) throw new Error(`Print provider "${name}" not configured`)
  return provider
}

// ============================================================
// ADDRESS VALIDATION (France only)
// ============================================================
const FRANCE_POSTAL_REGEX = /^(?:0[1-9]|[1-8]\d|9[0-5])\d{3}$/

function validateFranceAddress(address: ShippingAddress): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!address.first_name?.trim())  errors.push('Prénom requis')
  if (!address.last_name?.trim())   errors.push('Nom requis')
  if (!address.line1?.trim())       errors.push('Adresse requise')
  if (!address.city?.trim())        errors.push('Ville requise')
  if (!address.postal_code?.trim()) errors.push('Code postal requis')
  if (address.country !== 'FR')     errors.push('Livraison France uniquement')

  if (address.postal_code && !FRANCE_POSTAL_REGEX.test(address.postal_code)) {
    errors.push('Code postal français invalide (format: 75001)')
  }

  return { valid: errors.length === 0, errors }
}

// ============================================================
// SERVICE
// ============================================================
export const printService = {

  // ----------------------------------------------------------
  // CREATE AND SUBMIT PRINT JOB
  // ----------------------------------------------------------
  async createAndSubmit(
    orderId:         string,
    shippingAddress: ShippingAddress,
  ): Promise<{ printJobId: string; estimatedDelivery: string }> {
    const supabase = createAdminClient()
    const log      = logger.child({ service: 'print', orderId })

    // Validate address
    const validation = validateFranceAddress(shippingAddress)
    if (!validation.valid) {
      throw new Error(`Invalid address: ${validation.errors.join(', ')}`)
    }

    log.info('creating print job')

    // Get order + project info
    const { data: order } = await supabase
      .from('orders')
      .select('book_project_id, book_format, quantity')
      .eq('id', orderId)
      .single()

    if (!order) throw new Error(`Order ${orderId} not found`)
    if (!order.book_project_id) throw new Error(`Order ${orderId} has no project`)

    // Ensure print-ready PDF exists
    const exportRecord = await exportService.ensureExport(order.book_project_id, 'print_ready_pdf')

    // Get public URL for the PDF
    const { data: signedUrl } = await supabase.storage
      .from('exports')
      .createSignedUrl(exportRecord.storage_path!, 3600)  // 1h for provider download

    if (!signedUrl) throw new Error('Could not generate URL for print file')

    // Get page count
    const { count: pageCount } = await supabase
      .from('book_pages')
      .select('id', { count: 'exact', head: true })
      .eq('project_id', order.book_project_id)

    // Create print job record
    const { data: printJob } = await supabase
      .from('print_jobs')
      .insert({
        order_id:         orderId,
        project_id:       order.book_project_id,
        provider:         process.env.PRINT_PROVIDER ?? 'mock',
        status:           'pending',
        shipping_address: shippingAddress as unknown as Record<string, string>,
      })
      .select('id')
      .single()

    if (!printJob) throw new Error('Failed to create print job record')

    // Submit to provider (with retry)
    const provider = getProvider()
    const jobResult = await retry(
      () => provider.submitJob({
        fileUrl:         signedUrl.signedUrl,
        pageCount:       pageCount ?? 30,
        bookFormat:      (order.book_format ?? 'softcover') as 'softcover' | 'hardcover',
        quantity:        order.quantity,
        shippingAddress,
        orderReference:  orderId,
      }),
      { maxAttempts: 3, baseDelayMs: 2000 },
      { orderId, printJobId: printJob.id },
    )

    const estimatedDelivery = new Date(
      Date.now() + jobResult.estimatedDays * 24 * 60 * 60 * 1000
    ).toISOString()

    // Update print job
    await supabase
      .from('print_jobs')
      .update({
        status:            'submitted',
        provider_job_id:   jobResult.providerJobId,
        estimated_delivery: estimatedDelivery,
      })
      .eq('id', printJob.id)

    log.info('print job submitted', {
      printJobId:   printJob.id,
      providerJobId: jobResult.providerJobId,
      estimatedDays: jobResult.estimatedDays,
    })

    return {
      printJobId:        printJob.id,
      estimatedDelivery,
    }
  },

  // ----------------------------------------------------------
  // SYNC STATUS (called by webhook or cron)
  // ----------------------------------------------------------
  async syncStatus(printJobId: string): Promise<void> {
    const supabase = createAdminClient()
    const log      = logger.child({ service: 'print', printJobId })

    const { data: job } = await supabase
      .from('print_jobs')
      .select('provider, provider_job_id, order_id')
      .eq('id', printJobId)
      .single()

    if (!job?.provider_job_id) return

    const provider   = getProvider()
    const status     = await provider.getStatus(job.provider_job_id)
    const tracking   = status.trackingNumber
      ? await provider.getTracking(job.provider_job_id)
      : null

    const updates: Record<string, unknown> = {
      status: status.status,
    }

    if (tracking) {
      updates.tracking_number = tracking.number
      updates.tracking_url    = tracking.url
    }
    if (status.estimatedDelivery) {
      updates.estimated_delivery = status.estimatedDelivery
    }
    if (status.status === 'delivered') {
      updates.delivered_at = new Date().toISOString()
    }

    await supabase.from('print_jobs').update(updates).eq('id', printJobId)

    // Update order status if shipped/delivered
    if (status.status === 'shipped' || status.status === 'delivered') {
      await supabase
        .from('orders')
        .update({ status: status.status === 'delivered' ? 'completed' : 'processing' })
        .eq('id', job.order_id)
    }

    log.info('print job status synced', { status: status.status })
  },

  // ----------------------------------------------------------
  // CANCEL JOB (before production)
  // ----------------------------------------------------------
  async cancelJob(printJobId: string, adminId: string): Promise<void> {
    const supabase = createAdminClient()
    const log      = logger.child({ service: 'print', printJobId })

    const { data: job } = await supabase
      .from('print_jobs')
      .select('provider, provider_job_id, status')
      .eq('id', printJobId)
      .single()

    if (!job) throw new Error('Print job not found')

    if (job.status === 'shipped' || job.status === 'delivered') {
      throw new Error('Cannot cancel a shipped or delivered job')
    }

    if (job.provider_job_id) {
      const provider = getProvider()
      await provider.cancelJob(job.provider_job_id)
    }

    await supabase
      .from('print_jobs')
      .update({ status: 'cancelled' })
      .eq('id', printJobId)

    await supabase.from('admin_logs').insert({
      admin_id:    adminId,
      action:      'cancel_print_job',
      resource:    'print_jobs',
      resource_id: printJobId,
    })

    log.info('print job cancelled')
  },

  // ----------------------------------------------------------
  // GET TRACKING
  // ----------------------------------------------------------
  async getTracking(printJobId: string): Promise<TrackingInfo | null> {
    const supabase = createAdminClient()

    const { data: job } = await supabase
      .from('print_jobs')
      .select('tracking_number, tracking_url, estimated_delivery, provider')
      .eq('id', printJobId)
      .single()

    if (!job?.tracking_number) return null

    return {
      number:            job.tracking_number,
      url:               job.tracking_url ?? '',
      estimatedDelivery: job.estimated_delivery,
      carrier:           job.provider ?? 'Colissimo',
    }
  },

  validateAddress: validateFranceAddress,
}
