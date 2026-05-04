import { withErrorHandler, ok, createError } from '@/lib/api-handler'
import { requireAuth } from '@/middlewares/auth.middleware'
import { prisma } from '@/lib/prisma'

export const GET = withErrorHandler(async () => {
  const modes = await prisma.gameMode.findMany({ where: { activo: true } })
  return ok(modes)
})

export const POST = withErrorHandler(async (request) => {
  const user = await requireAuth()
  if (user.role !== 'ADMIN') throw createError('Acceso denegado', 403)
  const body = await request.json()
  const mode = await prisma.gameMode.create({ data: body })
  return ok(mode, 'Modo de juego creado', 201)
})
