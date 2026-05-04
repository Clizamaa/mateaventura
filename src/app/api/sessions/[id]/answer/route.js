import { withErrorHandler, ok } from '@/lib/api-handler'
import { requireAuth } from '@/middlewares/auth.middleware'
import { sessionService } from '@/services/session.service'
import { answerExerciseSchema } from '@/schemas/session.schema'

/**
 * POST /api/sessions/[id]/answer
 * Envía la respuesta de un ejercicio. Valida server-side y calcula puntaje.
 */
export const POST = withErrorHandler(async (request, { params }) => {
  const { id } = await params
  const sessionUser = await requireAuth()
  const body = await request.json()
  const { sessionExerciseId, respuesta, tiempoRespuestaSegundos, usoPista } = answerExerciseSchema.parse(body)

  const result = await sessionService.answer({
    sessionId: id,
    userId: sessionUser.id,
    sessionExerciseId,
    respuesta,
    tiempoRespuestaSegundos,
    usoPista,
  })

  return ok(result)
})
