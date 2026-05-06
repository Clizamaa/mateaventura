import { withErrorHandler, ok, createError } from '@/lib/api-handler'
import { requireAuth } from '@/middlewares/auth.middleware'
import { createUnitSchema } from '@/schemas/subject.schema'
import { prisma } from '@/lib/prisma'

export const GET = withErrorHandler(async (request) => {
  const { searchParams } = new URL(request.url)
  const bookId = searchParams.get('bookId')
  const gradeId = searchParams.get('gradeId')

  const units = await prisma.unit.findMany({
    where: { 
      activo: true, 
      ...(bookId && { bookId }),
      ...(gradeId && { book: { gradeId } })
    },
    orderBy: [{ bookId: 'asc' }, { orden: 'asc' }],
    include: {
      book: { select: { titulo: true } },
      _count: { select: { exercises: true } },
    },
  })
  return ok(units)
})

export const POST = withErrorHandler(async (request) => {
  const user = await requireAuth()
  if (!['ADMIN', 'PROFESOR'].includes(user.role)) throw createError('Acceso denegado', 403)
  const body = await request.json()
  const data = createUnitSchema.parse(body)
  const unit = await prisma.unit.create({ data })
  return ok(unit, 'Unidad creada', 201)
})
