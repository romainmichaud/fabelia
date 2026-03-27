import { createAdminClient }   from '@/lib/supabase/server'
import { logger }              from '@/lib/logger'

export const authService = {

  // ----------------------------------------------------------
  // ENSURE PROFILE EXISTS
  // Called after Supabase Auth sign-up (can hook into trigger or call manually)
  // ----------------------------------------------------------
  async ensureProfile(userId: string, email: string, fullName?: string): Promise<void> {
    const supabase = createAdminClient()

    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (existing) return

    const { error } = await supabase.from('profiles').insert({
      id:        userId,
      email,
      full_name: fullName ?? null,
      role:      'user',
      locale:    'fr',
    })

    if (error) {
      logger.error('failed to create profile', { userId }, error as Error)
      throw error
    }

    logger.info('profile created', { userId })
  },

  // ----------------------------------------------------------
  // GET PROFILE
  // ----------------------------------------------------------
  async getProfile(userId: string) {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, locale, created_at')
      .eq('id', userId)
      .single()

    if (error) return null
    return data
  },

  // ----------------------------------------------------------
  // UPDATE PROFILE
  // ----------------------------------------------------------
  async updateProfile(
    userId: string,
    updates: { full_name?: string; locale?: string },
  ): Promise<void> {
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)

    if (error) throw error
    logger.info('profile updated', { userId })
  },

  // ----------------------------------------------------------
  // IS ADMIN
  // ----------------------------------------------------------
  async isAdmin(userId: string): Promise<boolean> {
    const supabase = createAdminClient()

    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    return data?.role === 'admin'
  },

  // ----------------------------------------------------------
  // GRANT ADMIN (super-admin use only)
  // ----------------------------------------------------------
  async grantAdmin(targetUserId: string, grantedByUserId: string): Promise<void> {
    const supabase = createAdminClient()

    const isGranterAdmin = await authService.isAdmin(grantedByUserId)
    if (!isGranterAdmin) throw new Error('Only admins can grant admin role')

    await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', targetUserId)

    logger.info('admin role granted', { targetUserId, grantedByUserId })
  },
}
