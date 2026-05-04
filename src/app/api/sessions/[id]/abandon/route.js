import { withErrorHandler, ok } from '@/lib/api-handler'
import { requireAuth } from '@/middlewares/auth.middleware'
import { sessionService } from '@/services/session.service'

export const POST = withErrorHandler(async (_, { params }) => {
  const { id } = await params
  const sessionUser = await requireAuth()
  await sessionService.abandon(id, sessionUser.id)
  return ok(null, 'Sesión abandonada')
})
