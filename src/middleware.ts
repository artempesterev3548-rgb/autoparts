import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function isAdmin(email: string | undefined): boolean {
  if (!email) return false
  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',').map(e => e.trim()).filter(Boolean)
  // Если ADMIN_EMAILS не задан — пускаем любого авторизованного (для первоначальной настройки)
  return adminEmails.length === 0 || adminEmails.includes(email)
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // Защита ЛК
  if (!user && path.startsWith('/lk')) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Защита /admin — требует авторизации + admin-email
  if (path.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL(`/auth/login?next=${path}`, request.url))
    }
    if (!isAdmin(user.email)) {
      return new NextResponse('403 — Доступ запрещён', {
        status: 403,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      })
    }
  }

  return response
}

export const config = {
  matcher: ['/lk/:path*', '/admin/:path*'],
}
