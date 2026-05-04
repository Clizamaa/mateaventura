import { withErrorHandler, ok, paginated, createError } from '@/lib/api-handler'
import { requireAuth } from '@/middlewares/auth.middleware'
import { createBookSchema } from '@/schemas/subject.schema'
import { prisma } from '@/lib/prisma'

export const GET = withErrorHandler(async (request) => {
  const { searchParams } = new URL(request.url)
  const subjectId = searchParams.get('subjectId')
  const gradeId = searchParams.get('gradeId')
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '20'))

  const where = {
    activo: true,
    ...(subjectId && { subjectId }),
    ...(gradeId && { gradeId }),
  }

  const [books, total] = await Promise.all([
    prisma.book.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        subject: { select: { nombre: true, icono: true, color: true } },
        grade: { select: { nombre: true, nivel: true } },
        _count: { select: { units: true } },
      },
    }),
    prisma.book.count({ where }),
  ])

  return paginated(books, total, page, limit)
})

export const POST = withErrorHandler(async (request) => {
  const user = await requireAuth()
  if (user.role !== 'ADMIN') throw createError('Acceso denegado', 403)
  const body = await request.json()
  const data = createBookSchema.parse(body)
  const book = await prisma.book.create({ data, include: { subject: true, grade: true } })
  return ok(book, 'Libro creado', 201)
})
