import { withErrorHandler, ok } from '@/lib/api-handler'
import { requireAuth } from '@/middlewares/auth.middleware'
import { userService } from '@/services/user.service'

export const GET = withErrorHandler(async () => {
  const sessionUser = await requireAuth()
  const user = await userService.findById(sessionUser.id)
  return ok(user)
})
