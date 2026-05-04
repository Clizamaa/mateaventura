import { withErrorHandler, ok } from '@/lib/api-handler'
import { requireAuth } from '@/middlewares/auth.middleware'
import { authService } from '@/services/auth.service'
import { changePasswordSchema } from '@/schemas/auth.schema'

export const PUT = withErrorHandler(async (request) => {
  const sessionUser = await requireAuth()
  const body = await request.json()
  const { currentPassword, newPassword } = changePasswordSchema.parse(body)
  await authService.changePassword(sessionUser.id, currentPassword, newPassword)
  return ok(null, 'Contraseña actualizada exitosamente')
})
