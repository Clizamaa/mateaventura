import { withErrorHandler, ok, createError } from '@/lib/api-handler'
import { requireAuth } from '@/middlewares/auth.middleware'
import { exerciseService } from '@/services/exercise.service'
import { updateExerciseSchema } from '@/schemas/exercise.schema'

export const GET = withErrorHandler(async (_, { params }) => {
  const { id } = await params
  await requireAuth()
  const exercise = await exerciseService.findById(id)
  return ok(exercise)
})

export const PUT = withErrorHandler(async (request, { params }) => {
  const { id } = await params
  const user = await requireAuth()
  if (!['ADMIN', 'PROFESOR'].includes(user.role)) throw createError('Acceso denegado', 403)
  const body = await request.json()
  const data = updateExerciseSchema.parse(body)
  const exercise = await exerciseService.update(id, data)
  return ok(exercise)
})

export const DELETE = withErrorHandler(async (_, { params }) => {
  const { id } = await params
  const user = await requireAuth()
  if (!['ADMIN', 'PROFESOR'].includes(user.role)) throw createError('Acceso denegado', 403)
  await exerciseService.delete(id)
  return ok(null, 'Ejercicio eliminado')
})
