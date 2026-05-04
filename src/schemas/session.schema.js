import { z } from 'zod'

export const startSessionSchema = z.object({
  unitIds: z.array(z.string()).min(0),
  bookId: z.string().optional(),
  dificultad: z.enum(['FACIL', 'MEDIO', 'DIFICIL']),
  gameModeId: z.string().min(1),
  cantidad: z.number().int().min(1).max(30).optional(),
})

export const answerExerciseSchema = z.object({
  sessionExerciseId: z.string().min(1),
  respuesta: z.any(),
  tiempoRespuestaSegundos: z.number().min(0).default(0),
  usoPista: z.boolean().default(false),
})

export const finishSessionSchema = z.object({
  tiempoTotal: z.number().int().min(0),
})
