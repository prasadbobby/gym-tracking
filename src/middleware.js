// src/middleware.js
import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function middleware(request) {
  const session = await auth()
  
  // Define path patterns
  const adminPaths = /^\/admin(\/.*)?$/
  const protectedPaths = /^\/(dashboard|nutrition|profile|progress|workout)(\/.*)?$/
  
  // Public paths
  const publicPaths = [
    '/',
    '/auth/signin',
    '/auth/signup',
    '/auth/error'
  ]
  
  const path = request.nextUrl.pathname
  
  // Check for admin routes
  if (adminPaths.test(path)) {
    if (session?.user?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }
  
  // Check for protected routes
  if (protectedPaths.test(path) && !session) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }
  
  // Allow access to public routes
  if (publicPaths.includes(path) || session) {
    return NextResponse.next()
  }
  
  // Default fallback
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}