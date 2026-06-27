import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Pages accessibles sans être connecté
const PUBLIC_ROUTES = ['/']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Vérifie si la route est publique
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname)

  // Récupère le token depuis les cookies
  const token = request.cookies.get('accessToken')?.value

  // Si la route est protégée et pas de token → redirige vers la page de connexion
  if (!isPublicRoute && !token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Si connecté et sur la page de connexion → redirige vers le dashboard
  if (isPublicRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  // Applique le middleware sur toutes les routes sauf les fichiers statiques
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}