import { withErrorHandler, ok } from '@/lib/api-handler'
import { requireAuth } from '@/middlewares/auth.middleware'
import { sessionService } from '@/services/session.service'
import { finishSessionSchema } from '@/schemas/session.schema'

/**
 * POST /api/sessions/[id]/finish
 * Finaliza la sesión: calcula score final, XP, logros y actualiza progreso.
 */
export const POST = withErrorHandler(async (request, { params }) => {
  const { id } = await params
  const sessionUser = await requireAuth()
  const body = await request.json()
  const { tiempoTotal } = finishSessionSchema.parse(body)

  const result = await sessionService.finish({
    sessionId: id,
    userId: sessionUser.id,
    tiempoTotal,
  })

  return ok(result, '¡Sesión completada!')
})
