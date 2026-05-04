import { z } from 'zod'

export const updateUserSchema = z.object({
  nombre: z.string().min(2).max(50).optional(),
  apellido: z.string().max(50).optional(),
  email: z.string().email().optional(),
  gradoActual: z.string().optional(),
  fechaNacimiento: z.string().optional(),
})

export const updateAvatarSchema = z.object({
  avatarId: z.string().min(1),
})

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})
