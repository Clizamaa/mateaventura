import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  username: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(20, 'Máximo 20 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y _'),
  password: z.string().min(4, 'Mínimo 4 caracteres').max(100),
  nombre: z.string().min(2, 'Mínimo 2 caracteres').max(50),
  apellido: z.string().max(50).optional(),
  gradoActual: z.string().optional(),
  avatarEmoji: z.string().optional(),
})

export const loginSchema = z.object({
  username: z.string().min(1, 'Requerido'),
  password: z.string().min(1, 'Requerido'),
})

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(4),
    confirmPassword: z.string().min(4),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })
