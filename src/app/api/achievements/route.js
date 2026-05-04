import { withErrorHandler, ok } from '@/lib/api-handler'
import { achievementRepository } from '@/repositories/achievement.repository'

export const GET = withErrorHandler(async () => {
  const achievements = await achievementRepository.findAll()
  return ok(achievements)
})
