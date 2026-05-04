import { auth } from '@/lib/auth'
import { createError } from '@/lib/api-handler'

/**
 * Extrae y valida la sesión del request.
 * Lanza 401 si no hay sesión activa.
 */
export async function requireAuth(request) {
  const session = await auth()
  if (!session?.user?.id) throw createError('No autorizado. Debes iniciar sesión.', 401, 'UNAUTHORIZED')
  return session.user
}

/**
 * Verifica que el usuario autenticado tenga uno de los roles permitidos.
 * @param {string[]} roles
 */
export async function requireRole(roles) {
  const user = await requireAuth()
  if (!roles.includes(user.role)) throw createError('Acceso denegado', 403, 'FORBIDDEN')
  return user
}
