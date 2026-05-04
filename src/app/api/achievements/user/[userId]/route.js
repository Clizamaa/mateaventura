import { withErrorHandler, ok, createError } from '@/lib/api-handler'
import { requireAuth } from '@/middlewares/auth.middleware'
import { achievementRepository } from '@/repositories/achievement.repository'

export const GET = withErrorHandler(async (_, { params }) => {
  const { userId } = await params
  const sessionUser = await requireAuth()
  if (sessionUser.id !== userId && sessionUser.role !== 'ADMIN') throw createError('Acceso denegado', 403)
  const achievements = await achievementRepository.findUserAchievements(userId)
  return ok(achievements)
})
