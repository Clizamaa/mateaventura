import { z } from 'zod'

export const createSubjectSchema = z.object({
  nombre: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  descripcion: z.string().optional(),
  icono: z.string().optional(),
  color: z.string().optional(),
})

export const updateSubjectSchema = createSubjectSchema.partial()

export const createGradeSchema = z.object({
  nombre: z.string().min(2),
  nivel: z.number().int().min(1).max(12),
  descripcion: z.string().optional(),
})

export const updateGradeSchema = createGradeSchema.partial()

export const createBookSchema = z.object({
  titulo: z.string().min(2),
  descripcion: z.string().optional(),
  portadaUrl: z.string().url().optional(),
  subjectId: z.string().min(1),
  gradeId: z.string().min(1),
  editorial: z.string().optional(),
  anio: z.number().int().min(2000).max(2100).optional(),
})

export const updateBookSchema = createBookSchema.partial()

export const createUnitSchema = z.object({
  bookId: z.string().min(1),
  numero: z.number().int().min(1),
  titulo: z.string().min(2),
  descripcion: z.string().optional(),
  objetivos: z.array(z.string()).optional(),
  orden: z.number().int().min(0).optional(),
})

export const updateUnitSchema = createUnitSchema.partial()
