import { withErrorHandler, ok } from '@/lib/api-handler'
import { requireAuth } from '@/middlewares/auth.middleware'
import { sessionService } from '@/services/session.service'

export const GET = withErrorHandler(async (_, { params }) => {
  const { id } = await params
  const sessionUser = await requireAuth()
  const session = await sessionService.getState(id, sessionUser.id)
  return ok(session)
})
