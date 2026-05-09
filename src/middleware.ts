// src/middleware.ts
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  // Protect checkout and orders
  const protectedPaths = ['/checkout', '/orders']
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path))

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    if ((req.auth?.user as any)?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  // Redirect logged-in users away from auth pages
  if ((pathname === '/login' || pathname === '/register') && isLoggedIn) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public).*)'],
}
