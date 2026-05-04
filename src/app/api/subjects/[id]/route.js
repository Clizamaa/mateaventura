import { withErrorHandler, ok, createError } from '@/lib/api-handler'
import { requireAuth } from '@/middlewares/auth.middleware'
import { updateSubjectSchema } from '@/schemas/subject.schema'
import { prisma } from '@/lib/prisma'

export const GET = withErrorHandler(async (_, { params }) => {
  const { id } = await params
  const subject = await prisma.subject.findUnique({
    where: { id },
    include: { books: { where: { activo: true }, include: { grade: true } } },
  })
  if (!subject) throw createError('Asignatura no encontrada', 404)
  return ok(subject)
})

export const PUT = withErrorHandler(async (request, { params }) => {
  const { id } = await params
  const user = await requireAuth()
  if (user.role !== 'ADMIN') throw createError('Acceso denegado', 403)
  const body = await request.json()
  const data = updateSubjectSchema.parse(body)
  const subject = await prisma.subject.update({ where: { id }, data })
  return ok(subject)
})

export const DELETE = withErrorHandler(async (_, { params }) => {
  const { id } = await params
  const user = await requireAuth()
  if (user.role !== 'ADMIN') throw createError('Acceso denegado', 403)
  await prisma.subject.update({ where: { id }, data: { activo: false } })
  return ok(null, 'Asignatura eliminada')
})
