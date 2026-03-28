import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient }         from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json() as { email: string; password: string }

    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Create user via admin (bypasses trigger issues)
    const { data: { user }, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,   // no email verification required for now
    })

    if (createErr) {
      // User already exists → just sign in
      if (createErr.message.includes('already') || createErr.message.includes('exists')) {
        return NextResponse.json({ error: 'already_exists' }, { status: 409 })
      }
      return NextResponse.json({ error: createErr.message }, { status: 400 })
    }

    if (!user) {
      return NextResponse.json({ error: 'Création du compte échouée' }, { status: 500 })
    }

    // Ensure profile row exists (in case trigger failed or doesn't exist)
    await admin
      .from('profiles')
      .upsert({
        id:    user.id,
        email: user.email ?? email,
      }, { onConflict: 'id' })
      .select()

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
