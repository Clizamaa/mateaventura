import { withErrorHandler, paginated } from '@/lib/api-handler'
import { requireAuth } from '@/middlewares/auth.middleware'
import { sessionRepository } from '@/repositories/session.repository'

export const GET = withErrorHandler(async (request) => {
  const sessionUser = await requireAuth()
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '20'))

  const { data, total } = await sessionRepository.getUserHistory(sessionUser.id, { page, limit })
  return paginated(data, total, page, limit)
})
