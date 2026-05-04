import { withErrorHandler, ok, createError } from '@/lib/api-handler'
import { requireAuth } from '@/middlewares/auth.middleware'
import { userService } from '@/services/user.service'
import { updateUserSchema } from '@/schemas/user.schema'

export const GET = withErrorHandler(async (_, { params }) => {
  const { id } = await params
  await requireAuth()
  const user = await userService.findById(id)
  return ok(user)
})

export const PUT = withErrorHandler(async (request, { params }) => {
  const { id } = await params
  const sessionUser = await requireAuth()
  if (sessionUser.id !== id && sessionUser.role !== 'ADMIN') throw createError('Acceso denegado', 403)
  const body = await request.json()
  const data = updateUserSchema.parse(body)
  const user = await userService.update(id, data)
  return ok(user)
})
