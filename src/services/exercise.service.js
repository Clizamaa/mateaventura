import { exerciseRepository } from '@/repositories/exercise.repository'
import { createError } from '@/lib/api-handler'
import { DEFAULT_CANTIDAD_EJERCICIOS } from '@/constants'
import { prisma } from '@/lib/prisma'

export const exerciseService = {
  /**
   * Genera un set de ejercicios para una sesión, sin incluir la respuesta correcta.
   * @param {{ unitIds: string[], bookId?: string, dificultad: string, cantidad: number, userId: string }} params
   */
  async generate({ unitIds, bookId, dificultad, cantidad = DEFAULT_CANTIDAD_EJERCICIOS, userId }) {
    let resolvedUnitIds = [...unitIds]

    // Si no hay unidades específicas pero sí hay libro, tomar todas las unidades del libro
    if (resolvedUnitIds.length === 0 && bookId) {
      const units = await prisma.unit.findMany({ where: { bookId, activo: true }, select: { id: true } })
      resolvedUnitIds = units.map((u) => u.id)
    }

    if (resolvedUnitIds.length === 0 && !bookId) {
      throw createError('Debes seleccionar al menos un libro o una unidad', 400)
    }

    const excludeIds = await exerciseRepository.getRecentExerciseIds(userId)

    const exercises = await exerciseRepository.selectForSession({
      unitIds: resolvedUnitIds,
      dificultad,
      cantidad,
      excludeIds,
    })

    if (exercises.length === 0) throw createError('No hay ejercicios disponibles para los parámetros seleccionados', 404)

    // Quitar la respuesta correcta antes de devolver al cliente
    return exercises.map(({ respuestaCorrecta, ...ex }) => ({
      ...ex,
      opciones: ex.opciones ?? [],
    }))
  },

  async findById(id) {
    const ex = await exerciseRepository.findById(id)
    if (!ex) throw createError('Ejercicio no encontrado', 404, 'NOT_FOUND')
    const { respuestaCorrecta, ...rest } = ex
    return rest
  },

  async findByIdWithAnswer(id) {
    const ex = await exerciseRepository.findById(id)
    if (!ex) throw createError('Ejercicio no encontrado', 404, 'NOT_FOUND')
    return ex
  },

  async list(filters) {
    return exerciseRepository.findMany(filters)
  },

  async create(data) {
    return exerciseRepository.create(data)
  },

  async update(id, data) {
    await exerciseRepository.findById(id) // throws if not found
    return exerciseRepository.update(id, data)
  },

  async delete(id) {
    return exerciseRepository.softDelete(id)
  },
}
