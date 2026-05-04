import { withErrorHandler, ok, createError } from '@/lib/api-handler'
import { requireAuth } from '@/middlewares/auth.middleware'
import { userService } from '@/services/user.service'
import { updateAvatarSchema } from '@/schemas/user.schema'

export const PUT = withErrorHandler(async (request, { params }) => {
  const { id } = await params
  const sessionUser = await requireAuth()
  if (sessionUser.id !== id && sessionUser.role !== 'ADMIN') throw createError('Acceso denegado', 403)
  const body = await request.json()
  const { avatarId } = updateAvatarSchema.parse(body)
  const user = await userService.updateAvatar(id, avatarId)
  return ok(user)
})
