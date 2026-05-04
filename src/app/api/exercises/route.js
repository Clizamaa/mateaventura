import { withErrorHandler, ok, paginated, createError } from '@/lib/api-handler'
import { requireAuth } from '@/middlewares/auth.middleware'
import { exerciseService } from '@/services/exercise.service'
import { createExerciseSchema } from '@/schemas/exercise.schema'

export const GET = withErrorHandler(async (request) => {
  await requireAuth()
  const { searchParams } = new URL(request.url)
  const unitIds = searchParams.getAll('unitId')
  const dificultad = searchParams.get('dificultad') || undefined
  const tipo = searchParams.get('tipo') || undefined
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '20'))

  const { data, total } = await exerciseService.list({ unitIds, dificultad, tipo, page, limit })
  return paginated(data, total, page, limit)
})

export const POST = withErrorHandler(async (request) => {
  const user = await requireAuth()
  if (!['ADMIN', 'PROFESOR'].includes(user.role)) throw createError('Acceso denegado', 403)
  const body = await request.json()
  const data = createExerciseSchema.parse(body)
  const exercise = await exerciseService.create(data)
  return ok(exercise, 'Ejercicio creado', 201)
})
