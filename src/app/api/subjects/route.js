import { withErrorHandler, ok } from '@/lib/api-handler'
import { requireAuth } from '@/middlewares/auth.middleware'
import { createError } from '@/lib/api-handler'
import { createSubjectSchema } from '@/schemas/subject.schema'
import { prisma } from '@/lib/prisma'

export const GET = withErrorHandler(async () => {
  const subjects = await prisma.subject.findMany({ where: { activo: true }, orderBy: { nombre: 'asc' } })
  return ok(subjects)
})

export const POST = withErrorHandler(async (request) => {
  const user = await requireAuth()
  if (user.role !== 'ADMIN') throw createError('Acceso denegado', 403)
  const body = await request.json()
  const data = createSubjectSchema.parse(body)
  const subject = await prisma.subject.create({ data })
  return ok(subject, 'Asignatura creada', 201)
})
