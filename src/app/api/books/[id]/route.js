import { withErrorHandler, ok, createError } from '@/lib/api-handler'
import { requireAuth } from '@/middlewares/auth.middleware'
import { updateBookSchema } from '@/schemas/subject.schema'
import { prisma } from '@/lib/prisma'

export const GET = withErrorHandler(async (_, { params }) => {
  const { id } = await params
  const book = await prisma.book.findUnique({
    where: { id },
    include: {
      subject: true,
      grade: true,
      units: { where: { activo: true }, orderBy: { orden: 'asc' }, include: { _count: { select: { exercises: true } } } },
    },
  })
  if (!book) throw createError('Libro no encontrado', 404)
  return ok(book)
})

export const PUT = withErrorHandler(async (request, { params }) => {
  const { id } = await params
  const user = await requireAuth()
  if (user.role !== 'ADMIN') throw createError('Acceso denegado', 403)
  const body = await request.json()
  const data = updateBookSchema.parse(body)
  const book = await prisma.book.update({ where: { id }, data })
  return ok(book)
})

export const DELETE = withErrorHandler(async (_, { params }) => {
  const { id } = await params
  const user = await requireAuth()
  if (user.role !== 'ADMIN') throw createError('Acceso denegado', 403)
  await prisma.book.update({ where: { id }, data: { activo: false } })
  return ok(null, 'Libro eliminado')
})
