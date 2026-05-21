import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const requestUrl = new URL(request.url)
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createMiddlewareClient({ req: request, res: response })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect profile route
  // Protect profile and dashboard (root) route
  if ((requestUrl.pathname === '/' || requestUrl.pathname.startsWith('/profile')) && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect logged-in users away from login/signup pages
  if (
    (requestUrl.pathname === '/login' || requestUrl.pathname === '/signup') &&
    user
  ) {
    return NextResponse.redirect(new URL('/profile', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/',
    '/profile/:path*',
    '/login',
    '/signup',
  ],
}
