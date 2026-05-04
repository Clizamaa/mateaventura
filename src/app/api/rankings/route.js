import { withErrorHandler, ok } from '@/lib/api-handler'
import { requireAuth } from '@/middlewares/auth.middleware'
import { prisma } from '@/lib/prisma'

export const GET = withErrorHandler(async (request) => {
  await requireAuth()
  const { searchParams } = new URL(request.url)
  const tipo = searchParams.get('tipo') ?? 'global' // global | weekly
  const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '20'))

  const where = tipo === 'weekly'
    ? { fecha: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
    : {}

  const topScores = await prisma.score.groupBy({
    by: ['userId'],
    where,
    _sum: { puntaje: true },
    orderBy: { _sum: { puntaje: 'desc' } },
    take: limit,
  })

  const userIds = topScores.map((s) => s.userId)
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, nombre: true, nivel: true, xp: true, racha: true, avatar: { select: { emoji: true } } },
  })

  const userMap = Object.fromEntries(users.map((u) => [u.id, u]))

  const ranking = topScores.map((score, i) => ({
    posicion: i + 1,
    usuario: userMap[score.userId],
    puntajeTotal: score._sum.puntaje,
  }))

  return ok(ranking)
})
