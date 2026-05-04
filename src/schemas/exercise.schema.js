import { z } from 'zod'

export const generateExercisesSchema = z.object({
  unitIds: z.array(z.string()).min(0),
  bookId: z.string().optional(),
  dificultad: z.enum(['FACIL', 'MEDIO', 'DIFICIL']),
  cantidad: z.number().int().min(1).max(30).default(10),
  gameModeId: z.string().min(1),
})

export const answerSchema = z.object({
  exerciseId: z.string().min(1),
  respuesta: z.any(),
  tiempoRespuestaSegundos: z.number().min(0).default(0),
  usoPista: z.boolean().default(false),
})

export const createExerciseSchema = z.object({
  unitId: z.string().min(1),
  topicId: z.string().optional(),
  enunciado: z.string().min(5),
  tipo: z.enum(['OPCION_MULTIPLE', 'RESPUESTA_NUMERICA', 'VERDADERO_FALSO', 'COMPLETAR']).default('OPCION_MULTIPLE'),
  opciones: z.array(z.string()).optional(),
  respuestaCorrecta: z.any(),
  explicacion: z.string().optional(),
  pista: z.string().optional(),
  dificultad: z.enum(['FACIL', 'MEDIO', 'DIFICIL']).default('FACIL'),
  puntajeBase: z.number().int().min(1).default(10),
  tiempoEstimadoSegundos: z.number().int().min(5).default(30),
  tags: z.array(z.string()).optional(),
})

export const updateExerciseSchema = createExerciseSchema.partial()
