import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient }            from '@supabase/ssr'

const PROTECTED_PATHS = [
  '/ma-bibliotheque',
  '/lecture',
  '/commande',
]

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: object }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
          )
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  const { pathname }          = request.nextUrl

  // Redirect unauthenticated users from protected paths
  const isProtected = PROTECTED_PATHS.some(p => pathname.startsWith(p))
  if (isProtected && !session) {
    const loginUrl = new URL('/connexion', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users away from auth pages
  if (session && (pathname === '/connexion' || pathname === '/inscription')) {
    return NextResponse.redirect(new URL('/ma-bibliotheque', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
