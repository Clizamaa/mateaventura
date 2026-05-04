import { withErrorHandler, ok, createError } from '@/lib/api-handler'
import { requireAuth } from '@/middlewares/auth.middleware'
import { progressRepository } from '@/repositories/progress.repository'

export const GET = withErrorHandler(async (request, { params }) => {
  const { userId } = await params
  const sessionUser = await requireAuth()
  if (sessionUser.id !== userId && sessionUser.role !== 'ADMIN') throw createError('Acceso denegado', 403)

  const { searchParams } = new URL(request.url)
  const unitId = searchParams.get('unitId')

  if (unitId) {
    const progress = await progressRepository.getUnitProgress(userId, unitId)
    return ok(progress)
  }

  const progress = await progressRepository.getUserProgress(userId)
  return ok(progress)
})
