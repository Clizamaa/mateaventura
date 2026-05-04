import { withErrorHandler, ok } from '@/lib/api-handler'
import { requireAuth } from '@/middlewares/auth.middleware'
import { exerciseService } from '@/services/exercise.service'
import { generateExercisesSchema } from '@/schemas/exercise.schema'

/**
 * POST /api/exercises/generate
 * Genera ejercicios aleatorios según parámetros, SIN respuesta correcta.
 */
export const POST = withErrorHandler(async (request) => {
  const sessionUser = await requireAuth()
  const body = await request.json()
  const { unitIds, bookId, dificultad, cantidad, gameModeId } = generateExercisesSchema.parse(body)

  const exercises = await exerciseService.generate({
    unitIds,
    bookId,
    dificultad,
    cantidad,
    userId: sessionUser.id,
  })

  return ok(exercises, `${exercises.length} ejercicios generados`)
})
