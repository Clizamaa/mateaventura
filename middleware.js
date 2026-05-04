import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'

// Usar authConfig (sin Prisma) para que sea compatible con Edge Runtime
const { auth } = NextAuth(authConfig)

const PROTECTED_PREFIXES = ['/api/sessions', '/api/progress', '/api/rankings', '/api/achievements/user']
const ADMIN_WRITE_PREFIXES = ['/api/subjects', '/api/grades', '/api/books', '/api/units']

export default auth((request) => {
  const { pathname } = request.nextUrl
  const method = request.method
  const session = request.auth

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
  const isAdminWrite =
    ADMIN_WRITE_PREFIXES.some((p) => pathname.startsWith(p)) &&
    ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)

  if (isProtected && !session?.user?.id) {
    return Response.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'No autorizado. Debes iniciar sesión.' } },
      { status: 401 }
    )
  }

  if (isAdminWrite && session?.user?.role !== 'ADMIN') {
    return Response.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'Acceso denegado. Se requiere rol ADMIN.' } },
      { status: 403 }
    )
  }
})

export const config = {
  matcher: ['/api/:path*'],
}
