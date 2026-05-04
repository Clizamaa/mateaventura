import { prisma } from '@/lib/prisma'
import { DIAS_EVITAR_REPETICION } from '@/constants'

export const exerciseRepository = {
  async findById(id) {
    return prisma.exercise.findUnique({
      where: { id },
      include: { unit: { select: { id: true, titulo: true } }, topic: { select: { id: true, titulo: true } } },
    })
  },

  /**
   * Obtiene ejercicios recientes del usuario para evitar repetición.
   * @param {string} userId
   * @returns {Promise<string[]>} IDs de ejercicios recientes
   */
  async getRecentExerciseIds(userId) {
    const since = new Date()
    since.setDate(since.getDate() - DIAS_EVITAR_REPETICION)

    const recent = await prisma.sessionExercise.findMany({
      where: { session: { userId, iniciadaEn: { gte: since } } },
      select: { exerciseId: true },
      distinct: ['exerciseId'],
    })
    return recent.map((r) => r.exerciseId)
  },

  /**
   * Selecciona ejercicios para una sesión.
   * @param {Object} params
   * @param {string[]} params.unitIds
   * @param {string} params.dificultad
   * @param {number} params.cantidad
   * @param {string[]} params.excludeIds
   */
  async selectForSession({ unitIds, dificultad, cantidad, excludeIds = [] }) {
    const where = {
      activo: true,
      dificultad,
      ...(unitIds.length > 0 && { unitId: { in: unitIds } }),
      ...(excludeIds.length > 0 && { id: { notIn: excludeIds } }),
    }

    // Tomamos más del necesario para mezclar bien
    const exercises = await prisma.exercise.findMany({
      where,
      take: cantidad * 3,
      include: { unit: { select: { titulo: true } } },
    })

    // Si no hay suficientes sin exclusión, relajar el filtro
    if (exercises.length < cantidad) {
      return prisma.exercise.findMany({
        where: { activo: true, dificultad, ...(unitIds.length > 0 && { unitId: { in: unitIds } }) },
        take: cantidad,
        include: { unit: { select: { titulo: true } } },
      })
    }

    return exercises.sort(() => Math.random() - 0.5).slice(0, cantidad)
  },

  async findMany({ unitIds, dificultad, tipo, page = 1, limit = 20 }) {
    const where = {
      activo: true,
      ...(unitIds?.length && { unitId: { in: unitIds } }),
      ...(dificultad && { dificultad }),
      ...(tipo && { tipo }),
    }
    const [data, total] = await Promise.all([
      prisma.exercise.findMany({ where, skip: (page - 1) * limit, take: limit, include: { unit: { select: { titulo: true } } } }),
      prisma.exercise.count({ where }),
    ])
    return { data, total }
  },

  async create(data) {
    return prisma.exercise.create({ data })
  },

  async update(id, data) {
    return prisma.exercise.update({ where: { id }, data })
  },

  async softDelete(id) {
    return prisma.exercise.update({ where: { id }, data: { activo: false } })
  },
}
