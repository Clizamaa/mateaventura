import { withErrorHandler, ok, createError } from '@/lib/api-handler'
import { requireAuth } from '@/middlewares/auth.middleware'
import { updateUnitSchema } from '@/schemas/subject.schema'
import { prisma } from '@/lib/prisma'

export const GET = withErrorHandler(async (_, { params }) => {
  const { id } = await params
  const unit = await prisma.unit.findUnique({
    where: { id },
    include: {
      book: { select: { titulo: true } },
      topics: { orderBy: { orden: 'asc' } },
      _count: { select: { exercises: true } },
    },
  })
  if (!unit) throw createError('Unidad no encontrada', 404)
  return ok(unit)
})

export const PUT = withErrorHandler(async (request, { params }) => {
  const { id } = await params
  const user = await requireAuth()
  if (!['ADMIN', 'PROFESOR'].includes(user.role)) throw createError('Acceso denegado', 403)
  const body = await request.json()
  const data = updateUnitSchema.parse(body)
  const unit = await prisma.unit.update({ where: { id }, data })
  return ok(unit)
})

export const DELETE = withErrorHandler(async (_, { params }) => {
  const { id } = await params
  const user = await requireAuth()
  if (user.role !== 'ADMIN') throw createError('Acceso denegado', 403)
  await prisma.unit.update({ where: { id }, data: { activo: false } })
  return ok(null, 'Unidad eliminada')
})
