import { withErrorHandler, ok } from '@/lib/api-handler'
import { requireAuth } from '@/middlewares/auth.middleware'
import { userService } from '@/services/user.service'

export const GET = withErrorHandler(async (_, { params }) => {
  const { id } = await params
  await requireAuth()
  const stats = await userService.getStats(id)
  return ok(stats)
})
