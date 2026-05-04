import { withErrorHandler, ok, createError } from '@/lib/api-handler'
import { requireAuth } from '@/middlewares/auth.middleware'
import { createGradeSchema } from '@/schemas/subject.schema'
import { prisma } from '@/lib/prisma'

export const GET = withErrorHandler(async () => {
  const grades = await prisma.grade.findMany({ where: { activo: true }, orderBy: { nivel: 'asc' } })
  return ok(grades)
})

export const POST = withErrorHandler(async (request) => {
  const user = await requireAuth()
  if (user.role !== 'ADMIN') throw createError('Acceso denegado', 403)
  const body = await request.json()
  const data = createGradeSchema.parse(body)
  const grade = await prisma.grade.create({ data })
  return ok(grade, 'Grado creado', 201)
})
