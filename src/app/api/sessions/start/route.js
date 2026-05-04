import { withErrorHandler, ok } from '@/lib/api-handler'
import { requireAuth } from '@/middlewares/auth.middleware'
import { sessionService } from '@/services/session.service'
import { startSessionSchema } from '@/schemas/session.schema'

/**
 * POST /api/sessions/start
 * Inicia una sesión: genera ejercicios y los persiste en BD.
 */
export const POST = withErrorHandler(async (request) => {
  const sessionUser = await requireAuth()
  const body = await request.json()
  const { unitIds, bookId, dificultad, gameModeId, cantidad } = startSessionSchema.parse(body)

  const result = await sessionService.start({
    userId: sessionUser.id,
    gameModeId,
    unitIds,
    bookId,
    dificultad,
    cantidad,
  })

  return ok(result, 'Sesión iniciada', 201)
})
