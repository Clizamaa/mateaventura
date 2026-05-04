import { prisma } from '@/lib/prisma'

export const progressRepository = {
  async getUserProgress(userId) {
    return prisma.progressRecord.findMany({
      where: { userId },
      include: { unit: { select: { id: true, titulo: true, numero: true, book: { select: { titulo: true } } } } },
      orderBy: { updatedAt: 'desc' },
    })
  },

  async getUnitProgress(userId, unitId) {
    return prisma.progressRecord.findUnique({
      where: { userId_unitId: { userId, unitId } },
      include: { unit: { select: { titulo: true, numero: true } } },
    })
  },

  /**
   * Actualiza o crea el registro de progreso de una unidad.
   * @param {string} userId
   * @param {string} unitId
   * @param {{ aciertos: number, total: number }} stats
   */
  async upsertProgress(userId, unitId, { aciertos, total }) {
    const existing = await prisma.progressRecord.findUnique({
      where: { userId_unitId: { userId, unitId } },
    })

    const newCompleted = (existing?.ejerciciosCompletados ?? 0) + total
    const newAciertos = (existing?.aciertos ?? 0) + aciertos
    const dominio = newCompleted > 0 ? Math.min(100, Math.round((newAciertos / newCompleted) * 100)) : 0

    return prisma.progressRecord.upsert({
      where: { userId_unitId: { userId, unitId } },
      create: { userId, unitId, ejerciciosCompletados: total, aciertos, dominio, ultimaPractica: new Date() },
      update: { ejerciciosCompletados: newCompleted, aciertos: newAciertos, dominio, ultimaPractica: new Date() },
    })
  },
}
